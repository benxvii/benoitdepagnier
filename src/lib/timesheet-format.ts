// Helpers de formatage partagés entre les composants /timesheet
// (Timesheet.tsx et TimesheetEntryForm.tsx). Isolés ici pour éviter un
// import circulaire entre les deux fichiers.

export const MOIS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export function formatHHMM(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? "-" : "";
  const abs = Math.round(Math.abs(totalMinutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDateFRFromISO(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function formatTime(time: string | null): string {
  if (!time) return "–";
  return time.slice(0, 5);
}

export function parseDateUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function getWeekStart(dateUTC: Date): Date {
  const day = dateUTC.getUTCDay(); // 0 (dim.) - 6 (sam.)
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(dateUTC);
  monday.setUTCDate(dateUTC.getUTCDate() + diff);
  return monday;
}

export function formatDateFR(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
}

export function monthLabel(year: number, month: number): string {
  return `${MOIS_FR[month - 1]} ${year}`;
}

// Comparateur de texte unique pour tous les tris alphabétiques /timesheet
// (filtres, colonnes triables, onglet "Total par projet"...). Locale "fr"
// + sensitivity "base" : insensible à la casse et aux accents, pour que
// "Alpha", "alpha" et "Àlpha" soient triés ensemble au même endroit plutôt
// que de casser l'ordre alphabétique global.
export function compareText(a: string, b: string): number {
  return a.localeCompare(b, "fr", { sensitivity: "base" });
}

// Convertit "HH:MM" en minutes depuis minuit.
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Parse une saisie manuelle "hh:mm" (heures sur 1 à 3 chiffres) en minutes.
// Retourne null si le format est invalide.
export function parseHHMM(value: string): number | null {
  const match = /^(\d{1,3}):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}
