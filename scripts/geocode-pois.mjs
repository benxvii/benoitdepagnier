// geocode-pois.mjs
// Remplit lat/lng dans poi-coworking.json via l'API Nominatim (OpenStreetMap).
// Usage: node geocode-pois.mjs
//
// Nominatim impose 1 requête/seconde et un User-Agent identifiable.
// A relancer chaque fois qu'une adresse est ajoutée ou modifiée.

import { readFile, writeFile } from "fs/promises";

const INPUT_FILE = "./poi.json";
const OUTPUT_FILE = "./poi.json"; // écrase le fichier en place
const DELAY_MS = 1100; // marge de sécurité au-dessus de la limite Nominatim

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function geocode(poi) {
  const query = `${poi.address}, ${poi.postalCode} ${poi.city}, Suisse`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "benoitdepagnier.ch-poi-geocoder/1.0 (contact via le site)",
    },
  });

  if (!response.ok) {
    console.warn(`[${poi.id}] HTTP ${response.status} pour: ${query}`);
    return null;
  }

  const results = await response.json();
  if (results.length === 0) {
    console.warn(`[${poi.id}] Aucun résultat pour: ${query}`);
    return null;
  }

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  };
}

async function main() {
  const raw = await readFile(INPUT_FILE, "utf-8");
  const pois = JSON.parse(raw);

  for (const poi of pois) {
    if (poi.lat !== null && poi.lng !== null) {
      console.log(`[${poi.id}] déjà géocodé, on passe.`);
      continue;
    }

    const coords = await geocode(poi);
    if (coords) {
      poi.lat = coords.lat;
      poi.lng = coords.lng;
      console.log(`[${poi.id}] -> ${coords.lat}, ${coords.lng}`);
    }

    await sleep(DELAY_MS);
  }

  await writeFile(OUTPUT_FILE, JSON.stringify(pois, null, 2) + "\n", "utf-8");
  console.log(`Manifest mis à jour: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error("Erreur de géocodage:", err);
  process.exit(1);
});
