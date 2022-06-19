module.exports = {
    trailingComma: 'es5',
    semi: false,
    singleQuote: true,
    plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
    importOrder: ['^[./]'],
  };
  