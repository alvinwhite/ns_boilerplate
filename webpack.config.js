const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin')
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin')
const { getDirectoriesBasenames } = require('./utils.js')
const isProd = process.env.NODE_ENV.trim() == 'production'

const pages = getDirectoriesBasenames(path.resolve('./src/pages'))

const instances = pages.map(page => {
    return new HtmlWebpackPlugin({
        template:`./pages/${page}/${page}.pug`,
        excludeAssets: [/\-critical.css$/],
        filename: `${page}.html`
    })
})

const entries = pages.reduce((acc, page, i) => {
    acc[page] = `./pages/${page}/${page}.js`
    return acc
}, {})

const criticalCSS = new ExtractTextPlugin('[name]-critical.css')
const externalCSS = new ExtractTextPlugin('[name].css')
const processStyles = [{
    loader: 'css-loader',
    options: {
        importLoaders: 1,
        sourceMap: !isProd,
        minimize: !isProd,
    }
    }, {
        loader: 'postcss-loader',
        options: {
            sourceMap: !isProd,
        }
    }, {
        loader: 'stylus-loader',
        options: {
            sourceMap: !isProd,
            'resolve url': true,
        }
}]


const config = {
    context: path.resolve(__dirname, 'src'),
    entry: entries,
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.js', '.styl', '.pug'],
        alias: {
            'Components': path.resolve(__dirname, 'src/components/'),
            '@': path.resolve(__dirname, 'src')
        }
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'eslint-loader',
            enforce: 'pre',
            include: path.resolve(__dirname, 'src'),
            options: {
                formatter: require('eslint-friendly-formatter')
            }
        }, {
            test: /\.js$/,
            include: path.resolve(__dirname, 'src'),
            use: {
                loader: 'babel-loader',
            }
        }, {
            test: /\.styl$/,
            exclude: /\-critical.styl$/,
            use: externalCSS.extract({ use: processStyles })
        }, {
            test: /\-critical.styl$/,
            use: criticalCSS.extract({ use: processStyles })
        }, {
            test: /\.(svg|png|jpg|gif|otf|ttf|woff|woff2)$/,
            use: [{
                loader: 'file-loader',
                query: {
                    useRelativePath: false,
                    name: '[path][name].[ext]'
                }
            }]
        }, {
            test: /\.pug$/,
            use: ['html-loader', {
                loader: 'pug-html-loader',
                options: {
                    basedir: path.resolve(__dirname, 'src')
                }
            }]
        }]
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'public'),
        watchContentBase: true,
        clientLogLevel: 'none',
        compress: true,
    },
    plugins: [
        ...instances,
        new HtmlWebpackExcludeAssetsPlugin(),
        criticalCSS,
        externalCSS,
        new StyleExtHtmlWebpackPlugin({
            chunk: '[name]-critical.css',
            position: 'head-top'
        })
    ]
}


if (isProd) {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: true
        }),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'public'),
                to: path.resolve(__dirname, 'dist'),
            }
        ])
    )
} else {
    config.devtool = '#cheap-module-source-map'
}

module.exports = config