declare var require: (string) => any;
// tslint:disable-next-line
const fetch = require("node-fetch");

export async function fetchFromCodeCov(repoName: string, sha: string) {
  const codecovApiBaseUrl = "https://codecov.io/api/gh";
  return fetch(`${codecovApiBaseUrl}/${repoName}/commit/${sha}`).then((res) =>
    res.json(),
  );
}

export function imageTemplate(url: string): string {
  return `<img src="${url}" />`;
}
