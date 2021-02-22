# Commit Changes Action

![Check, Build, and Run](https://github.com/quizlet/commit-changes-action/workflows/Check,%20Build,%20and%20Run/badge.svg)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](docs/CODE_OF_CONDUCT.md)

This is an action that uses the [Github Git Database API][1] to commit changes to a branch. This allows for easier committing against protected branches, and avoids a lot of potential edge cases that can occur when using `git` directly.

## Inputs

| Name              | Default/Required             | Description                                                                                                                                                   |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message`         | **None**, required           | Message for the commit                                                                                                                                        |
| `glob-patterns`   | **None**, required           | List of [minimatch glob patterns][2]. Matching files with changes will be committed. See the [examples](#example-usage) for how to specify multiple patterns. |
| `token`           | Default Github Actions Token | Github token to authenticate as                                                                                                                               |
| `branch`          | Default branch for the repo  | Branch to commit the changes to                                                                                                                               |
| `append-run-info` | `true`                       | Whether to append information about the workflow to the commit                                                                                                |
| `retries`         | 10                           | Number of times to retry the commit (which may fail due to non-fastfoward upates)                                                                             |

## Outputs

| Name  | Description                                                                          |
| ----- | ------------------------------------------------------------------------------------ |
| `sha` | SHA of the resulting commit. Will be empty string if there were no changes to commit |

## Example usage

```yaml
uses: quizlet/commit-changes@[ref]
with:
  message: Automated commit
  glob-patterns: README.md
```

### Setting token

Useful when:

- You want to commit as a different actor than the default Github Actions token
- You want to use an admin user to commit to a protected branch

```yaml
uses: quizlet/commit-changes@[ref]
with:
  token: ${{ secret.ADMIN_TOKEN }}
  message: Automated commit
  glob-patterns: README.md
```

### Multiple glob patterns

#### Comma separated

```yaml
uses: quizlet/commit-changes@[ref]
with:
  message: Automated commit
  glob-patterns: README.md, *.json
```

#### Newline separated

```yaml
uses: quizlet/commit-changes@[ref]
with:
  message: Automated commit
  glob-patterns: |
    README.md
    # Comments are allowed
    *.json
```

## Resources

- [Tech @ Quizlet Blog Post][6]: Explains background for the project
- [Minimatch cheat sheat][3]
- [Minimatch glob tester][4]
- [globby-cli][5]: Useful for testing globs locally (i.e. `npx globby-cli --gitignore [glob]`)

## Contributing

Feel free to check out our [Contributor's Guide](docs/CONTRIBUTING.md).

## License

The code and documentation in this project are released under the [MIT License](LICENSE).

[1]: https://docs.github.com/en/free-pro-team@latest/rest/reference/git
[2]: https://github.com/isaacs/minimatch
[3]: https://github.com/motemen/minimatch-cheat-sheet
[4]: https://globster.xyz/
[5]: https://github.com/jamiebuilds/globby-cli
[6]: https://medium.com/tech-quizlet/circumventing-branch-protection-for-fun-and-gitops-5133e234de7b
