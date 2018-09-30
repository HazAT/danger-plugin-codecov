# danger-plugin-codecov

[![npm version](https://badge.fury.io/js/danger-plugin-codecov.svg)](https://badge.fury.io/js/danger-plugin-codecov)

> Print coverage report from codecov.io

![assets/result.png](assets/result.png?raw=1)

## Usage

Install:

```sh
yarn add danger-plugin-codecov --dev
```

At a glance:

```js
// dangerfile.js|ts
import { schedule } from "danger";
import codecov from "danger-plugin-codecov";

schedule(codecov());
```

### Options

```js
schedule(
  codecov({
    callback: (baseResult: any, lastCommitResult: any) => {
      // Write your own stuff here with baseResult / lastCommitResult
      // JSON response of codecov.io API
    }
  })
);
```
