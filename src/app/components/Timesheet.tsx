import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router";
import { timesheetSupabase } from "../../lib/supabase-timesheet";
import { cn } from "../../lib/cn";
import { useTimesheetAuth } from "../../hooks/useTimesheetAuth";
import {
  compareText,
  formatDateFR,
  formatDateFRFromISO,
  formatHHMM,
  formatTime,
  getWeekStart,
  monthLabel,
  parseDateUTC,
} from "../../lib/timesheet-format";
import TimesheetEntryForm, {
  type NewTimesheetEntryInput,
} from "./TimesheetEntryForm";

export interface TimesheetEntry {
  id: string;
  user_id: string | null;
  entry_date: string; // "YYYY-MM-DD"
  project: string;
  project_type: string | null;
  task: string;
  start_time: string | null; // "HH:MM:SS"
  end_time: string | null;
  duration_minutes: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

type TabId =
  | "detail"
  | "project"
  | "week"
  | "month"
  | "week-project"
  | "month-project";

const TABS: { id: TabId; label: string }[] = [
  { id: "detail", label: "Détail" },
  { id: "project", label: "Total par projet" },
  { id: "week", label: "Total par semaine" },
  { id: "month", label: "Total par mois" },
  { id: "week-project", label: "Croisé semaine / projet" },
  { id: "month-project", label: "Croisé mois / projet" },
];

const thClass =
  "px-4 py-2 font-medium text-left whitespace-nowrap";
const tdClass = "px-4 py-2 whitespace-nowrap";
const totalRowClass = "font-medium border-t-2 border-gray-200";

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto border border-gray-100 rounded-lg">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

type DetailSortColumn =
  | "project"
  | "project_type"
  | "task"
  | "entry_date"
  | "start_time"
  | "end_time"
  | "duration_minutes"
  | "comment";
type SortDirection = "asc" | "desc";

const DETAIL_COLUMNS: {
  id: DetailSortColumn;
  label: string;
  align: "left" | "center";
}[] = [
  { id: "project", label: "Nom du projet", align: "left" },
  { id: "project_type", label: "Type de projet", align: "left" },
  { id: "task", label: "Détail de la tâche", align: "left" },
  { id: "entry_date", label: "Date", align: "left" },
  { id: "start_time", label: "Heure de début", align: "center" },
  { id: "end_time", label: "Heure de fin", align: "center" },
  { id: "duration_minutes", label: "Temps passé", align: "center" },
  { id: "comment", label: "Commentaire", align: "left" },
];

// Affiche "–" pour les entrées existantes dont project_type est vide (NULL).
function formatProjectType(value: string | null): string {
  return value ?? "–";
}

function compareDetailColumn(
  a: TimesheetEntry,
  b: TimesheetEntry,
  column: DetailSortColumn,
): number {
  switch (column) {
    case "project":
      return compareText(a.project, b.project);
    case "project_type":
      return compareText(a.project_type ?? "", b.project_type ?? "");
    case "task":
      return compareText(a.task, b.task);
    case "entry_date":
      return a.entry_date.localeCompare(b.entry_date);
    case "start_time":
      return (a.start_time ?? "").localeCompare(b.start_time ?? "");
    case "end_time":
      return (a.end_time ?? "").localeCompare(b.end_time ?? "");
    case "duration_minutes":
      return a.duration_minutes - b.duration_minutes;
    case "comment":
      return compareText(a.comment ?? "", b.comment ?? "");
  }
}

function SortableHeader({
  label,
  column,
  activeColumn,
  direction,
  onSort,
  align,
}: {
  label: string;
  column: DetailSortColumn;
  activeColumn: DetailSortColumn;
  direction: SortDirection;
  onSort: (column: DetailSortColumn) => void;
  align: "left" | "center";
}) {
  const isActive = column === activeColumn;
  return (
    <th
      className={cn(thClass, "align-top", align === "center" && "text-center")}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "flex items-center gap-1 hover:text-gray-700",
          align === "center" && "justify-center w-full",
        )}
      >
        {label}
        <span className="text-[10px] w-3 inline-block">
          {isActive ? (direction === "asc" ? "▲" : "▼") : ""}
        </span>
      </button>
    </th>
  );
}

