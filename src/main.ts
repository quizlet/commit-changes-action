import * as core from '@actions/core';
import * as github from '@actions/github';
import fs from 'fs';
import path from 'path';
import globby from 'globby';
import {createOrUpdateFiles} from './commitFiles';
import {getBooleanInput, getDelimitedArrayInput, getIntegerInput} from './utils/inputs';

async function run(): Promise<void> {
  // TODO(cooper): Check token perms
  const token = core.getInput('token');
  const octokit = github.getOctokit(token);
  const {repo} = github.context;

  const branch = core.getInput('branch');

  let message = core.getInput('message', {required: true});
  const appendRunInfo = getBooleanInput('append-run-info');
  if (appendRunInfo) {
    const url = `https://github.com/${repo.owner}/${repo.repo}/actions/runs/${github.context.runId}`;
    message += `\nCommit made by Github Actions ${url}`;
  }

  const patterns = getDelimitedArrayInput('glob-patterns', {required: true});
  const paths = await globby(patterns, {gitignore: true});
  const files = new Map<string, string>();
  for await (const p of paths) {
    const repoPath = path.relative(process.cwd(), p);
    const contents = await fs.promises.readFile(p, 'base64');
    files.set(repoPath, contents);
  }
  core.debug(`Files to commit: ${[...files.keys()]}`);
  if (!files.size) {
    core.warning('No files matched glob patterns.');
    return;
  }

  const retries = getIntegerInput('retries');
  for (let i = 0; i <= retries; i++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const sha = await createOrUpdateFiles(octokit, {...repo, branch, message, files});
      core.setOutput('sha', sha);
      return;
    } catch (error) {
      core.warning(`Error while performing commit (attempt ${i + 1}/${retries + 1}): ${error}`);
    }
  }
  core.setFailed(`Could not perform commit after ${retries + 1} attempts`);
}

run().catch(err => core.setFailed(err));
