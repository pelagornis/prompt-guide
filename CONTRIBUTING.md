# Contributing to Pelagornis

Thank you for your interest in contributing to Pelagornis! We welcome contributions of all kinds. Please read the following guidelines to ensure a smooth collaboration.

## Development


## Releasing

To create a new release, use the GitHub UI at: [Pelagornis Releases](https://github.com/pelagornis/)

### Publishing CLI to npm

The **prompt-guide-cli** package is published to npm via GitHub Actions when a **version tag** is pushed.

1. **One-time setup**: In the repo **Settings → Secrets and variables → Actions**, add a secret **NPM_TOKEN** with an [npm Automation token](https://www.npmjs.com/account/tokens) (no 2FA required for automation).
2. **Release**: Create and push a tag matching `v*` (e.g. `v1.0.1`). The workflow [.github/workflows/release.yml](.github/workflows/release.yml) will set the CLI version from the tag, build, and run `npm publish -w prompt-guide-cli`.

   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

   The tag version (e.g. `1.0.1`) is applied to `cli/package.json` in the workflow; you do not need to bump the version in the repo before tagging.

### Versioning

Follow semantic versioning when creating tags:

- Major version bump: If the update requires users to modify their workflows, increment the major version and note the breaking change in the release notes.

- Minor version bump: If you add a new workflow or an opt-in feature, increment the minor version.

- Patch version bump: If you fix a bug or make a transparent change, increment the patch version.

- Leave the release title blank. If you'd like to add additional details, ensure the version number is included. Use the automatically generated changelog as a starting point and supplement it with any necessary details.

## Contribution Guidelines

### Feature requests and bug reports

- **New feature or improvement**: Open an issue and choose the **Feature Request** template. Fill in the problem, proposed solution, and area (CLI, config, docs, etc.) so we can prioritize.
- **Bug**: Open an issue and choose the **Bug Report** template. Include what happened, expected behavior, and the full error log.

### Code Style

Follow the [pelagornis styleguide](https://pelagornis.github.io/styleguide/).

Ensure all commits have meaningful messages.

### Submitting a PR

1. Fork the repository and create a feature branch.
2. Open a pull request with a clear description of your changes. Use the PR template (summary, type of change, how you tested).
3. Ensure that all tests pass before requesting a review.
4. Add relevant documentation if necessary.

We appreciate your contributions and look forward to collaborating with you!