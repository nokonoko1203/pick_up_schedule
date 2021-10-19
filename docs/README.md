# docs for development

参考：[https://www.ykicchan.dev/posts/2020-07-12](https://www.ykicchan.dev/posts/2020-07-12)

## 開発の流れ

- `clasp`（GASのCLIツール・慣れたIDE上でGASが書けるようになった・Googleが作成）や`@types/google-apps-script`（GAS用の型定義）などのGASでTSを利用するためのパッケージなどを導入
- claspでプロジェクトをGASに作成
- tsでロジックを書く
- GASではトップレベル関数しか実行できないのでindex.tsを用意しロジックをインポートしてglobalに登録する
    - globalに登録しておけばgas-webpack-pluginがトップレベルに配置する
- babelでtsをトランスパイル
- webpackでjsを1つにまとめる
- claspでビルド
- なぜかdotenv周り（というかGASとwebpackとdotenvの相性？）でハマることがあるので注意

## **setup**

- setup git

```bash
git init
gibo dump Node > .gitignore
```

- comment out `dist` in .gitignore

```
...
# Nuxt.js build / generate output
.nuxt
#dist
...
```

- create gas project

```bash
yarn init -y
mkdir src dist
touch src/index.ts
touch README.md
npm i -D prettier
touch .prettierrc
echo -en '{\n  "printWidth": 100,\n  "semi": true,\n  "trailingComma": "es5",\n  "tabWidth": 2,\n  "singleQuote": true\n}' >> .prettierrc
yarn add -D @google/clasp
```

- create project

```bash
yarn clasp login
yarn clasp create
? Create which script? sheets
```

- edit `.clasp.json`

```json
{
  // "timeZone": "America/New_York",
  "timeZone": "Asia/Tokyo",
  ...
}
```

- move `appsscript.json`

```bash
mv appsscript.json dist
```

- edit `appsscript.json`

```json
{
  // "timeZone": "America/New_York",
  "timeZone": "Asia/Tokyo",
  ...
}
```

- install development package

```bash
yarn add -D typescript @types/google-apps-script
yarn add -D webpack webpack-cli
yarn add -D @babel/core @babel/preset-typescript babel-loader
yarn add -D gas-webpack-plugin
```

- make tsconfig.json

```bash
cat << EOF > ./tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "es5",
      "es6",
      "es7",
    ],
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "esnext",
    "downlevelIteration": true,
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  },
  "include": ["./src/**/*"]
}
EOF
```

- make .babelrc

```bash
cat << EOF > .babelrc
{
  "presets": [
    "@babel/preset-typescript"
  ]
}
EOF
```

- make webpack.config.js

```bash
cat << EOF > webpack.config.js
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const GasPlugin = require("gas-webpack-plugin");

module.exports = {
  target: 'node',
  mode: "development",
  devtool: false,
  context: __dirname,
  entry: "./src/index.ts",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  plugins: [new GasPlugin()],
};
EOF
```

- edit package.json

```json
{
  ...
  "scripts": {
    "build": "webpack",
    "deploy": "yarn build && clasp push",
    "lint": "eslint --fix --ext .ts,.js --ignore-path .gitignore ."
  },
  ...
}
```

- deploy

```bash
yarn deploy
```

- view project

```bash
yarn clasp open
```

- run script with GUI