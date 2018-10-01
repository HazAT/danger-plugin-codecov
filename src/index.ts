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

  const baseCoverage = await retry(codecovBranch(repoName));
  const lastCommitCoverage = await retry(
    codecovCommit(repoName, lastCommitSha),
  );

  if (options.callback) {
    // If callback is set we return the result and do nothing
    options.callback(baseCoverage, lastCommitCoverage);
    return;
  }

  enum Change {
    increase = "increase",
    decrease = "decrease",
  }

  const baseShieldUrl = "https://img.shields.io/badge";
  const shieldQueryParams = "?longCache=true&style=flat-square";

  const diff = parseFloat(lastCommitCoverage) - parseFloat(baseCoverage);

  const change = diff >= 0 ? Change.increase : Change.decrease;
  const absDiffFixed = Math.abs(diff).toFixed(1);
  const sign = change === Change.increase ? "+" : "%E2%80%93";
  const color = change === Change.increase ? "green" : "red";
  const percentage = parseFloat(lastCommitCoverage).toFixed(1);
  const shieldUrlDiff = `${baseShieldUrl}/coverage-${sign}${absDiffFixed}%25-${color}.svg${shieldQueryParams}`;
  const shieldUrlResult = `${baseShieldUrl}/%3D-${percentage}%25-blue.svg${shieldQueryParams}`;

  message(imageTemplate(shieldUrlDiff) + imageTemplate(shieldUrlResult));
}

async function timeout(delay: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

async function retry<T>(call: Promise<T>, times: number = 5) {
  let result: T | undefined;
  for (let i = 0; i < times; i++) {
    try {
      result = retrieveCoverage(await call);
      if (result) {
        break;
      }
      await timeout(5000);
    } catch (e) {
      console.error(e);
    }
  }
  return result;
}

function retrieveCoverage(report: any) {
  try {
    return report.commit.totals.c;
  } catch {
    // nothing here
  }
  try {
    return report.commits.pop().totals.c;
  } catch {
    // nothing here
  }
  return;
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
