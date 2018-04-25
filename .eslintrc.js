// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    "jquery": true, // 如果有通过 webpack.ProvidePlugin 导入jquery需要将这项设置为true，否则eslint会报$ is not defined
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': 'error',
    // 函数前空格
    'space-before-function-paren':0,
    // 缩进数
    "indent": ["error", 4],
    // 结尾空行
    "eol-last": 0,
    // 是否需要分号
    "semi": ["error", "always"],
  }
}
