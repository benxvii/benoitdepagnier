# Benoît d'Epagnier — site personnel

Site vitrine : accueil, portfolio photo, projets informatiques, musique, qui suis-je.

Basé sur la stack du site [benoitdepagnier.ch](https://benoitdepagnier.ch/) (React, Vite, Tailwind, shadcn/ui).

## Démarrage local

```bash
npm install
npm run dev
```

## Structure du contenu

Tout le contenu éditable est dans `src/config/site.ts` :

| Section | Clé | Routes |
|---------|-----|--------|
| Portfolio | `portfolio.galleries` | `/portfolio`, `/portfolio/:slug`, `/portfolio/:parent/:slug` |
| Projets | `projets.items` | `/projets`, `/projets/:slug` |
| Musique | `musique.pages` | `/musique`, `/musique/:slug` |
| À propos | `about` | `/about` |

## Déploiement automatique (Infomaniak)

Chaque push sur `main` build le site et l’envoie sur Infomaniak via FTP.

### Configuration unique sur GitHub

Repo **Settings → Secrets and variables → Actions → New repository secret** :

| Secret | Exemple | Où le trouver |
|--------|---------|---------------|
| `FTP_HOST` | `xxx.ftp.infomaniak.com` ou `ftp.benoitdepagnier.ch` | Manager Infomaniak → Hébergement Web → FTP / SSH |
| `FTP_USER` | identifiant FTP | même écran |
| `FTP_PASSWORD` | mot de passe FTP | même écran |

Le déploiement cible le dossier `sites/benoitdepagnier.ch/` (comme le Web FTP). Si ton chemin diffère, modifie `server-dir` dans `.github/workflows/deploy.yml`.

### Usage

```bash
git add .
git commit -m "Ma modification"
git push
```

GitHub Actions build puis upload `dist/`. Compte 2 à 5 minutes. Suivi : onglet **Actions** du repo GitHub.

## Images

1. Copiez `.env.example` vers `.env` et renseignez `VITE_CLOUDINARY_CLOUD_NAME`.
2. Uploadez vos photos sur Cloudinary et utilisez `resolveImageUrl()` dans `src/lib/cloudinary.ts`.
3. En attendant, des placeholders Unsplash sont utilisés.

## Personnalisation

- Identité et réseaux : `site` dans `site.ts`
- Navigation : `src/config/navigation.ts`
- Logo : `public/logo.png`
- Couleur de marque : `--brand` dans `src/styles/theme.css`
