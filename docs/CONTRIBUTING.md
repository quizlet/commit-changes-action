# Contributor's Guide

First off, thank you for considering contributing to `commit-changes-action`! Hopefully this action has helped you and we appreciate you contributing back to it.

## Issues

We're accepting bug reports and feature requests. Feel free to file and issue and fill out the template as completely as possible

## Pull Requests

Pull requests are appreciated and don't require an issue. Please make sure to fill out the template as completely as possible.

## Developing

### Setup

This project is developed against Node v12.x (current version used by Github Actions). You can install dependencies with

```console
$ npm install
```

## Testing

You can run tests with

```console
$ npm test
```

There's also a VSCode configuration for running and debugging the action locally. Just copy `.env.example` to `.env` and update the values and then select "Run action" in the run tab.

### Building

You are reponsible for building and commiting the final action code yourself. Before committing you should run and commit the results with your changes. This is also checked for in CI in case you forget.

```console
$ npm run build
```
