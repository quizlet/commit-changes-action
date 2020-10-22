# Commit Changes Action

This is an action that uses the [Github Git Database API][1] to commit changes to a branch.

## Inputs

| Name              | Required | Default                      | Description                                                                                                                                           |
| ----------------- | -------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `token`           | Y        | Default Github Actions Token | Github token to authenticate as                                                                                                                       |
| `branch`          | N        | Default branch for the repo  | Branch to commit the changes to                                                                                                                       |
| `message`         | Y        | N/A                          | Message for the commit                                                                                                                                |
| `append-run-info` | N        | `true`                       | Whether to append information about the workflow to the commit                                                                                        |
| `glob-patterns`   | Y        | N/A                          | List of [minimatch glob patterns][2]. Matching files with changes will be committed. See [examples](#example-usage) for specifying multiple patterns. |
| `retries`         | N        | 10                           | Number of times to retry the commit (which may fail due to non-fastfoward upates)                                                                     |

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

## Setting token

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

### Multiple glob patters

#### Comma separated

```yaml
uses: quizlet/commit-changes@[ref]
with:
  message: Automated commit
  glob-patterns: README.md, *.json
```

#### Newline separated patterns

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

- [Minimatch cheat sheat][3]

[1]: https://docs.github.com/en/free-pro-team@latest/rest/reference/git
[2]: https://github.com/isaacs/minimatch
[3]: https://github.com/motemen/minimatch-cheat-sheet
