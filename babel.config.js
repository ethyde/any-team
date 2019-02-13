module.exports = function (api) {
  const presets = [
    [
      '@babel/env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ]

  const plugins = []

  api.cache.using(() => process.env.NODE_ENV)

  return {
    presets,
    plugins
  }
}
