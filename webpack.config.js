const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {
    getDirectoriesBasenames
} = require('./build/utils.js')
const isProd = process.env.NODE_ENV.trim() == 'production'
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const pages = getDirectoriesBasenames(path.resolve('./src/pages'))

const instances = pages.map(page => {
    return new HtmlWebpackPlugin({
        template: `./pages/${page}/${page}.pug`,
        excludeAssets: [/-critical.css$/],
        filename: `${page}.html`
    })
})

const entries = pages.reduce((acc, page, i) => {
    acc[page] = `./pages/${page}/${page}.js`
    return acc
}, {})

const externalCSS = new MiniCssExtractPlugin('[name].css')
const fileLoaderChain = [{
    loader: 'file-loader',
    query: {
        useRelativePath: false,
        name: '[path][name].[ext]'
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
        extensions: ['.js', '.scss', '.pug'],
        alias: {
            'Components': path.resolve(__dirname, 'src/components/'),
            '@': path.resolve(__dirname, 'src')
        }
    },
    optimization: {
        splitChunks: {
            name: 'commons',
            minChunks: 2,
        }
    },
    devServer: {
        hot: false,
        open: true
    },
    mode: isProd ? 'production' : 'development',
    watch: !isProd,
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
            use: 'babel-loader',
        }, {
            test: /\.scss$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader
                },
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1,
                        sourceMap: !isProd,
                        minimize: isProd,
                    }
                }, {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: !isProd,
                    }
                }, {
                    loader: 'sass-loader',
                    options: {
                        sourceMap: !isProd,
                    }
                }
            ]
        }, {
            test: /\.(svg|png|jpg|gif|otf|ttf|woff|woff2)$/,
            use: fileLoaderChain
        }, {
            test: /\.svg$/,
            include: path.resolve(__dirname, 'node_modules'),
            use: fileLoaderChain
        }, {
            test: /\.svg$/,
            exclude: path.resolve(__dirname, 'node_modules'),
            use: 'svg-sprite-loader'
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
    plugins: [
        ...instances,
        externalCSS,
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),
        isProd && new CopyWebpackPlugin([{
            from: path.resolve(__dirname, 'public'),
            to: path.resolve(__dirname, 'dist'),
        }])
    ].filter(Boolean)
}

module.exports = config