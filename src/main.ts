import * as core from '@actions/core';
import * as github from '@actions/github';
import * as glob from '@actions/glob';
import fs from 'fs';
import path from 'path';
import {createOrUpdateFiles} from './commitFiles';

async function run(): Promise<void> {
  // TODO(cooper): Check token perms
  const token = core.getInput('token');
  const octokit = github.getOctokit(token);
  const {repo} = github.context;

  const branch = core.getInput('branch');
  const message = core.getInput('message');

  const patterns = core.getInput('patterns');
  const globber = await glob.create(patterns);
  const files = new Map<string, string>();
  for await (const p of globber.globGenerator()) {
    const repoPath = path.relative(process.cwd(), p);
    const contents = await fs.promises.readFile(p, 'base64');
    files.set(repoPath, contents);
  }
  core.debug(`Files to commit: ${[...files.keys()]}`);

  const sha = await createOrUpdateFiles(octokit, {...repo, branch, message, files});
  core.setOutput('sha', sha);
}

run().catch(err => core.setFailed(err));
