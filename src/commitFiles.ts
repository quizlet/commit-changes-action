import {GitHub} from '@actions/github/lib/utils';
import {Endpoints} from '@octokit/types';
import * as core from '@actions/core';
import _ from 'lodash';

export type Octokit = InstanceType<typeof GitHub>;
type Tree = Endpoints['POST /repos/:owner/:repo/git/trees']['parameters']['tree'];

export interface CreateOrUpdateFilesParams {
  owner: string;
  repo: string;
  branch?: string;
  message: string;
  files: Map<string, string>; // Key is path, value is base64 encoded contents
}

async function getDefaultBranch(
  octokit: Octokit,
  params: Pick<CreateOrUpdateFilesParams, 'owner' | 'repo'>
): Promise<string> {
  const {data: repo} = await octokit.repos.get(params);
  return repo.default_branch;
}

export async function createOrUpdateFiles(
  octokit: Octokit,
  {owner, repo, branch, message, files}: CreateOrUpdateFilesParams
): Promise<string> {
  const ref = `heads/${branch ?? (await getDefaultBranch(octokit, {owner, repo}))}`;
  let baseRef;
  try {
    const res = await octokit.git.getRef({owner, repo, ref});
    baseRef = res.data;
  } catch (error) {
    throw Error(`Could not get base ref ${owner}/${repo}:${ref}: ${error}`);
  }
  const {data: baseCommit} = await octokit.git.getCommit({owner, repo, commit_sha: baseRef.object.sha});
  core.debug(`Base ref ${baseRef.ref} is at commit ${baseCommit.sha}`);

  const {data: baseTree} = await octokit.git.getTree({owner, repo, tree_sha: baseCommit.tree.sha, recursive: 'true'});
  core.debug(`Base tree is at ${baseTree.sha}`);

  // Construct the new tree
  const tree: Tree = [];
  for await (const [path, content] of files) {
    const previousEntry = _.find(baseTree.tree, {path});
    if (previousEntry && previousEntry.type !== 'blob') {
      throw Error('Refusing to replace non-blob tree entry');
    }

    const {data: blob} = await octokit.git.createBlob({owner, repo, content, encoding: 'base64'});
    if (previousEntry?.sha !== blob.sha) {
      tree.push({
        path,
        sha: blob.sha,
        type: 'blob',
        mode: '100644',
      });
    } else {
      core.debug(`${path} had no changes to commit`);
    }
  }
  if (!tree.length) {
    core.info('No changes to commit!');
    return '';
  }

  // Create the new tree
  let newTree;
  try {
    const res = await octokit.git.createTree({owner, repo, tree, base_tree: baseTree.sha});
    newTree = res.data;
  } catch (error) {
    throw Error(`Could not create new tree: ${error}`);
  }
  core.debug(`Created new tree at ${newTree.sha}`);

  // Commit the new tree
  const {data: commit} = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: newTree.sha,
    parents: [baseCommit.sha],
  });
  core.info(`Created commit with sha ${commit.sha}`);

  // Update the branch to point at the commmit
  const {data: updatedRef} = await octokit.git.updateRef({owner, repo, ref, sha: commit.sha});
  core.info(`Updated ${baseRef.ref} to ${updatedRef.object.sha}`);

  return updatedRef.object.sha;
}
