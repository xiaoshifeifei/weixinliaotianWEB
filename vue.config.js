
const path = require('path')

// compression-webpack-plugin，添加压缩文件类型
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = ['js', 'css']
const isProd = process.env.NODE_ENV === 'production'

function resolve(dir) {
  return path.join(__dirname, dir)
}

const assetsCDN = {
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    vuex: 'Vuex',
    axios: 'axios',
  },
  css: [
  ],
  js: [
    './vue.min.js',
    './vue-router.min.js',
    './vuex.min.js',
    './axios.min.js',
  ]
}

// vue.config.js
const vueConfig = {
  // 公共路径(必须有的)
  publicPath: "./",
  // 输出文件目录
  outputDir: "dist",
  // 静态资源存放的文件夹(相对于ouputDir)
  assetsDir: "static",
  runtimeCompiler: false,
  devServer: {
    open: true,
    port: 8080,
    host: '0.0.0.0',
    https: false,
    proxy: {//配置跨域
      '/api': {
        target: 'http://10.10.10.118:8094/',//真实地址
        // target: 'http://101.35.46.181:8094',//这里后台的地址模拟的;应该填写你们真实的后台接口
        ws: true,
        changOrigin: true,//允许跨域
        pathRewrite: {
          '^/api': ''
          //请求的时候使用这个api就可以
        }
      }, 
      '/file': {
        target: 'http://10.10.10.118:8088/',//真实地址 10.10.10.118
        // target: 'http://101.35.46.181:8094',//这里后台的地址模拟的;应该填写你们真实的后台接口
        ws: true,
        changOrigin: true,//允许跨域
        pathRewrite: {
          '^/file': ''
          //请求的时候使用这个api就可以
        }
      },
    }
  },
  configureWebpack: {
    // webpack plugins
    plugins: [
      // 配置大文件压缩相关参数
      new CompressionWebpackPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 10240,
        minRatio: 0.8
      })
    ],

    // if prod, add externals
    externals: isProd ? assetsCDN.externals : {},
  },

  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))

    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-icon-loader')
      .loader('vue-svg-icon-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]'
      })

    // if prod is on
    // assets require on cdn
    if (isProd) {
      config.plugin('html').tap(args => {
        args[0].cdn = assetsCDN
        return args
      })
    }
  },
  pluginOptions: {
    "style-resources-loader": {
      preProcessor: "less",
      patterns: [
        //全局加载 less 变量
        path.resolve(__dirname, "./src/assets/css/variable.less")
      ]
    }
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {},
          javascriptEnabled: true
        }
      }
    }
  },

  // 是否为生产环境构建生成 source map？
  productionSourceMap: false,
  // lintOnSave: undefined,
  lintOnSave: false,
  // babel-loader no-ignore node_modules/*
  transpileDependencies: []
}

module.exports = vueConfig
