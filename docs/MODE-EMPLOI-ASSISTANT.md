# Mode d'emploi — modifications du site benoitdepagnier.ch

Guide pour un assistant débutant qui travaille via **Cursor** sur le repo `benxvii/benoitdepagnier`.

---

## Avant de commencer

### Comment le site fonctionne


| Élément           | Rôle                                       |
| ----------------- | ------------------------------------------ |
| **Code** (`src/`) | Textes, structure des pages, menu, URLs    |
| **Cloudinary**    | Photos des galeries portfolio              |
| **GitHub**        | Code source + déploiement automatique      |
| **Infomaniak**    | Hébergement du site (HTML/JS/CSS compilés) |


Les **photos de portfolio** ne sont plus dans le code. Elles sont sur **Cloudinary**, dans le dossier racine `benoitdepagnier/portfolio/…`.

Le menu se met à jour **automatiquement** à partir de `src/config/site.ts`. Pas besoin de toucher à `navigation.ts` pour ajouter une galerie ou une page listée dans `site.ts`.

### Fichier principal à connaître

`**src/config/site.ts`** — contient presque tout le contenu éditorial :


| Section     | Contenu                                    |
| ----------- | ------------------------------------------ |
| `site`      | Nom, email, réseaux sociaux, logo          |
| `portfolio` | Galeries photo (titres, intros, structure) |
| `projets`   | Pages projets informatiques                |
| `musique`   | Pages musique + enregistrements            |
| `about`     | Page « Qui suis-je ? »                     |
| `homeIntro` | Citation sur la page d'accueil             |


### Déploiement

Après une modification de **code** :

```bash
git add .
git commit -m "description courte de la modification"
git push origin main
```

GitHub Actions lance **Deploy to Infomaniak** (~1–2 min). Le site live se met à jour automatiquement.

Pour **prévisualiser en local** avant de pousser :

```bash
npm run dev
```

