const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/e-virt-table-vue2/' : '/',
  transpileDependencies: true
})
