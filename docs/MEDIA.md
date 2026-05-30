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

Ne pas réactiver `dangerous-clean-slate` sur le déploiement FTP.

Le workflow exclut `portfolio/`, `downloads/`, etc. du sync FTP pour ne **pas les supprimer** sur le serveur quand ils ne sont plus dans `dist/`.

### Photos cassées (icône / emoji) après un déploiement

Si le navigateur affiche une icône à la place des photos : les JPG ne sont plus sur le serveur, et Apache renvoie `index.html` (SPA).

### GitHub Secrets : pourquoi la commande locale ne « voit » pas tes valeurs

Les secrets dans GitHub sont **utilisables uniquement dans Actions**. GitHub ne permet pas de les relire après création (pas de bouton « afficher le mot de passe »).  
Donc `FTP_HOST='ton-host-ftp'` dans le terminal ne peut pas magiquement prendre les valeurs du repo : il faut soit les recopier depuis **Infomaniak Manager → FTP**, soit passer par le workflow ci-dessous.

### Remise en ligne avec les secrets GitHub (sans les taper)

Workflow **Sync media to Infomaniak** (`.github/workflows/sync-media.yml`) :

1. **Une fois**, sur ton Mac (les fichiers sont déjà dans `public/`) :

```bash
git add -f public/portfolio public/downloads public/about public/musique public/projets
git commit -m "chore: sync media vers Infomaniak"
git push
```

2. GitHub → **Actions** → **Sync media to Infomaniak** → **Run workflow**.

3. Attendre la fin (~10–20 min selon la connexion).

4. Vérifier : `curl -sI https://benoitdepagnier.ch/portfolio/.../L1000870.jpg` → `image/jpeg`.

5. **Optionnel** — retirer les binaires du suivi Git (ils restent sur Infomaniak) :

```bash
git rm -r --cached public/portfolio public/downloads public/about public/musique public/projets
git commit -m "chore: médias hors Git (déjà sur le serveur)"
git push
```

### Autres options

- **FileZilla** — identifiants dans Infomaniak Manager (souvent les mêmes que ceux entrés dans GitHub Secrets), dossier `sites/benoitdepagnier.ch/`.
- **Script local** — `scripts/sync-media-to-infomaniak.sh` avec identifiants Infomaniak en ligne de commande (pas les placeholders `ton-host-ftp`).

## Cloudinary (optionnel)

Le projet inclut `src/lib/cloudinary.ts` pour héberger les images sur Cloudinary plus tard. Ce n’est pas requis tant que les fichiers sont sur Infomaniak.
