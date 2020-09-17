const path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
const config = {
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
};
module.exports = [
  Object.assign({}, config, {
    entry: {
      index: "./src/index.ts",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public", "index.html"),
        filename: "index.html",
      }),
    ],
  }),
  Object.assign({}, config, {
    entry: {
      sidebar: "./src/sidebar.tsx",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public", "sidebar.html"),
        filename: "sidebar.html",
      }),
    ],
  }),
  Object.assign({}, config, {
    entry: {
      library: "./src/library.tsx",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public", "library.html"),
        filename: "library.html",
      }),
    ],
  }),
  Object.assign({}, config, {
    entry: {
      newnode: "./src/newnode.tsx",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public", "newnode.html"),
        filename: "newnode.html",
      }),
    ],
  }),
  Object.assign({}, config, {
    entry: {
      loading: "./src/loading.tsx",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public", "loading.html"),
        filename: "loading.html",
      }),
    ],
  }),
  Object.assign({}, config, {
    entry: {
      auth: "./src/auth.tsx",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public", "auth.html"),
        filename: "auth.html",
      }),
    ],
  }),
];
