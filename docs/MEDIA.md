# Médias hors Git

Les photos, ZIP de téléchargement et autres gros fichiers ne sont **pas** versionnés dans Git. Ils restent sur Infomaniak aux mêmes URLs (`/portfolio/...`, `/downloads/...`, etc.).

## Pourquoi

- Repo Git plus léger (~330 Mo en moins)
- Déploiements GitHub Actions plus rapides (le FTP n’envoie plus ~350 Mo à chaque push)
- Les médias ne changent pas à chaque modification du code

## Où sont les fichiers

| Dossier local (optionnel) | URL sur le site |
|---------------------------|-----------------|
| `public/portfolio/` | `/portfolio/...` |
| `public/downloads/` | `/downloads/...` |
| `public/projets/` | `/projets/*.png` |
| `public/musique/` | `/musique/...` |
| `public/about/` | `/about/portrait.jpg` |

Le logo (`public/logo.png`) reste dans Git et est déployé avec le build.

## Développement local

**Option A** — Garder une copie locale dans `public/` (dossiers gitignorés, non commités).

**Option B** — Sans copie locale, pointer vers la prod dans `.env` :

```env
VITE_MEDIA_BASE_URL=https://benoitdepagnier.ch
```

## Ajouter ou modifier des médias

1. Uploader via le **Web FTP / FileZilla** Infomaniak vers `sites/benoitdepagnier.ch/` (mêmes chemins que `public/`).
2. Mettre à jour les chemins dans `src/config/site.ts` si besoin.
3. Commit uniquement le code, pas les fichiers binaires.

Ne pas réactiver `dangerous-clean-slate` sur le déploiement FTP : cela supprimerait les médias absents du `dist/` généré par CI.

## Cloudinary (optionnel)

Le projet inclut `src/lib/cloudinary.ts` pour héberger les images sur Cloudinary plus tard. Ce n’est pas requis tant que les fichiers sont sur Infomaniak.
