## Use

To use this action you need to provide your own Barney API Server.  If you don't know what that is
yet then we likely haven't made it public yet.

Set up a .github/workflows/review.yml with:

```yaml
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  review:
    runs-on: self-hosted
    steps:
      - uses: barney.ci/github-action-review@v0.1.0
        name: Run a Barney review job
        with:
          barney-api-server: https://barney-api.example.com
```

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.  Packaging the action will create a packaged action in the dist folder.

Run prepare

```bash
npm run prepare
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```