Puis ouvrir [http://localhost:5173](http://localhost:5173)

---

## 1. Modifier des textes sur des pages existantes

Ouvrir `src/config/site.ts` et repérer la section correspondante.

### Page d'accueil


| Élément                      | Où modifier       |
| ---------------------------- | ----------------- |
| Citation sous le hero        | `homeIntro.quote` |
| Nom, tagline, email, réseaux | objet `site`      |


### Portfolio (page index + galeries)


| Élément                        | Où modifier                            |
| ------------------------------ | -------------------------------------- |
| Titre « Portfolio »            | `portfolio.title`                      |
| Intro de la page index         | `portfolio.intro`                      |
| Titre d'une galerie            | `portfolio.galleries[].title`          |
| Texte sous le titre            | `portfolio.galleries[].intro`          |
| Galerie nested (sous-rubrique) | `portfolio.galleries[].subGalleries[]` |


**Exemple** — changer l'intro de Street photography :

```ts
{
  slug: "street-photography",
  path: "/portfolio/street-photography",
  title: "Street photography",
  intro: "Nouveau texte ici.",  // ← modifier cette ligne
},
```

### Page About


| Élément             | Où modifier                               |
| ------------------- | ----------------------------------------- |
| Titre               | `about.title`                             |
| Légende du portrait | `about.portraitCaption`                   |
| Paragraphes         | `about.paragraphs[]` (tableau de strings) |


### Musique


| Page                       | Où modifier                                              |
| -------------------------- | -------------------------------------------------------- |
| Intro générale             | `musique.intro`                                          |
| Instruments, compositions… | `musique.pages[]` → champs `title`, `intro`, `body`      |
| Fiche album                | `musique.recordings[]` → `title`, `body`, `tracks`, etc. |


### Projets


| Élément      | Où modifier                                                  |
| ------------ | ------------------------------------------------------------ |
| Intro index  | `projets.intro`                                              |
| Fiche projet | `projets.items[]` → `title`, `description`, `body`, `notice` |


### Checklist

- Texte modifié dans `site.ts`
- `npm run dev` pour vérifier (optionnel)
- `git commit` + `git push`

**Aucune action Cloudinary** pour une simple modification de texte.

---

## 2. Ajouter des photos dans une galerie existante

**Aucune modification de code.** Uniquement Cloudinary + sync.

### Étape A — Uploader sur Cloudinary

1. Aller sur [console.cloudinary.com](https://console.cloudinary.com) → **Assets**
2. Naviguer vers le dossier de la galerie, par exemple :
  ```
   benoitdepagnier/portfolio/street-photography/
  ```
3. **Upload** → glisser les nouveaux JPG dans ce dossier

Le chemin Cloudinary doit correspondre au **slug** de la galerie dans `site.ts` :


| Galerie dans site.ts                                       | Dossier Cloudinary                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| `slug: "street-photography"`                               | `benoitdepagnier/portfolio/street-photography/`                      |
| `slug: "flous-urbains"` (sous `flous-de-mouvements`)       | `benoitdepagnier/portfolio/flous-de-mouvements/flous-urbains/`       |
| `slug: "louis-billette-nuit"` (sous `monde-de-la-musique`) | `benoitdepagnier/portfolio/monde-de-la-musique/louis-billette-nuit/` |


### Étape B — Synchroniser le manifest

1. GitHub → repo → **Actions**
2. **Sync galleries from Cloudinary** → **Run workflow** → Run
3. Attendre le ✅ vert (~30 s)

### Étape C — Vérifier

Recharger la page galerie sur le site (ex. `/portfolio/street-photography`).

Les nouvelles photos viennent de `res.cloudinary.com/duvuxd5kh/…`.

### Checklist

- Photos uploadées dans le **bon** dossier Cloudinary
- Workflow **Sync galleries** exécuté
- Page rechargée dans le navigateur

**Pas de `git push` nécessaire.**

---

## 3. Créer une nouvelle galerie

Deux cas : galerie simple ou galerie dans une rubrique existante.

### Cas A — Galerie simple (ex. `/portfolio/voyage-japon`)

#### 1. Cloudinary

Créer le dossier et uploader les photos :

```
benoitdepagnier/portfolio/voyage-japon/
```

#### 2. Code — `src/config/site.ts`

Ajouter une entrée dans `portfolio.galleries` :

```ts
{
  slug: "voyage-japon",
  path: "/portfolio/voyage-japon",
  title: "Voyage Japon",
  intro: "Photos de mon voyage au Japon en 2025.",
},
```

**Règles pour le slug :**

- minuscules, tirets, pas d'espaces
- le `path` = `/portfolio/` + slug
- le dossier Cloudinary = `benoitdepagnier/portfolio/` + slug

#### 3. (Optionnel) `scripts/galleries-meta.json`

Ajouter le titre pour le manifest (utile si le titre contient des accents ou caractères spéciaux) :

```json
"voyage-japon": {
  "title": "Voyage Japon"
}
```

#### 4. Sync + deploy

1. **Sync galleries from Cloudinary** (GitHub Actions)
2. `git commit` + `git push` (pour le code)

Le menu Portfolio se met à jour tout seul.

---

### Cas B — Galerie nested sous une rubrique (ex. nouveau concert sous « Le monde de la musique »)

#### 1. Cloudinary

```
benoitdepagnier/portfolio/monde-de-la-musique/nouveau-concert/
```

Le chemin = `parent-slug/enfant-slug`.

#### 2. Code — `src/config/site.ts`

Dans `subGalleries` du parent :

```ts
{
  slug: "monde-de-la-musique",
  path: "/portfolio/monde-de-la-musique",
  title: "Le monde de la musique",
  intro: "...",
  subGalleries: [
    // ... galeries existantes ...
    {
      slug: "nouveau-concert",
      path: "/portfolio/monde-de-la-musique/nouveau-concert",
      title: "Nom du concert",
      intro: "Date et lieu du concert.",
    },
  ],
},
```

#### 3. `scripts/galleries-meta.json`

```json
"monde-de-la-musique/nouveau-concert": {
  "title": "Nom du concert"
}
```

#### 4. Sync + deploy

Comme cas A.

---

### Cas C — Nouvelle rubrique avec sous-galeries (hub)

Exemple : une section « Nature » avec plusieurs sous-dossiers.

```ts
{
  slug: "nature",
  path: "/portfolio/nature",
  title: "Nature",
  intro: "Paysages et faune.",
  subGalleries: [
    {
      slug: "montagne",
      path: "/portfolio/nature/montagne",
      title: "Montagne",
      intro: "",
    },
  ],
},
```

Cloudinary :

```
benoitdepagnier/portfolio/nature/montagne/
```

La rubrique « Nature » (sans photos directes) affiche une page hub listant ses sous-galeries. Les photos vont dans les sous-dossiers.

---

### Prompt Cursor (exemple)

> Ajoute une nouvelle galerie « Voyage Japon » au portfolio : slug `voyage-japon`, intro « Photos de mon voyage au Japon en 2025 ». Mets à jour `site.ts` et `galleries-meta.json`. Ne touche pas aux autres galeries.

---

## 4. Créer une nouvelle page

Le type de page détermine où modifier le code.

### Type 1 — Page texte Musique (ex. `/musique/compositions`)

Déjà géré par la route `musique/:slug`. Ajouter dans `musique.pages` :

```ts
{
  slug: "ma-nouvelle-page",
  path: "/musique/ma-nouvelle-page",
  title: "Titre de la page",
  intro: "Sous-titre optionnel.",
  body: `Contenu en plusieurs paragraphes.

Deuxième paragraphe ici.`,
},
```

Pas de modification de `routes.ts` si le slug est sous `/musique/`.

---

### Type 2 — Fiche projet (ex. `/projets/mon-app`)

Ajouter dans `projets.items` :

```ts
{
  slug: "mon-app",
  path: "/projets/mon-app",
  title: "Mon App",
  description: "Résumé court pour la liste.",
  image: assetUrl("/projets/mon-app.png"),
  body: `Description longue du projet.`,
  downloads: [
    { label: "macOS", url: assetUrl("/downloads/MonApp-mac.zip") },
    { label: "Windows", url: assetUrl("/downloads/MonApp-win.zip") },
  ],
},
```

**Images projet / ZIP :** pas sur Cloudinary pour l'instant. Les fichiers vont dans `public/projets/` et `public/downloads/` (upload FTP Infomaniak si besoin). Le logo reste dans `public/logo.png`.

---

### Type 3 — Fiche enregistrement album (ex. `/musique/enregistrements/mon-album`)

Ajouter dans `musique.recordings` (copier la structure d'`agua-viva-y-ardiente` comme modèle).

Route existante : `musique/enregistrements/:recordingSlug`.

---

### Type 4 — Nouvelle galerie portfolio

Voir section **3. Créer une nouvelle galerie**.

---

### Type 5 — Page totalement nouvelle (hors sections existantes)

Plus rare. Nécessite :

1. Contenu dans `site.ts` (ou nouveau composant)
2. Route dans `src/app/routes.ts`
3. Lien dans `src/config/navigation.ts` si visible dans le menu

**Prompt Cursor (exemple) :**

> Crée une page `/contact` avec un titre et un paragraphe. Ajoute la route, un composant simple, et un lien dans le menu principal.

---

## Récap rapide


| Tâche                              | Fichiers                          | Cloudinary | Git push | Sync workflow |
| ---------------------------------- | --------------------------------- | ---------- | -------- | ------------- |
| Modifier un texte                  | `site.ts`                         | —          | ✅        | —             |
| Ajouter photos (galerie existante) | —                                 | ✅ upload   | —        | ✅             |
| Nouvelle galerie                   | `site.ts` + `galleries-meta.json` | ✅ upload   | ✅        | ✅             |
| Nouvelle page musique/projet       | `site.ts`                         | —          | ✅        | —             |


---

## Erreurs fréquentes


| Problème                | Cause                           | Solution                                  |
| ----------------------- | ------------------------------- | ----------------------------------------- |
| Galerie vide            | Mauvais dossier Cloudinary      | Vérifier le chemin vs slug dans `site.ts` |
| Galerie absente du menu | Entrée manquante dans `site.ts` | Ajouter + push                            |
| Photos pas à jour       | Sync pas lancé                  | Run **Sync galleries from Cloudinary**    |
| Page 404                | `path` ou `slug` incohérent     | `path` doit matcher l'URL réelle          |
| Menu nested cassé       | `subGalleries` mal placé        | Sous-galerie dans le bon parent           |


---

## Correspondance slug ↔ Cloudinary

```
site.ts slug(s)                          →  dossier Cloudinary
─────────────────────────────────────────────────────────────────
street-photography                       →  benoitdepagnier/portfolio/street-photography/
flous-urbains (parent: flous-de-mouvements)  →  benoitdepagnier/portfolio/flous-de-mouvements/flous-urbains/
louis-billette-nuit (parent: monde-de-la-musique)  →  benoitdepagnier/portfolio/monde-de-la-musique/louis-billette-nuit/
```

Règle : chemin Cloudinary = `benoitdepagnier/portfolio/` + slugs parents/enfant joints par `/`.

---

## Secrets et accès (référence)

L'assistant **ne modifie pas** les secrets GitHub. Benoît les gère.


| Secret                          | Usage                    |
| ------------------------------- | ------------------------ |
| `CLOUDINARY_CLOUD_NAME`         | `duvuxd5kh`              |
| `CLOUDINARY_FOLDER`             | `benoitdepagnier`        |
| `CLOUDINARY_API_KEY` / `SECRET` | Sync workflow uniquement |


Upload manuel des photos : compte Cloudinary web, pas besoin des secrets.

---

## Statistiques de consultation

Le site utilise **Umami** pour le tracking des visites (script installé dans `index.html`).

Pour consulter les statistiques :

1. Aller sur [cloud.umami.is](https://cloud.umami.is)
2. Se connecter avec le compte Umami de Benoît
3. Sélectionner le site `benoitdepagnier.ch`

Les données disponibles : visiteurs, pages vues, pages les plus consultées, pays, sources de trafic.

Les stats Infomaniak natives (Manager > Site Web > benoitdepagnier.ch > Statistiques) sont également disponibles mais incluent les bots — chiffres à prendre avec réserve.

Ne pas modifier le `data-website-id` dans `index.html` sans mettre à jour le compte Umami.