[![CI/CD](https://github.com/epilot-dev/pricing/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/epilot-dev/pricing/actions/workflows/ci-cd.yml)

# Pricing Library

A library that provides pricing utility operations for Pricing Entities within the epilot 360 Platform, such as calculation of price item totals and aggregated totals. The purpose of this library is to provide support for common pricing concerns to all our APIs, micro-frontends and epilot Journeys.

## Interactive Playground - WIP

Explore the library's capabilities live in your browser — configure tariffs, bundle products, and see real-time price calculations.

[**Open Pricing Playground**](https://docs.epilot.io/pricing-playground/index.html)

## Getting Started

Install the package:

```bash
yarn add @epilot/pricing
```

```bash
npm install --save @epilot/pricing
```

```bash
pnpm add @epilot/pricing
```

## Releasing

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

### Adding a changeset

When you make a change that should be released, run:

```bash
pnpm changeset
```

Follow the prompts to select the semver bump type (`patch`, `minor`, `major`) and describe your change.

### Release workflow

1. Create a feature branch and add your changeset(s) alongside your code changes.
2. Open a PR to `main` — CI runs tests as usual.
3. When the PR is merged, the **Release** workflow detects pending changesets and opens a **"Version Packages"** PR that bumps `package.json` version and updates the changelog.
4. When the Version Packages PR is merged, the Release workflow publishes the new version to npm and creates a git tag.

## ⚠️ Disclaimer

This library is made available as an open source contribution to the community to ensure that all our clients and integrators can have the flexibility to build their own custom frontends and integrations with our platform [^1].

However, this library is not intended to be used as a standalone product and it is not supported by epilot as such. If you have any questions or need help with this library, please contact our team.

[^1]: With love & dedication by :heart: **tauro**.
