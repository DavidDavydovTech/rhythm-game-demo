const path = require("path");
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
    entry: path.resolve(appDirectory, "src/index.js"), // Path to the main .js file
    output: {
        filename: 'js/bundle.js',
    },
    resolve: {
        extensions: ['.js'],
    },
    devServer: {
        host: '0.0.0.0',
        port: 8080, // Localhost:8080)
        disableHostCheck: true,
        contentBase: path.resolve(appDirectory, "public"), //tells webpack to serve from the public folder
        publicPath: '/',
        hot: true,
    },
    // module: {
    //     rules: [
    //         {
    //           test: /\.js?$/,
    //           use: "babel-loader",
    //           exclude: /node_modules/,
    //         },
    //     ]
    // },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(appDirectory, "public/index.html"),
        }),
        new CleanWebpackPlugin(),
    ],
    mode: "development",
};