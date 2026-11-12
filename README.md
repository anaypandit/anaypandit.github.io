# Anay Pandit — Personal portfolio

A custom, responsive portfolio for robotics, AI, and aerospace work.

**[Visit the portfolio](https://anaypandit.github.io/)** · **[Project sources](SOURCES.md)** · **[Design brief](DESIGN.md)**

## Preview locally

From this directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Serve this folder at the website root; asset and navigation paths begin with `/`.

## Edit the site

- `index.html`: homepage copy, selected work, About, and milestones.
- `projects/<project-name>/index.html`: individual project stories.
- `assets/style.css`: shared colors, spacing, typography, and responsive layouts.
- `assets/site.js`: optional active-section navigation highlight.
- `assets/`: real project imagery, schematic favicon, and social preview.
- `DESIGN.md`: visual rules and instructions for future AI-assisted edits.
- `PLAN.md`: the agreed plan, including the design-brief and refinement process.
- `SOURCES.md`: public references and image provenance.

There are no required packages, install step, framework, API keys, or backend. All reading and navigation works without JavaScript.

## GitHub Pages

Use the [`anaypandit/anaypandit.github.io`](https://github.com/anaypandit/anaypandit.github.io) public repository. The repository name must match the account username followed by `.github.io` for this root-level personal site. In Settings → Pages choose **Deploy from a branch**, branch `main`, folder `/ (root)`. `.nojekyll` keeps this as a static site. Changes pushed to the publishing branch will update the site. Do not add a `CNAME` until a custom domain has been chosen and configured.

## After the username change

The account and Pages repository now use `anaypandit`. The live site, canonical URLs, sitemap, sharing images, and GitHub profile/project links use the new address. For an existing local checkout, update its remote:

```sh
git remote set-url origin https://github.com/anaypandit/anaypandit.github.io.git
```

## Verify the rocket demo

```sh
node demos/rocket-flight-lab/physics.test.cjs
```

The model and its tests are copied from Anay's Rocket Flight Lab, with an added back-to-portfolio link in the HTML. The original project is credited in its README and case study.

## Authorship

Project direction and personal material: Anay Pandit. Portfolio implementation, content assembly, and custom schematic: Codex, November 2026. Team-project and AI contributions are described in the relevant case studies. No third-party website template was copied.
