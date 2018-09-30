import { fetchFromCodeCov, imageTemplate } from "./helper";

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
  const baseSha = danger.github.pr.base.sha;
  const lastCommit = danger.git.commits.pop() || false;
  if (lastCommit === false) {
    // We do not have a commit in this pr
    return;
  }
  const lastCommitSha = lastCommit.sha;
  const repoName = danger.github.pr.base.repo.full_name;

  const baseResult = await fetchFromCodeCov(repoName, baseSha);
  const lastCommitInPr = await fetchFromCodeCov(repoName, lastCommitSha);

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
    parseFloat(baseResult.commit.totals.c);

  const change = diff >= 0 ? Change.increase : Change.decrease;
  const absDiffFixed = Math.abs(diff).toFixed(1);
  const sign = change === Change.increase ? "+" : "%E2%80%93";
  const color = change === Change.increase ? "green" : "red";
  const percentage = parseFloat(lastCommitInPr.commit.totals.c).toFixed(1);
  const shieldUrlDiff = `${baseShieldUrl}/coverage-${sign}${absDiffFixed}%25-${color}.svg${shieldQueryParams}`;
  const shieldUrlResult = `${baseShieldUrl}/%3D-${percentage}%25-blue.svg${shieldQueryParams}`;

  message(imageTemplate(shieldUrlDiff) + imageTemplate(shieldUrlResult));
}
