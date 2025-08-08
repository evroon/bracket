<p align="center">
  <img
    width="500"
    src="frontend/public/favicon-wide.svg"
    alt="Bracket - Tournament System"
  />
</p>

<p align="center">
  <a href="https://github.com/evroon/bracket/actions"
    ><img
      src="https://img.shields.io/github/actions/workflow/status/evroon/bracket/backend.yml"
      alt="build status"
  /></a>
  <a href="https://crowdin.com/project/bracket"
    ><img
      src="https://badges.crowdin.net/bracket/localized.svg"
      alt="translations"
  /></a>
  <a href="https://github.com/evroon/bracket/commits/"
    ><img
      src="https://img.shields.io/github/last-commit/evroon/bracket"
      alt="last commit"
  /></a>
  <a href="https://github.com/evroon/bracket/releases"
    ><img
      src="https://img.shields.io/github/v/release/evroon/bracket"
      alt="release"
  /></a>
  <a href="https://codecov.io/gh/evroon/bracket"
    ><img
      src="https://codecov.io/gh/evroon/bracket/branch/master/graph/badge.svg?token=YJL0DVPFFG"
      alt="codecov"
  /></a>
</p>
<p align="center">
  <a href="https://www.bracketapp.nl/demo">Demo</a>
  ·
  <a href="https://docs.bracketapp.nl">Documentation</a>
  ·
  <a href="https://docs.bracketapp.nl/docs/running-bracket/quickstart">Quickstart</a>
  ·
  <a href="https://github.com/evroon/bracket">GitHub</a>
  ·
  <a href="https://github.com/evroon/bracket/releases">Releases</a>
</p>
<p align="center">
<a href="https://trendshift.io/repositories/13714" target="_blank"><img src="https://trendshift.io/api/badge/repositories/13714" alt="evroon/bracket | Trendshift" width="250" height="55"/></a>
</p>
<h1></h1>

