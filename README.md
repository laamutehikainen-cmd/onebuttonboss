# One-Button Boss Fight

Pieni Canvas + TypeScript -bossitaistelu, jossa kaikki tapahtuu yhdellä napilla.

## Käynnistys lokaalisti

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## GitHub Pages -julkaisu

Tähän repoon on lisätty automaattinen Pages-workflow (`.github/workflows/deploy-pages.yml`).

### Jos "Deploy" ei näy Actionsissa

Yleisin syy: workflow-tiedosto ei ole vielä repossa **default-branchissa**.

Tarkista nämä:

1. Tiedosto on polussa: `.github/workflows/deploy-pages.yml`
2. PR on **merge**tty default-branchiin (main/master)
3. Repoasetuksissa **Actions** on sallittu
4. Repoasetuksissa **Settings → Pages → Source = GitHub Actions**

Kun nämä ovat kunnossa, workflow näkyy Actions-listassa nimellä **Deploy to GitHub Pages**.

### Kerran tehtävät asetukset GitHubissa

1. Avaa **Settings → Pages**.
2. Varmista kohdasta **Source**, että valittuna on **GitHub Actions**.
3. Puske workflow `main`- tai `master`-haaraan.

### Mitä tapahtuu sen jälkeen

- Jokainen push `main`- tai `master`-haaraan buildaa Vite-projektin ja deployaa `dist/`-kansion GitHub Pagesiin.
- Workflow valitsee automaattisesti oikean `base`-polun:
  - `/<repo>/` projektisivulle (`username.github.io/repo`)
  - `/` jos repo on `username.github.io`

### Julkinen URL

Sivun osoite näkyy deployn jälkeen:
- **Actions → Deploy to GitHub Pages → deploy-step output**
- sekä **Settings → Pages**
