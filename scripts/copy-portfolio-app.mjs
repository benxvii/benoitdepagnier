import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(
  root,
  "..",
  "Portfolio",
  "Code_Python",
  "dist",
  "PortfolioApp.exe",
);
const destDir = path.join(root, "public", "downloads");
const dest = path.join(destDir, "PortfolioApp.exe");

if (!fs.existsSync(src)) {
  console.error(`Fichier source introuvable :\n  ${src}`);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log(`Copié → ${dest} (${fs.statSync(dest).size} octets)`);
