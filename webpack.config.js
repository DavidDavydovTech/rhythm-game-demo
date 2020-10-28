const path = require("path");
const fs = require('fs');
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
    entry: path.resolve(appDirectory, "src/index.js"), // Path to the main .js file
    output: {
        filename: 'js/bundle.js'
    },
    resolve: {
        extensions: [".js"]
    },
    // module: {
    //     rules: [
    //         {
    //           test: /\.js?$/,
    //           use: "babel-loader",
    //           exclude: /node_modules/
    //         },
    //     ]
    // },
    mode: "development"
};