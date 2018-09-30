declare var require: (string) => any;
// tslint:disable-next-line
const fetch = require("node-fetch");

import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL";
declare var danger: DangerDSLType;

export declare function message(message: string): void;
export declare function warn(message: string): void;
export declare function fail(message: string): void;
export declare function markdown(message: string): void;

export interface Options {
  callback?: (baseResult: any, lastCommitResult: any) => void;
}

export default async function codecov(options: Options = {}) {
  const lastCommit = danger.git.commits.pop() || false;
  if (lastCommit === false) {
    // We do not have a commit in this pr
    return;
  }
  const lastCommitSha = lastCommit.sha;
  const repoName = danger.github.pr.base.repo.full_name;

  const baseResult = await codecovBranch(repoName);
  const lastCommitInPr = await codecovCommit(repoName, lastCommitSha);

  if (options.callback) {
    // If callback is set we return the result and do nothing
    options.callback(baseResult, lastCommitInPr);
    return;
  }

  enum Change {
    increase = "increase",
    decrease = "decrease",
  }

  const baseShieldUrl = "https://img.shields.io/badge";
  const shieldQueryParams = "?longCache=true&style=flat-square";

  const diff =
    parseFloat(lastCommitInPr.commit.totals.c) -
    parseFloat(baseResult.commits.pop().totals.c);

  const change = diff >= 0 ? Change.increase : Change.decrease;
  const absDiffFixed = Math.abs(diff).toFixed(1);
  const sign = change === Change.increase ? "+" : "%E2%80%93";
  const color = change === Change.increase ? "green" : "red";
  const percentage = parseFloat(lastCommitInPr.commit.totals.c).toFixed(1);
  const shieldUrlDiff = `${baseShieldUrl}/coverage-${sign}${absDiffFixed}%25-${color}.svg${shieldQueryParams}`;
  const shieldUrlResult = `${baseShieldUrl}/%3D-${percentage}%25-blue.svg${shieldQueryParams}`;

  message(imageTemplate(shieldUrlDiff) + imageTemplate(shieldUrlResult));
}

const codecovApiBaseUrl = "https://codecov.io/api/gh";
async function codecovCommit(repoName: string, sha: string) {
  return fetch(`${codecovApiBaseUrl}/${repoName}/commit/${sha}`).then((res) =>
    res.json(),
  );
}

async function codecovBranch(repoName: string, branch: string = "master") {
  return fetch(`${codecovApiBaseUrl}/${repoName}/branch/${branch}`).then((res) =>
    res.json(),
  );
}

function imageTemplate(url: string): string {
  return `<img src="${url}" />`;
}
