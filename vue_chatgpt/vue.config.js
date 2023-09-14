const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === "production"?"/static/vue_chatgpt/dist/":"/",
  // publicPath: process.env.NODE_ENV === "production"?"/static/vue_chatgpt/dist/":"/",
})