Tournament system meant to be easy to use. Bracket is written in async Python (with
[FastAPI](https://fastapi.tiangolo.com)) and [Next.js](https://nextjs.org/) as frontend using the
[Mantine](https://mantine.dev/) library.

It has the following features:
- Supports **single elimination, round-robin and swiss** formats.
- **Build your tournament structure** with multiple stages that can have multiple groups/brackets in
  them.
- **Drag-and-drop matches** to different courts or reschedule them to another start time.
- Various **dashboard pages** are available that can be presented to the public, customized with a
  logo.
- Create/update **teams**, and add players to **teams**.
- Create **multiple clubs**, with **multiple tournaments** per club.
- **Swiss tournaments** can be handled dynamically, with automatic scheduling of matches.

<img alt="" src="docs/content/img/bracket-screenshot-design.png" width="100%" />

<p align="center">
<a href="https://docs.bracketapp.nl"><strong>Explore the Bracket docs&nbsp;&nbsp;▶</strong></a>
</p>

# Live Demo
A demo is available for free at <https://www.bracketapp.nl/demo>. The demo lasts for 30 minutes, after which
your data will de deleted. 

# Quickstart
To quickly run bracket to see how it works, clone it and run `docker compose up`:
```bash
git clone git@github.com:evroon/bracket.git
cd bracket
sudo docker compose up -d
```

This will start the backend and frontend of Bracket, as well as a postgres instance. You should now
be able to view bracket at http://localhost:3000. You can log in with the following credentials:

- Username: `test@example.org`
- Password: `aeGhoe1ahng2Aezai0Dei6Aih6dieHoo`.

To insert dummy rows into the database, run:
```bash
sudo docker exec bracket-backend pipenv run ./cli.py create-dev-db
```

See also the [quickstart docs](https://docs.bracketapp.nl/docs/running-bracket/quickstart).

# Usage
Read the [usage guide](https://docs.bracketapp.nl/docs/usage/guide) for how to organize a tournament in Bracket from start to finish.

# Configuration
Read the [configuration docs](https://docs.bracketapp.nl/docs/running-bracket/configuration) for how to configure Bracket.

Bracket's backend is configured using `.env` files (`prod.env` for production, `dev.env` for development etc.).
But you can also configure Bracket using environment variables directly, for example by specifying them in the `docker-compose.yml`.

The frontend doesn't can be configured by environment variables as well, as well as `.env` files using Next.js' way of loading environment variables.

# Running Bracket in production
Read the [deployment docs](https://docs.bracketapp.nl/docs/deployment) for how to deploy Bracket and run it in production.

Bracket can be run in Docker or by itself (using `pipenv` and `yarn`).

# Development setup
Read the [development docs](https://docs.bracketapp.nl/docs/community/development) for how to run Bracket for development.

Prerequisites are `yarn`, `postgresql` and `pipenv` to run the frontend, database and backend.

# Translations
Based on your browser settings, your language should be automatically detected and loaded. For now,
there's no manual way of choosing a different language.

## Supported Languages
To add/refine translations, [Crowdin](https://crowdin.com/project/bracket) is used.
See the [docs](https://docs.bracketapp.nl/docs/community/contributing/#translating) for more information.

# More screenshots
<img alt="" src="docs/content/img/schedule_preview.png" width="50%" /><img alt=""
src="docs/content/img/planning_preview.png" width="50%" /> <img alt=""
src="docs/content/img/builder_preview.png" width="50%" /><img alt=""
src="docs/content/img/standings_preview.png" width="50%" />

# Help
If you're having trouble getting Bracket up and running, or have a question about usage or configuration, feel free to ask.
The best place to do this is by creating a [Discussion](https://github.com/evroon/bracket/discussions).

# Supporting Bracket
If you're using Bracket and would like to help support its development, that would be greatly appreciated!

Several areas that we need a bit of help with at the moment are:
- ⭐ **Star Bracket** on GitHub
- 🌐 **Translating**: Help make Bracket available to non-native English speakers by adding your language (via [crowdin](https://crowdin.com/project/bracket))
- 📣 **Spread the word** by sharing Bracket to help new users discover it
- 🖥️ **Submit a PR** to add a new feature, fix a bug, extend/update the docs or something else

See the [contribution docs](https://docs.bracketapp.nl/docs/community/contributing) for more information on how to contribute

# Contributors
<!-- readme: collaborators,contributors,dependabot/- -start -->
<table>
<tr>
    <td align="center">
        <a href="https://github.com/evroon">
            <img src="https://avatars.githubusercontent.com/u/11857441?v=4" width="100;" alt="evroon"/>
            <br />
            <sub><b>Erik Vroon</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/robigan">
            <img src="https://avatars.githubusercontent.com/u/35210888?v=4" width="100;" alt="robigan"/>
            <br />
            <sub><b>Null</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/BachErik">
            <img src="https://avatars.githubusercontent.com/u/75324423?v=4" width="100;" alt="BachErik"/>
            <br />
            <sub><b>BachErik</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/djpiper28">
            <img src="https://avatars.githubusercontent.com/u/13609136?v=4" width="100;" alt="djpiper28"/>
            <br />
            <sub><b>Danny Piper</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/MaxRickettsUy">
            <img src="https://avatars.githubusercontent.com/u/22103252?v=4" width="100;" alt="MaxRickettsUy"/>
            <br />
            <sub><b>Max Ricketts-Uy</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/sevi418">
            <img src="https://avatars.githubusercontent.com/u/91365763?v=4" width="100;" alt="sevi418"/>
            <br />
            <sub><b>Sevi C</b></sub>
        </a>
    </td></tr>
<tr>
    <td align="center">
        <a href="https://github.com/nvanheuverzwijn">
            <img src="https://avatars.githubusercontent.com/u/943226?v=4" width="100;" alt="nvanheuverzwijn"/>
            <br />
            <sub><b>Nicolas Vanheuverzwijn</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/FelipeGdM">
            <img src="https://avatars.githubusercontent.com/u/1054087?v=4" width="100;" alt="FelipeGdM"/>
            <br />
            <sub><b>Felipe Gomes De Melo</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/IzStriker">
            <img src="https://avatars.githubusercontent.com/u/44909896?v=4" width="100;" alt="IzStriker"/>
            <br />
            <sub><b>IzStriker</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/jmillxyz">
            <img src="https://avatars.githubusercontent.com/u/531476?v=4" width="100;" alt="jmillxyz"/>
            <br />
            <sub><b>Jon Miller</b></sub>
        </a>
    </td>
    <td align="center">
        <a href="https://github.com/babeuh">
            <img src="https://avatars.githubusercontent.com/u/60193302?v=4" width="100;" alt="babeuh"/>
            <br />
            <sub><b>Raphael Le Goaller</b></sub>
        </a>
    </td></tr>
</table>
<!-- readme: collaborators,contributors,dependabot/- -end -->

# License
Bracket is licensed under [AGPL-v3.0](https://choosealicense.com/licenses/agpl-3.0/).

Please note that any contributions also fall under this license.

See [LICENSE](LICENSE)
