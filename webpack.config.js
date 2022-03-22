const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NODE_ENV = process.env.NODE_ENV;

// const distPath = NODE_ENV == 'development' ? 'dist' : 'build';

module.exports = {
    mode: 'development', // production
    entry: {
        main: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        assetModuleFilename: '[name][ext]',
        clean: true,
    },
    devtool: 'inline-source-map', // keeps where all the content came from, all modules css, js etc... lets the browser know where these come from
    devServer: {
        // contentBase: path.resolve(__dirname, 'dist'), // deprecated
        // static: {
        //     directory: path.join(__dirname, 'dist'),
        // },
        static: path.resolve(__dirname, 'dist'),
        port: process.env.PORT || 5005, // default 8080
        open: true, // launches the default browser, 
        hot: true, // hot reload, if anything in the src changes reload in memory
        // watchContentBase: true, // if anything in the src changes reload in memory // deprecated
    },
    // loaders
    module: {
        rules: [
            // css
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            // images
            { test: /\.(svg|ico|png|webp|jpg|gif|jpeg)$/, type: 'asset/resource' },
            // js for babel
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                }
            }, // support of ES6 & ES7 for older browser, babel is a great tool for this.
        ]
    },
    // plugins
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Live Streaming',
            filename: 'index.html',
            template: path.resolve(__dirname, 'src/index.html')
        })
    ],
}