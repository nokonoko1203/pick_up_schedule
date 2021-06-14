# gas_app

## setup

- setup git

```shell
git init
gibo dump Node > .gitignore
```

- comment out `dist` in .gitignore

```.gitignore
...
# Nuxt.js build / generate output
.nuxt
#dist
...
```

- create gas project

```shell
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

```shell
yarn clasp login
yarn clasp create
? Create which script? sheets
```

- edit `.clasp.json`

```json
{
  "scriptId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "rootDir": "./dist"
}
```

- move `appsscript.json`

```shell
mv appsscript.json dist
```

- edit `appsscript.json`

```
{
  // "timeZone": "America/New_York",
  "timeZone": "Asia/Tokyo",
  ...
}
```

- install development package

```shell
yarn add -D typescript @types/google-apps-script
yarn add -D webpack webpack-cli
yarn add -D @babel/core @babel/preset-typescript babel-loader
yarn add -D gas-webpack-plugin
```

- make tsconfig.json

```shell
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

```shell
cat << EOF > .babelrc
{
  "presets": [
    "@babel/preset-typescript"
  ]
}
EOF
```

- make webpack.config.js

```shell
cat << EOF > webpack.config.js
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const GasPlugin = require("gas-webpack-plugin");

module.exports = {
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

-  deploy

```shell
yarn deploy
```

- view project

```shell
yarn clasp open
```

- run script with GUI