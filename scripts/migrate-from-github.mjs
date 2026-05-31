#!/usr/bin/env node
/**
 * Importe les photos depuis GitHub / le site web vers Cloudinary (upload par URL).
 *
 * Usage :
 *   CLOUDINARY_CLOUD_NAME=duvuxd5kh \
 *   CLOUDINARY_API_KEY=xxx \
 *   CLOUDINARY_API_SECRET=xxx \
 *   CLOUDINARY_FOLDER=benoitdepagnier \
 *   node scripts/migrate-from-github.mjs
 *
 * Optionnel :
 *   MIGRATE_SOURCE_BASE=https://benoitdepagnier.ch   (défaut)
 *   GITHUB_REPO=benxvii/benoitdepagnier              (défaut)
 *   MIGRATE_GALLERY=street-photography               (une seule galerie pour tester)
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
const cloudFolder = process.env.CLOUDINARY_FOLDER?.trim();
const sourceBase = (
  process.env.MIGRATE_SOURCE_BASE ?? "https://benoitdepagnier.ch"
).replace(/\/$/, "");
const githubRepo = process.env.GITHUB_REPO ?? "benxvii/benoitdepagnier";
const singleGallery = process.env.MIGRATE_GALLERY?.trim();

for (const [name, value] of [
  ["CLOUDINARY_CLOUD_NAME", cloudName],
  ["CLOUDINARY_API_KEY", apiKey],
  ["CLOUDINARY_API_SECRET", apiSecret],
  ["CLOUDINARY_FOLDER", cloudFolder],
]) {
  if (!value) {
    console.error(`Variable manquante : ${name}`);
    process.exit(1);
  }
}

const apiBase = `https://api.cloudinary.com/v1_1/${cloudName}`;
const imagePattern = /\.(jpe?g|png|webp|gif|avif)$/i;

function signUploadParams(params, secret) {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(serialized + secret).digest("hex");
}

function loadGallerySlugs() {
  const metaPath = path.join(__dirname, "galleries-meta.json");
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const slugs = Object.keys(meta);
  return singleGallery ? slugs.filter((slug) => slug === singleGallery) : slugs;
}

async function listFilesOnGithub(gallerySlug) {
  const repoPath = `public/portfolio/${gallerySlug}`;
  const url = `https://api.github.com/repos/${githubRepo}/contents/${repoPath}`;

  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (response.status === 404) {
    console.warn(`  GitHub : dossier absent → ${repoPath}`);
    return [];
  }

  if (!response.ok) {
    throw new Error(`GitHub ${response.status} pour ${repoPath}`);
  }

  const items = await response.json();
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item.type === "file" && imagePattern.test(item.name))
    .map((item) => item.name)
    .sort();
}

async function uploadFromUrl(remoteUrl, cloudinaryFolder, publicId) {
  const timestamp = Math.round(Date.now() / 1000);
  const uploadParams = {
    timestamp,
    folder: cloudinaryFolder,
    public_id: publicId,
    overwrite: "true",
  };
  const signature = signUploadParams(uploadParams, apiSecret);

  const form = new FormData();
  form.append("file", remoteUrl);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", cloudinaryFolder);
  form.append("public_id", publicId);
  form.append("overwrite", "true");
  form.append("signature", signature);

  const response = await fetch(`${apiBase}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${publicId} (${response.status}) : ${text}`);
  }

  return response.json();
}

async function migrateGallery(gallerySlug) {
  const cloudinaryFolder = `${cloudFolder}/portfolio/${gallerySlug}`;
  const files = await listFilesOnGithub(gallerySlug);

  if (files.length === 0) {
    console.log(`  (aucun fichier image)`);
    return { uploaded: 0, failed: 0 };
  }

  let uploaded = 0;
  let failed = 0;

  for (const filename of files) {
    const remoteUrl = `${sourceBase}/portfolio/${gallerySlug}/${filename}`;
    const publicId = filename.replace(/\.[^.]+$/, "");

    process.stdout.write(`  ${filename} … `);

    try {
      const result = await uploadFromUrl(remoteUrl, cloudinaryFolder, publicId);
      console.log(`OK → ${result.public_id}`);
      uploaded += 1;
    } catch (error) {
      console.log("ERREUR");
      console.error(`    ${error instanceof Error ? error.message : error}`);
      failed += 1;
    }
  }

  return { uploaded, failed };
}

async function main() {
  const slugs = loadGallerySlugs();

  if (slugs.length === 0) {
    console.error(
      singleGallery
        ? `Galerie inconnue : ${singleGallery}`
        : "Aucune galerie dans galleries-meta.json",
    );
    process.exit(1);
  }

  console.log(`Source web  : ${sourceBase}/portfolio/…`);
  console.log(`Liste GitHub  : ${githubRepo}`);
  console.log(`Destination   : ${cloudFolder}/portfolio/…\n`);

  let totalUploaded = 0;
  let totalFailed = 0;

  for (const slug of slugs) {
    console.log(`→ ${slug}`);
    const { uploaded, failed } = await migrateGallery(slug);
    totalUploaded += uploaded;
    totalFailed += failed;
    console.log("");
  }

  console.log(`Terminé : ${totalUploaded} upload(s), ${totalFailed} erreur(s).`);

  if (totalUploaded > 0) {
    console.log("\nProchaine étape : lance le workflow « Sync galleries from Cloudinary » sur GitHub.");
  }

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
