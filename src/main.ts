import * as core from '@actions/core';
import * as github from '@actions/github';
import glob from '@actions/glob';
import fs from 'fs';
import {CreateOrUpdateFilesParams, createOrUpdateFiles} from './commitFiles';

async function main(): Promise<void> {
  const token = core.getInput('token');
  const octokit = github.getOctokit(token);
  const {repo} = github.context;

  // Check to see if the token has admin permissions on the repo. Theoretically we could be clever and check against
  // the branch protection rules to see if this is even required, but right now admin is required for all known use
  // cases
  const {data: user} = await octokit.users.getAuthenticated();
  const {data: repoPerms} = await octokit.repos.getCollaboratorPermissionLevel({...repo, username: user.login});
  if (repoPerms.permission !== 'admin') {
    core.setFailed('Token does not have admin on the repository');
  }

  const branch = core.getInput('branch');
  const message = core.getInput('message');

  const patterns = core.getInput('patterns');
  const globber = await glob.create(patterns);
  const files: CreateOrUpdateFilesParams['files'] = {};
  for await (const path of globber.globGenerator()) {
    files[path] = await fs.promises.readFile(path, 'utf-8');
  }

  await createOrUpdateFiles(octokit, {...repo, branch, message, files});
}

async function run(): Promise<void> {
  try {
    await main();
  } catch (error) {
    core.setFailed(error.message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
