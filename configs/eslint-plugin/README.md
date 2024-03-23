# @sektek/eslint-plugin

## Installation

```sh
npm install --save-dev eslint @sektek/eslint-plugin
```

## Setup

Extend the configs you want in your `.eslintrc.js`:

```js
module.exports = {
  extends: [
    'plugin:@sektek/typescript',
  ],
};
```

For TypeScript projects, you should also have a `tsconfig.json` file.

## Rules

The plugin is composed of the following configurations:

- `@sektek/recommended`: recommended rules for all JavaScript projects
- `@sektek/typescript`: An extension of `@sektek/recommended` including TypeScript-specific rules
