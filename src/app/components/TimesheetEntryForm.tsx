import { useState, type FormEvent } from "react";
import { formatHHMM, parseHHMM, timeToMinutes } from "../../lib/timesheet-format";

export interface NewTimesheetEntryInput {
  project: string;
  project_type: string | null;
  task: string;
  entry_date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  comment: string | null;
}

interface TimesheetEntryFormProps {
  projects: string[];
  projectTypes: string[];
  onSubmit: (data: NewTimesheetEntryInput) => Promise<{ error: string | null }>;
  onCancel: () => void;
}

const NEW_PROJECT_VALUE = "__new__";
const NO_PROJECT_TYPE_VALUE = "";
const NEW_PROJECT_TYPE_VALUE = "__new__";

export default function TimesheetEntryForm({
  projects,
  projectTypes,
  onSubmit,
  onCancel,
}: TimesheetEntryFormProps) {
  const [selectedProject, setSelectedProject] = useState(
    projects.length > 0 ? projects[0] : NEW_PROJECT_VALUE,
  );
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedProjectType, setSelectedProjectType] = useState(
    NO_PROJECT_TYPE_VALUE,
  );
  const [newProjectTypeName, setNewProjectTypeName] = useState("");
  const [task, setTask] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [manualDuration, setManualDuration] = useState("");
  const [comment, setComment] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isNewProject = selectedProject === NEW_PROJECT_VALUE;
  const isNewProjectType = selectedProjectType === NEW_PROJECT_TYPE_VALUE;
  const bothTimesFilled = startTime !== "" && endTime !== "";

  // Session à cheval sur minuit (ex. début 22:00, fin 01:00) : si l'heure
  // de fin est antérieure à l'heure de début, on ajoute 24h à l'heure de
  // fin avant de soustraire. La date enregistrée reste celle du champ
  // Date (date de début de session), pas besoin de case à cocher.
  const autoDurationMinutes = bothTimesFilled
    ? (() => {
        const start = timeToMinutes(startTime);
        const end = timeToMinutes(endTime);
        return end < start ? end + 24 * 60 - start : end - start;
      })()
    : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const project = isNewProject ? newProjectName.trim() : selectedProject;
    // Type de projet optionnel : "" (Aucun) ou "Nouveau type…" laissé vide
    // deviennent tous les deux null.
    const projectType = isNewProjectType
      ? newProjectTypeName.trim() || null
      : selectedProjectType || null;
    const trimmedTask = task.trim();

    if (!project) {
      setError("Le projet est obligatoire.");
      return;
    }
    if (!trimmedTask) {
      setError("Le détail de la tâche est obligatoire.");
      return;
    }
    if (!entryDate) {
      setError("La date est obligatoire.");
      return;
    }

    let durationMinutes: number;

    if (bothTimesFilled) {
      // autoDurationMinutes gère déjà le passage de minuit (voir plus haut),
      // il ne peut donc pas être négatif ici.
      durationMinutes = autoDurationMinutes ?? 0;
    } else {
      const parsed = parseHHMM(manualDuration);
      if (parsed === null) {
        setError(
          "Renseignez soit les deux heures (début et fin), soit un temps passé au format hh:mm.",
        );
        return;
      }
      durationMinutes = parsed;
    }

    setSubmitting(true);
    const { error: submitError } = await onSubmit({
      project,
      project_type: projectType,
      task: trimmedTask,
      entry_date: entryDate,
      start_time: startTime || null,
      end_time: endTime || null,
      duration_minutes: durationMinutes,
      comment: comment.trim() || null,
    });
    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    // Réinitialisation après succès (le panneau est fermé par le parent).
    setSelectedProject(projects.length > 0 ? projects[0] : NEW_PROJECT_VALUE);
    setNewProjectName("");
    setSelectedProjectType(NO_PROJECT_TYPE_VALUE);
    setNewProjectTypeName("");
    setTask("");
    setEntryDate("");
    setStartTime("");
    setEndTime("");
    setManualDuration("");
    setComment("");
  };

  return (
    <div className="border border-gray-100 rounded-lg p-6 mb-8">
      <h2 className="text-lg font-medium mb-4">Nouvelle entrée</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="entry-project"
              className="block text-xs text-gray-500 mb-1"
            >
              Projet
            </label>
            <select
              id="entry-project"
              value={selectedProject}
              onChange={(event) => setSelectedProject(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
            >
              {projects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
              <option value={NEW_PROJECT_VALUE}>Nouveau projet…</option>
            </select>
            {isNewProject && (
              <input
                type="text"
                required
                autoFocus
                placeholder="Nom du nouveau projet"
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
                className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
              />
            )}
          </div>

          <div>
            <label
              htmlFor="entry-project-type"
              className="block text-xs text-gray-500 mb-1"
            >
              Type de projet
            </label>
            <select
              id="entry-project-type"
              value={selectedProjectType}
              onChange={(event) => setSelectedProjectType(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
            >
              <option value={NO_PROJECT_TYPE_VALUE}>Aucun</option>
              {projectTypes.map((projectType) => (
                <option key={projectType} value={projectType}>
                  {projectType}
                </option>
              ))}
              <option value={NEW_PROJECT_TYPE_VALUE}>Nouveau type…</option>
            </select>
            {isNewProjectType && (
              <input
                type="text"
                autoFocus
                placeholder="Nom du nouveau type"
                value={newProjectTypeName}
                onChange={(event) => setNewProjectTypeName(event.target.value)}
                className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
              />
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="entry-task"
            className="block text-xs text-gray-500 mb-1"
          >
            Détail de la tâche
          </label>
          <input
            id="entry-task"
            type="text"
            required
            value={task}
            onChange={(event) => setTask(event.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="entry-date"
              className="block text-xs text-gray-500 mb-1"
            >
              Date
            </label>
            <input
              id="entry-date"
              type="date"
              required
              value={entryDate}
              onChange={(event) => setEntryDate(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div>
            <label
              htmlFor="entry-start-time"
              className="block text-xs text-gray-500 mb-1"
            >
              Heure de début
            </label>
            <input
              id="entry-start-time"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div>
            <label
              htmlFor="entry-end-time"
              className="block text-xs text-gray-500 mb-1"
            >
              Heure de fin
            </label>
            <input
              id="entry-end-time"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="entry-duration"
            className="block text-xs text-gray-500 mb-1"
          >
            Temps passé
          </label>
          {bothTimesFilled ? (
            <input
              id="entry-duration"
              type="text"
              readOnly
              value={
                autoDurationMinutes !== null && autoDurationMinutes >= 0
                  ? formatHHMM(autoDurationMinutes)
                  : ""
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-500"
            />
          ) : (
            <input
              id="entry-duration"
              type="text"
              placeholder="hh:mm"
              value={manualDuration}
              onChange={(event) => setManualDuration(event.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)]"
            />
          )}
          <p className="text-xs text-gray-400 mt-1">
            {bothTimesFilled
              ? "Calculé automatiquement à partir des heures de début et de fin."
              : "Renseignez les deux heures ci-dessus, ou saisissez le temps passé au format hh:mm."}
          </p>
        </div>

        <div>
          <label
            htmlFor="entry-comment"
            className="block text-xs text-gray-500 mb-1"
          >
            Commentaire
          </label>
          <textarea
            id="entry-comment"
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[var(--brand)] resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-[var(--brand)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Ajout..." : "Ajouter l'entrée"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border border-gray-200 text-gray-600 hover:border-gray-300"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
