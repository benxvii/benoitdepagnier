#!/usr/bin/env node
/**
 * Synchronise les galeries portfolio depuis Cloudinary vers benoitdepagnier/_galleries.json.
 *
 * Usage local :
 *   CLOUDINARY_CLOUD_NAME=xxx \
 *   CLOUDINARY_API_KEY=xxx \
 *   CLOUDINARY_API_SECRET=xxx \
 *   CLOUDINARY_FOLDER=benoitdepagnier \
 *   node scripts/sync-galleries.mjs
 *
 * Titres des galeries : scripts/galleries-meta.json (slug relatif à portfolio/)
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudFolder = process.env.CLOUDINARY_FOLDER;

function requireEnv(name, value) {
  if (!value?.trim()) {
    console.error(`Variable d'environnement manquante : ${name}`);
    process.exit(1);
  }
  return value.trim();
}

requireEnv("CLOUDINARY_CLOUD_NAME", cloudName);
requireEnv("CLOUDINARY_API_KEY", apiKey);
requireEnv("CLOUDINARY_API_SECRET", apiSecret);
requireEnv("CLOUDINARY_FOLDER", cloudFolder);

const authHeader =
  "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
const apiBase = `https://api.cloudinary.com/v1_1/${cloudName}`;

async function cloudinaryPost(endpoint, body) {
  const response = await fetch(`${apiBase}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`POST ${endpoint} (${response.status}) : ${text}`);
  }

  return response.json();
}

function signUploadParams(params, secret) {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(serialized + secret).digest("hex");
}

function loadGalleriesMeta() {
  const metaPath = path.join(__dirname, "galleries-meta.json");
  if (!fs.existsSync(metaPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(metaPath, "utf8"));
}

function humanizeTitle(slug) {
  const segment = slug.split("/").pop() ?? slug;
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function slugFromFolder(folderPath, rootFolder) {
  const prefix = `${rootFolder}/portfolio/`;
  if (!folderPath.startsWith(prefix)) {
    return folderPath.replace(`${rootFolder}/`, "");
  }
  return folderPath.slice(prefix.length);
}

function folderFromPublicId(publicId) {
  const lastSlash = publicId.lastIndexOf("/");
  return lastSlash === -1 ? "" : publicId.slice(0, lastSlash);
}

function resolveResourceFolder(resource) {
  return resource.asset_folder || resource.folder || folderFromPublicId(resource.public_id);
}

function isGalleryImage(resource, rootFolder) {
  if (resource.resource_type !== "image") return false;

  const publicId = resource.public_id ?? "";
  if (publicId.endsWith("/_galleries") || publicId.endsWith("_galleries") || publicId.endsWith("_galleries.json")) {
    return false;
  }

  const folder = resolveResourceFolder(resource);
  return folder.startsWith(`${rootFolder}/portfolio/`);
}

async function fetchAllPortfolioImages(portfolioRoot) {
  const images = [];
  let nextCursor;

  do {
    const body = {
      expression: `folder:${portfolioRoot}/*`,
      max_results: 500,
      sort_by: [{ public_id: "asc" }],
    };

    if (nextCursor) {
      body.next_cursor = nextCursor;
    }

    const result = await cloudinaryPost("/resources/search", body);
    for (const resource of result.resources ?? []) {
      if (isGalleryImage(resource, cloudFolder)) {
        images.push(resource);
      }
    }
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return images;
}

function groupImagesByFolder(resources) {
  const groups = new Map();

  for (const resource of resources) {
    const folderPath = resolveResourceFolder(resource);
    if (!groups.has(folderPath)) {
      groups.set(folderPath, []);
    }

    groups.get(folderPath).push({
      publicId: resource.public_id,
      width: resource.width ?? 0,
      height: resource.height ?? 0,
    });
  }

  for (const images of groups.values()) {
    images.sort((a, b) => a.publicId.localeCompare(b.publicId));
  }

  return groups;
}

async function uploadManifest(manifest) {
  const publicId = `${cloudFolder}/_galleries.json`;
  const timestamp = Math.round(Date.now() / 1000);
  const uploadParams = {
    timestamp,
    public_id: publicId,
    overwrite: "true",
    invalidate: "true",
  };
  const signature = signUploadParams(uploadParams, apiSecret);
  const json = JSON.stringify(manifest, null, 2);

  const form = new FormData();
  form.append(
    "file",
    new Blob([json], { type: "application/json" }),
    "_galleries.json",
  );
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("public_id", publicId);
  form.append("overwrite", "true");
  form.append("invalidate", "true");
  form.append("signature", signature);

  const response = await fetch(`${apiBase}/raw/upload`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload raw (${response.status}) : ${text}`);
  }

  return response.json();
}

async function verifyManifestUrl(url) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, { cache: "no-store" });
    if (response.ok) return;
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }

  throw new Error(`Manifest inaccessible après upload : ${url}`);
}

function writeLocalManifest(manifest) {
  const outputPath = path.join(__dirname, "..", "public", "_galleries.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`  local     : public/_galleries.json`);
}

async function main() {
  const meta = loadGalleriesMeta();
  const portfolioRoot = `${cloudFolder}/portfolio`;

  console.log(`Scan Cloudinary : ${portfolioRoot}/*`);

  const resources = await fetchAllPortfolioImages(portfolioRoot);
  const grouped = groupImagesByFolder(resources);

  const galleries = [...grouped.entries()]
    .map(([folderPath, images]) => {
      const slug = slugFromFolder(folderPath, cloudFolder);
      const title = meta[slug]?.title ?? humanizeTitle(slug);

      return { slug, title, folder: folderPath, images };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const manifest = {
    generatedAt: new Date().toISOString(),
    cloudFolder,
    galleries,
  };

  const imageCount = galleries.reduce(
    (total, gallery) => total + gallery.images.length,
    0,
  );

  console.log(`${galleries.length} galerie(s), ${imageCount} image(s).`);

  if (galleries.length === 0) {
    console.warn(
      "Aucune image trouvée. Vérifie la structure Cloudinary (ex. benoitdepagnier/portfolio/street-photography/photo.jpg).",
    );
  }

  const uploadResult = await uploadManifest(manifest);
  writeLocalManifest(manifest);

  const deliveryUrl = uploadResult.secure_url;
  await verifyManifestUrl(deliveryUrl);

  console.log("Manifest uploadé :");
  console.log(`  public_id : ${uploadResult.public_id}`);
  console.log(`  url       : ${deliveryUrl}`);
  console.log(
    `  fetch     : https://res.cloudinary.com/${cloudName}/raw/upload/${cloudFolder}/_galleries.json`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
