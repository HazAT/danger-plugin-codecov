import codecov from "./index";

jest.mock("./helper", () => ({
  fetchFromCodeCov: jest
    .fn()
    .mockImplementation((repoName: string, sha: string) => {
      const fs = require("fs");
      const path = require("path");
      return Promise.resolve(
        JSON.parse(
          fs.readFileSync(path.join("src", "test", `${sha}.json`), "utf8"),
        ),
      );
    }),
  imageTemplate: jest.fn().mockImplementation((url: string) => url),
}));

declare var global: any;

global.message = (message: string) => console.log(message);
global.danger = {
  git: {
    commits: [
      {
        sha: "97ca5b51ac25341d17545abdb6a9bf76de5499a3",
      },
    ],
  },
  github: {
    pr: {
      base: {
        repo: {
          full_name: "test",
        },
        sha: "eb4f9a4b8de302e124ee9ccb0f64b318266cb4ad",
      },
    },
  },
};

describe("codecov()", () => {
  test("codecov", async () => {
    expect(codecov()).toBeTruthy();
  });
});