function DetailTable({ entries }: { entries: TimesheetEntry[] }) {
  const [sortColumn, setSortColumn] = useState<DetailSortColumn>("entry_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (column: DetailSortColumn) => {
    if (column === sortColumn) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) =>
      compareDetailColumn(a, b, sortColumn),
    );
    if (sortDirection === "desc") sorted.reverse();
    return sorted;
  }, [entries, sortColumn, sortDirection]);

  const total = useMemo(
    () => entries.reduce((sum, e) => sum + e.duration_minutes, 0),
    [entries],
  );

  if (entries.length === 0) {
    return <p className="text-sm text-gray-500">Aucune entrée.</p>;
  }

  return (
    <TableShell>
      <thead>
        <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
          {DETAIL_COLUMNS.map((col) => (
            <SortableHeader
              key={col.id}
              label={col.label}
              column={col.id}
              activeColumn={sortColumn}
              direction={sortDirection}
              onSort={handleSort}
              align={col.align}
            />
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedEntries.map((entry) => (
          <tr key={entry.id} className="border-b border-gray-100">
            <td className={cn(tdClass, "align-top")}>{entry.project}</td>
            <td className={cn(tdClass, "align-top")}>
              {formatProjectType(entry.project_type)}
            </td>
            <td className={cn(tdClass, "align-top whitespace-normal")}>
              {entry.task}
            </td>
            <td className={cn(tdClass, "align-top")}>
              {formatDateFRFromISO(entry.entry_date)}
            </td>
            <td className={cn(tdClass, "align-top text-center")}>
              {formatTime(entry.start_time)}
            </td>
            <td className={cn(tdClass, "align-top text-center")}>
              {formatTime(entry.end_time)}
            </td>
            <td className={cn(tdClass, "align-top text-center")}>
              {formatHHMM(entry.duration_minutes)}
            </td>
            <td
              className={cn(
                tdClass,
                "align-top whitespace-normal text-gray-500",
              )}
            >
              {entry.comment ?? ""}
            </td>
          </tr>
        ))}
        <tr className={totalRowClass}>
          <td className={cn(tdClass, "align-top")} colSpan={6}>
            Total
          </td>
          <td className={cn(tdClass, "align-top text-center")}>
            {formatHHMM(total)}
          </td>
          <td className={cn(tdClass, "align-top")}></td>
        </tr>
      </tbody>
    </TableShell>
  );
}

function ProjectTotalsTable({
  totals,
}: {
  totals: { project: string; minutes: number }[];
}) {
  const grandTotal = useMemo(
    () => totals.reduce((sum, t) => sum + t.minutes, 0),
    [totals],
  );

  if (totals.length === 0) {
    return <p className="text-sm text-gray-500">Aucune entrée.</p>;
  }

  return (
    <TableShell>
      <thead>
        <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
          <th className={thClass}>Projet</th>
          <th className={thClass}>Temps total</th>
        </tr>
      </thead>
      <tbody>
        {totals.map((t) => (
          <tr key={t.project} className="border-b border-gray-100">
            <td className={tdClass}>{t.project}</td>
            <td className={tdClass}>{formatHHMM(t.minutes)}</td>
          </tr>
        ))}
        <tr className={totalRowClass}>
          <td className={tdClass}>Total</td>
          <td className={tdClass}>{formatHHMM(grandTotal)}</td>
        </tr>
      </tbody>
    </TableShell>
  );
}

function PeriodTotalsTable({
  rows,
}: {
  rows: { label: string; minutes: number }[];
}) {
  const grandTotal = useMemo(
    () => rows.reduce((sum, r) => sum + r.minutes, 0),
    [rows],
  );

  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">Aucune entrée.</p>;
  }

  return (
    <TableShell>
      <thead>
        <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
          <th className={thClass}>Période</th>
          <th className={thClass}>Temps total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="border-b border-gray-100">
            <td className={tdClass}>{r.label}</td>
            <td className={tdClass}>{formatHHMM(r.minutes)}</td>
          </tr>
        ))}
        <tr className={totalRowClass}>
          <td className={tdClass}>Total</td>
          <td className={tdClass}>{formatHHMM(grandTotal)}</td>
        </tr>
      </tbody>
    </TableShell>
  );
}

function CrossTable({
  rows,
  projects,
}: {
  rows: { label: string; totals: Map<string, number> }[];
  projects: string[];
}) {
  const columnTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) {
      const sum = rows.reduce(
        (acc, row) => acc + (row.totals.get(project) ?? 0),
        0,
      );
      map.set(project, sum);
    }
    return map;
  }, [rows, projects]);

  const grandTotal = useMemo(
    () => [...columnTotals.values()].reduce((sum, m) => sum + m, 0),
    [columnTotals],
  );

  if (rows.length === 0 || projects.length === 0) {
    return <p className="text-sm text-gray-500">Aucune entrée.</p>;
  }

  return (
    <TableShell>
      <thead>
        <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
          <th className={thClass}></th>
          {projects.map((project) => (
            <th key={project} className={thClass}>
              {project}
            </th>
          ))}
          <th className={thClass}>Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const rowTotal = projects.reduce(
            (sum, project) => sum + (row.totals.get(project) ?? 0),
            0,
          );
          return (
            <tr key={row.label} className="border-b border-gray-100">
              <td className={tdClass}>{row.label}</td>
              {projects.map((project) => (
                <td key={project} className={tdClass}>
                  {formatHHMM(row.totals.get(project) ?? 0)}
                </td>
              ))}
              <td className={cn(tdClass, "font-medium")}>
                {formatHHMM(rowTotal)}
              </td>
            </tr>
          );
        })}
        <tr className={totalRowClass}>
          <td className={tdClass}>Total</td>
          {projects.map((project) => (
            <td key={project} className={tdClass}>
              {formatHHMM(columnTotals.get(project) ?? 0)}
            </td>
          ))}
          <td className={tdClass}>{formatHHMM(grandTotal)}</td>
        </tr>
      </tbody>
    </TableShell>
  );
}

