const path = require('path');
const glob = require('glob'); // glob模块允许你使用 *等符号, 来写一个glob规则
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCssPlugin = require('purifycss-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin'); //打包前清理产出目录
module.exports = {
  devtool: 'inline-source-map',
  entry: {
    index: './src/main.js',
    // vendor: ["jquery", 'vue'] // 把第三方库或框架整合到一个vendor入库文件里
    jquery: 'jquery', // 单独把第三方库或框架作为一个入口文件加到页面上
    // vue: 'vue'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/js/[name].js',
    // 这里的[name], 跟entry里的key相互对应
    // 如果不设置publicPath，提取出来的css文件中引用的资源会以css文件所在的位子为跟目录去引用资源
    // 就会造成资源路径引用错误（打包后的资源引用路径是以url-loader中定义的outputPath为开头的）
    // 例：css中 background: url(img/be68719a9e63469fb846d7e1dec92b81.png) no-repeat;
    // 这个背景图就会从css的目录中去查找 img/be68719a9e63469fb846d7e1dec92b81.png
    publicPath: '/' // 打包生成的html中引用的地址会包括主机（绝对路径）
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.styl', '.css', '.scss', '.less'],
    // 为模块设置别名，使引用时更加方便，只需引用这里设置的名字就好，不用写路径
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      'common': path.resolve(__dirname, '../src/common/'),
      'js': path.resolve(__dirname, './src/js/'),
      'css': path.resolve(__dirname, './src/css/')
    }
  },
  module: {
    rules: [
      {
        /* 因为有些jquery插件需要用到全局的jq变量，通过expose-loader来把jquery暴露到全局 */
        /* 这里只是起到把变量暴露到全局的作用，并不能自动引用相关的模块，所有需要手动引入模块或者通过webpack.ProvidePlugin插件自动引入 */
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: 'jQuery'
        }, {
          loader: 'expose-loader',
          options: '$'
        }]
      }, {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader'
          }, {
            loader: 'postcss-loader',
            options: { sourceMap: true }
          }]
        })
      }, {
        // 该loader用于打包图片或文件
        // outputPath定义图片或文件导出的目录（会自动生成）
        // css和html引用资源时会自动带上outputPath的路径
        test: /\.(png|jpg|gif)/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
            outputPath: 'static/img/' // 路径为dist下（根据output.path）
          }
        }]
      }, {
        test: /\.(htm|html)$/i,
        use: ['html-withimg-loader'] // 打包在html中引用的img
      }, {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader'
          }, {
            loader: 'postcss-loader',
            options: { sourceMap: true }
          }, {
            loader: 'less-loader'
          }]
        })
      }, {
        test: /\.styl$/,
        use: ExtractTextPlugin.extract({ 
          // postcss-loader 需要在stylus之前，否则会出错（比如无法省略分号）
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader'
          }, {
            loader: 'postcss-loader',
            options: { sourceMap: true }
          }, {
            loader: 'stylus-loader'
          }]
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader'
          }, {
            loader: 'postcss-loader',
            options: { sourceMap: true }
          }, {
            loader: 'sass-loader'
          }]
        })
      }, {
        test: /\.(jsx|js)$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: /node_modules/
      }, {
        test: /\.(html|js|vue)$/, //这里匹配到的.html文件需要依赖html-loader或者html-withimg-loader才可使用
        enforce: "pre",
        loader: 'eslint-loader',
        exclude: /node_modules/,
        options: {
          formatter: require('eslint-friendly-formatter')   // 编译后错误报告格式
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']), // 每次打包会先清空dist目录
    new webpack.optimize.CommonsChunkPlugin({
      // 公共模块拆出来；主要做拆分和在页面上插入script的工作
      name: [ /*'vendor'  , 'vue' */ 'jquery'],
      /*这个数组里的值需要与entry入口文件的key对应，
        这个数组里的值都会被写入template页面的script上，
        如果数组里的值在entry里找不到对应的入口，则依然会生成一个文件加入到页面上，
        但是里头没有实际的代码， 只有一些webpack生成的代码*/
      filename: 'static/js/[name].js', // 路径为dist下（根据output.path）
      minChunks: 2
    }),
    // 使用ProvidePlugin加载的模块在使用时将不再需要import和require进行引入;相当于在所有js里import和require引入了相关的库
    // 主要做的是代替用户引入模块的作用
    // 这里定义的key就是为所有**模块**中可以使用的变量；但是这些变量在全局中是不存在的，如直接在控制台打印的话是不存在的；
    // 因为他们是被引用到各个单独的模块中的
    // 这里需要注意：通过这个插件引入的变量，eslint会报not defined 的错，
    // 需要处理一下在使用的地方通过行注释或块注释在某一特定的行上禁用所有规则 /* eslint-disable-line */
    new webpack.ProvidePlugin({
      $: 'jquery',
      // jQuery: 'jquery',
      // Vue: ['vue/dist/vue.esm.js', 'default'] // 插件文档里的写法
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      // 压缩html模板
      minify: {
        removeAttributeQuotes: true,
        removeComments: true,
        collapseWhitespace: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true
      },
      hash: true, // 引用的资源文件是否加上hash值
      template: './src/index.html' // 模板文件
    }),
    // new HtmlWebpackPlugin({
    //   // 当有多个页面的时候，再通过new HtmlWebpackPlugin生成一个实例就可以了
    //   // 需要指定filename,否则多个实例生成的html文件都是index，后面生成的就覆盖掉前面的了
    //   filename: 'page2.html',
    //   // 压缩html模板
    //   minify: {
    //     removeAttributeQuotes: true,
    //     removeComments: true,
    //     collapseWhitespace: true,
    //     removeScriptTypeAttributes: true,
    //     removeStyleLinkTypeAttributes: true
    //   },
    //   hash: true, // 引用的资源文件是否加上hash值
    //   template: './src/page2.html', // 模板文件
    //   chunks: ['jquery'] // 指定当前页面需要用到的文件
    // }),
    new ExtractTextPlugin('static/css/index.css'), // 把css提取出来成为文件;路径为dist下（根据output.path）
    new PurifyCssPlugin({
      // 精简css；只会打包有用到的样式；比如引入了bootstrap后使用了一些样式，打包时只会打包有用到的样式
      // ***注意：有一些动态加载的dom需要使用到的样式不能经过这个插件处理，
      // 否则，动态插入的dom将没有样式；因为在打包时页面没有引用相关样式，所以会被过滤掉
      paths: glob.sync(path.join(__dirname, 'src/*.html')) // glob模块允许你使用 *等符号, 来写一个glob规则
    }),
    new webpack.BannerPlugin('by wadejs'), // 在js文件开头加上相关信息
    new CopyWebpackPlugin([{
      // 将不经过打包（html中通过标签引入的）的文件复制资源到产出目录
      from: __dirname + '/src/public',
      to: './public'
    }])
  ],
  devServer: {
    clientLogLevel: 'warning',
    // 将 src 目录下的文件，，作为可访问文件，相当于服务器从哪个位置启动（根目录）；
    // 基本没啥用，因为使用HtmlWebpackPlugin插件会自动帮你把资源引入
    // 引用静态的文件时才有用
    // contentBase: path.resolve(__dirname, 'src'), 
    compress: true, // 是否压缩
    port: 8888,
    inline: true,
    open: false, // 是否自动打开浏览器
  }
};