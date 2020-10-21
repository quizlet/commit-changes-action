import {GitHub} from '@actions/github/lib/utils';
import _ from 'lodash';
import {Endpoints} from '@octokit/types';
import * as core from '@actions/core';

export type Octokit = InstanceType<typeof GitHub>;
type Tree = Endpoints['POST /repos/:owner/:repo/git/trees']['parameters']['tree'];

export interface CreateOrUpdateFilesParams {
  owner: string;
  repo: string;
  branch?: string;
  message: string;
  files: Record<string, string>; // Key is path, value is contents
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
  // Get info about the current state of the target branch
  const ref = `head/${branch ?? (await getDefaultBranch(octokit, {owner, repo}))}`;
  const {data: baseRef} = await octokit.git.getRef({owner, repo, ref});
  const {data: baseTree} = await octokit.git.getTree({owner, repo, tree_sha: baseRef.object.sha, recursive: 'true'});

  // Construct the new tree
  const tree: Tree = _.map(files, (content, path) => {
    // TODO(cooper): Make this a bit safer by checking for an existing entry, ensuring it's a blob, and grabbing it's mode
    return {
      path,
      content,
      type: 'blob',
      mode: '100644',
    };
  });
  const {data: newTree} = await octokit.git.createTree({owner, repo, base_tree: baseTree.sha, tree});

  // Commit the new tree
  const {data: commit} = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: newTree.sha,
    parents: [baseTree.sha],
  });
  core.info(`Created commit with sha ${commit.sha}`);

  // Update the branch to point at the commmit
  const {data: updatedRef} = await octokit.git.updateRef({owner, repo, ref, sha: commit.sha});
  core.info(`Updated ${ref} to ${updatedRef.object.sha}`);

  return updatedRef.object.sha;
}