export default function Timesheet() {
  const { user, loading, signOut } = useTimesheetAuth();

  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("detail");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [projectTypeFilter, setProjectTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    if (!user) return;

    setEntriesLoading(true);
    setEntriesError(null);

    // RLS filtre déjà sur auth.uid() côté serveur, pas besoin de
    // refiltrer sur user_id côté client.
    const { data, error } = await timesheetSupabase
      .from("timesheet_entries")
      .select("*")
      .order("entry_date", { ascending: true });

    if (error) {
      setEntriesError(error.message);
    } else {
      setEntries((data ?? []) as TimesheetEntry[]);
    }
    setEntriesLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleAddEntry = useCallback(
    async (data: NewTimesheetEntryInput): Promise<{ error: string | null }> => {
      if (!user) return { error: "Non connecté." };

      const { error } = await timesheetSupabase
        .from("timesheet_entries")
        .insert({ ...data, user_id: user.id });

      if (error) return { error: error.message };

      await loadEntries();
      setShowForm(false);
      setToastMessage("Entrée ajoutée.");
      return { error: null };
    },
    [user, loadEntries],
  );

  // Liste des projets distincts calculée sur l'ensemble des données (pas
  // sur les lignes déjà filtrées), pour garder la liste déroulante stable
  // quel que soit le filtre de dates en cours.
  const distinctProjects = useMemo(
    () => [...new Set(entries.map((e) => e.project))].sort(compareText),
    [entries],
  );

  // Idem pour les types de projet distincts (colonne project_type,
  // nullable : on ignore les valeurs vides pour la liste des options).
  const distinctProjectTypes = useMemo(
    () =>
      [
        ...new Set(
          entries
            .map((e) => e.project_type)
            .filter((t): t is string => Boolean(t)),
        ),
      ].sort(compareText),
    [entries],
  );

  // Filtres (date de début / fin, projet, type de projet) appliqués à
  // tous les onglets.
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (dateFrom && e.entry_date < dateFrom) return false;
      if (dateTo && e.entry_date > dateTo) return false;
      if (projectFilter !== "all" && e.project !== projectFilter) return false;
      if (
        projectTypeFilter !== "all" &&
        e.project_type !== projectTypeFilter
      )
        return false;
      return true;
    });
  }, [entries, dateFrom, dateTo, projectFilter, projectTypeFilter]);

  const projectTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of filteredEntries) {
      map.set(e.project, (map.get(e.project) ?? 0) + e.duration_minutes);
    }
    return [...map.entries()]
      .map(([project, minutes]) => ({ project, minutes }))
      .sort((a, b) => compareText(a.project, b.project));
  }, [filteredEntries]);

  const projectOrder = useMemo(
    () => projectTotals.map((t) => t.project),
    [projectTotals],
  );

  const weeklyTotals = useMemo(() => {
    const map = new Map<string, { weekStart: Date; minutes: number }>();
    for (const e of filteredEntries) {
      const weekStart = getWeekStart(parseDateUTC(e.entry_date));
      const key = weekStart.toISOString().slice(0, 10);
      const existing = map.get(key);
      if (existing) existing.minutes += e.duration_minutes;
      else map.set(key, { weekStart, minutes: e.duration_minutes });
    }
    return [...map.values()].sort(
      (a, b) => b.weekStart.getTime() - a.weekStart.getTime(),
    );
  }, [filteredEntries]);

  const monthlyTotals = useMemo(() => {
    const map = new Map<string, { year: number; month: number; minutes: number }>();
    for (const e of filteredEntries) {
      const [y, m] = e.entry_date.split("-").map(Number);
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const existing = map.get(key);
      if (existing) existing.minutes += e.duration_minutes;
      else map.set(key, { year: y, month: m, minutes: e.duration_minutes });
    }
    return [...map.values()].sort(
      (a, b) => b.year - a.year || b.month - a.month,
    );
  }, [filteredEntries]);

  const weekProjectCross = useMemo(() => {
    const map = new Map<string, { weekStart: Date; totals: Map<string, number> }>();
    for (const e of filteredEntries) {
      const weekStart = getWeekStart(parseDateUTC(e.entry_date));
      const key = weekStart.toISOString().slice(0, 10);
      let row = map.get(key);
      if (!row) {
        row = { weekStart, totals: new Map() };
        map.set(key, row);
      }
      row.totals.set(
        e.project,
        (row.totals.get(e.project) ?? 0) + e.duration_minutes,
      );
    }
    return [...map.values()]
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
      .map((row) => ({
        label: `sem. du ${formatDateFR(row.weekStart)}`,
        totals: row.totals,
      }));
  }, [filteredEntries]);

  const monthProjectCross = useMemo(() => {
    const map = new Map<
      string,
      { year: number; month: number; totals: Map<string, number> }
    >();
    for (const e of filteredEntries) {
      const [y, m] = e.entry_date.split("-").map(Number);
      const key = `${y}-${String(m).padStart(2, "0")}`;
      let row = map.get(key);
      if (!row) {
        row = { year: y, month: m, totals: new Map() };
        map.set(key, row);
      }
      row.totals.set(
        e.project,
        (row.totals.get(e.project) ?? 0) + e.duration_minutes,
      );
    }
    return [...map.values()]
      .sort((a, b) => b.year - a.year || b.month - a.month)
      .map((row) => ({
        label: monthLabel(row.year, row.month),
        totals: row.totals,
      }));
  }, [filteredEntries]);

  const weeklyRows = useMemo(
    () =>
      weeklyTotals.map((w) => ({
        label: `sem. du ${formatDateFR(w.weekStart)}`,
        minutes: w.minutes,
      })),
    [weeklyTotals],
  );

  const monthlyRows = useMemo(
    () =>
      monthlyTotals.map((m) => ({
        label: monthLabel(m.year, m.month),
        minutes: m.minutes,
      })),
    [monthlyTotals],
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-sm text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/timesheet/login" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-light mb-8">Timesheet</h1>

      <div className="flex items-center justify-between max-w-sm border border-gray-100 rounded-lg px-4 py-3 mb-8">
        <p className="text-sm text-gray-600">
          Connecté en tant que {user.email}
        </p>
        <button
          type="button"
          onClick={() => signOut()}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Se déconnecter
        </button>
      </div>

      <div className="mb-6">
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm rounded-md bg-[var(--brand)] text-white hover:opacity-90 transition-opacity"
          >
            + Nouvelle entrée
          </button>
        )}
      </div>

      {showForm && (
        <TimesheetEntryForm
          projects={distinctProjects}
          projectTypes={distinctProjectTypes}
          onSubmit={handleAddEntry}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label
            htmlFor="timesheet-date-from"
            className="block text-xs text-gray-500 mb-1"
          >
            Du
          </label>
          <input
            id="timesheet-date-from"
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div>
          <label
            htmlFor="timesheet-date-to"
            className="block text-xs text-gray-500 mb-1"
          >
            Au
          </label>
          <input
            id="timesheet-date-to"
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div>
          <label
            htmlFor="timesheet-project-filter"
            className="block text-xs text-gray-500 mb-1"
          >
            Nom du projet
          </label>
          <select
            id="timesheet-project-filter"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
          >
            <option value="all">Tous</option>
            {distinctProjects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="timesheet-project-type-filter"
            className="block text-xs text-gray-500 mb-1"
          >
            Type de projet
          </label>
          <select
            id="timesheet-project-type-filter"
            value={projectTypeFilter}
            onChange={(event) => setProjectTypeFilter(event.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
          >
            <option value="all">Tous</option>
            {distinctProjectTypes.map((projectType) => (
              <option key={projectType} value={projectType}>
                {projectType}
              </option>
            ))}
          </select>
        </div>

        {(dateFrom ||
          dateTo ||
          projectFilter !== "all" ||
          projectTypeFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setProjectFilter("all");
              setProjectTypeFilter("all");
            }}
            className="text-xs text-gray-500 hover:text-gray-700 underline pb-2"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full border transition-colors",
              activeTab === tab.id
                ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                : "border-gray-200 text-gray-600 hover:border-gray-300",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {entriesLoading ? (
        <p className="text-sm text-gray-500">Chargement des entrées...</p>
      ) : entriesError ? (
        <p className="text-sm text-red-600">{entriesError}</p>
      ) : (
        <>
          {activeTab === "detail" && <DetailTable entries={filteredEntries} />}
          {activeTab === "project" && (
            <ProjectTotalsTable totals={projectTotals} />
          )}
          {activeTab === "week" && <PeriodTotalsTable rows={weeklyRows} />}
          {activeTab === "month" && <PeriodTotalsTable rows={monthlyRows} />}
          {activeTab === "week-project" && (
            <CrossTable rows={weekProjectCross} projects={projectOrder} />
          )}
          {activeTab === "month-project" && (
            <CrossTable rows={monthProjectCross} projects={projectOrder} />
          )}
        </>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[var(--brand)] text-white text-sm px-4 py-2 rounded-md shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
