# How to contribute

## Setup

You will need to install the following tools:

- [nvm](https://github.com/nvm-sh/nvm) (or [fnm](https://fnm.vercel.app/), [nvm-windows](https://github.com/coreybutler/nvm-windows))
- Node.js 18 or higher

To get started with the project:

> [!NOTE]
> You will need multiple terminal sessions if you want to run everything,
> you will need 4 sessions (frontend, live backend, api backend, analytics backend).
> Also the following commands assume Linux, macOS or WSL. Windows commands may differ.

```bash
# Clone the repository or your fork
git clone git@github.com:slowlydev/f1-dash.git

# Go to the project root
cd f1-dash/

# Install the correct node version using nvm, fnm or nvm-windows
nvm install

# Install all dependencies (monorepo workspaces)
npm install

# Copy the env example and adjust envs if needed
cp .env.example .env
```

## Running the Frontend

```bash
# Go to the frontend
cd dash/

# Enable corepack for yarn
corepack enable

# Install the package manager (yarn) with corepack
corepack install

# Install frontend dependencies
yarn

# Copy the env example
cp .env.example .env

# To start development
yarn dev
```

## Running the Backend Services

### API Service (F1 Schedule)

```bash
cd services/api/
npm install
npm start
```

Or from the root using the makefile:
```bash
make dev-api
```

### Live Service (Real-time Timing Data)

```bash
cd services/live/
npm install
npm start
```

Or from the root using the makefile:
```bash
make dev-live
```

### Analytics Service (TimescaleDB Analytics)

```bash
cd services/analytics/
npm install
npm start
```

Or from the root using the makefile:
```bash
make dev-analytics
```

### Importer Service (Data Persistence)

```bash
cd services/importer/
npm install
npm start
```

Or from the root using the makefile:
```bash
make dev-importer
```

## Development with Docker

You can also use Docker Compose to run all services:

```bash
docker compose up
```

This will start:
- Frontend on http://localhost:3000
- API service on http://localhost:4001
- Live service on http://localhost:4000
- Analytics service on http://localhost:4002
- TimescaleDB on localhost:5432

## Branching Convention

For branch names we use git flow style branching.

For new features follow this: `feature/the-name-of-the-feature`  
For a bugfix or refactor follow this: `bugfix/a-title-for-the-bugfix`

These feature and bugfix branches should be based off `develop` and be merged into `develop`.

## Commit Convention

For the commit message please use conventional commits:
[https://www.conventionalcommits.org/en/v1.0.0/](https://www.conventionalcommits.org/en/v1.0.0/)

### A Quick TL;DR; Of Conventional Commits

- `feat` When adding a new feature
- `fix` When fixing something
- `refactor` When it's neither a fix or a new feature
- `perf` If the change improves performance
- `chore` Anything else (should be last resort)

## Before opening a Pull Request

Please test your code, build the parts of the application you touched. For example, if you made changes in the frontend, make sure to run `yarn build` and see if the build succeeds and maybe check out how it will look in prod via `yarn start`. Sometimes there is a difference between running `dev` and `start` & `build`.

Make sure you format the files you created or touched. We use prettier for formatting, so either run the command `yarn run prettier` or install the fitting extension for your preferred IDE.

When opening a Pull Request please select `develop` as the target branch.