import * as core from '@actions/core';
import * as github from '@actions/github';
import simpleGit, {SimpleGit} from 'simple-git';
import {getDelimitedArrayInput} from './util/inputs';

async function main(): Promise<void> {
  const git: SimpleGit = simpleGit();

  const token = core.getInput('token');
  const octokit = github.getOctokit(token);

  const {data: user} = await octokit.users.getAuthenticated();
  const {data: repo} = await octokit.repos.get({...github.context.repo});

  const {data: repoPerms} = await octokit.repos.getCollaboratorPermissionLevel({
    ...github.context.repo,
    username: user.login,
  });
  // We could probably be a lot more clever here by checking the branch protection rules to see if it's required, but
  // since all planned usages of this require admin to work, I don't feel like being clever
  if (repoPerms.permission !== 'admin') {
    core.setFailed('Token does not have admin on the repository');
  }

  const target = core.getInput('target') || repo.default_branch;
  try {
    await octokit.repos.getBranch({...github.context.repo, branch: target});
  } catch (error) {
    core.setFailed(`Failed to get get branch "${target}": ${error}`);
  }

  const patterns = getDelimitedArrayInput('patterns') || ['*'];
  await git.add(patterns);
  const status = await git.status();
  if (!status.staged) {
    core.info('No changes to commit. Exiting');
  }
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
