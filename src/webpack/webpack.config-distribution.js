const path = require('path');
const dpat = require('@deskpro/apps-dpat');

module.exports = function (env) {

  const PROJECT_ROOT_PATH = env && env.DP_PROJECT_ROOT ? env.DP_PROJECT_ROOT : path.resolve(__dirname, '../../');
  const DEBUG = env && env.NODE_ENV === 'development';
  const ENVIRONMENT =  env && env.NODE_ENV ? env.NODE_ENV : 'production';

  const buildManifest = new dpat.BuildManifest(
    PROJECT_ROOT_PATH,
    { distributionType: 'production', packagingType: 'cdn' }
  );

  const resources = dpat.Resources.copyDescriptors(buildManifest, PROJECT_ROOT_PATH);
  const babelOptions = dpat.Babel.resolveOptions(PROJECT_ROOT_PATH, { babelrc: false });
  // the relative path of the assets inside the distribution bundle
  const ASSET_PATH = 'assets';

  const extractCssPlugin = new dpat.Webpack.ExtractTextPlugin({ filename: '[name].css', publicPath: `/${ASSET_PATH}/`, allChunks: true });

  const configParts = [{}];
  configParts.push({
    devtool: DEBUG ? 'source-map' : false,
    entry: {
      main: [ path.resolve(PROJECT_ROOT_PATH, 'src/webpack/entrypoint.js') ]
      //vendor bundle created by CommonsChunkPlugin
    },
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          include: [
            path.resolve(PROJECT_ROOT_PATH, 'src/main/javascript'),
          ],
          options: babelOptions
        },
        {
          test: /\.css$/,
          use: extractCssPlugin.extract({ use: ['style-loader', 'css-loader'] })
        },
        {
          include: [ path.resolve(PROJECT_ROOT_PATH, 'src/main/sass') ],
          loader: extractCssPlugin.extract({ use: ['css-loader', 'sass-loader'] }),
          test: /\.scss$/
        },

        { test: /\.(png|jpg)$/, loader: 'url-loader', options: { limit: 15000 } },
        { test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader' },
        { test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/octet-stream' } },
        { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader', options: { limit: 10000, mimetype: 'image/svg+xml' } },
        { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } }
      ],
    },
    output: {
      pathinfo: DEBUG,
      chunkFilename: '[name].js',
      filename: '[name].js',
      path: path.resolve(PROJECT_ROOT_PATH, 'dist', ASSET_PATH)
    },
    plugins: [
      extractCssPlugin,

      new dpat.Webpack.DefinePlugin({
        DEBUG: DEBUG,
        DPAPP_MANIFEST: JSON.stringify(buildManifest.getContent()),
        'process.env.NODE_ENV': JSON.stringify(ENVIRONMENT)
      }),

      // for stable builds, in production we replace the default module index with the module's content hashe
      new dpat.Webpack.HashedModuleIdsPlugin(),
      new dpat.Webpack.optimize.UglifyJsPlugin({
        sourceMap: DEBUG,
        compress: { unused: true, dead_code: true, warnings: false }
      }),

      // replace a standard webpack chunk hashing with custom (md5) one
      new dpat.Webpack.WebpackChunkHash(),

      // vendor libs + extracted manifest
      new dpat.Webpack.optimize.CommonsChunkPlugin({
        name: ['vendor'],
        minChunks: function (module) {
          // this assumes your vendor imports exist in the node_modules directory
          return module.context && module.context.indexOf("node_modules") !== -1;
        }
      }),
      new dpat.Webpack.optimize.CommonsChunkPlugin({ name: ['manifest'], minChunks: Infinity }),
      // // export map of chunks that will be loaded by the extracted manifest
      new dpat.Webpack.ChunkManifestPlugin({ filename: 'manifest.json', manifestVariable: 'webpackManifest' }),
      // mapping of all source file names to their corresponding output file
      new dpat.Webpack.ManifestPlugin({ fileName: 'asset-manifest.json' }),

      new dpat.Webpack.CopyWebpackPlugin(resources, { debug: true, copyUnmodified: true }),
    ],
    resolve: {
      extensions: ['*', '.js', '.jsx', '.scss', '.css'],
      modules: [ "node_modules", dpat.path("node_modules"), path.join(PROJECT_ROOT_PATH, "node_modules") ],
    },
    resolveLoader: {
      modules: [ "node_modules", dpat.path("node_modules"), path.join(PROJECT_ROOT_PATH, "node_modules") ]
    },
    node: { fs: 'empty' },
    bail: true
  });

  return Object.assign.apply(Object, configParts)
};
