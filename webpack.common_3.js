// webpack.common.js

const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const { GenerateSW } = require("workbox-webpack-plugin");
// const isProduction = process.env.NODE_ENV === "production";
const CopyWebpackPlugin = require("copy-webpack-plugin");
// const argv = require("yargs").argv;

module.exports = {
  target: "web",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]", // Сохраняем изображения в папку images/
        },
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/service-worker.js"),
          to: path.resolve(__dirname, "dist/service-worker.js"),
        },
      ],
    }),
    // isProduction &&
    // new GenerateSW({
    //   swDest: "service-worker.js",
    //   clientsClaim: true,
    //   skipWaiting: true,
    //   runtimeCaching: [
    //     {
    //       urlPattern: /\/\?method=allArticles/,
    //       handler: "NetworkFirst",
    //       options: {
    //         cacheName: "my-best-cache",
    //         networkTimeoutSeconds: 10,
    //       },
    //     },
    //     // {
    //     //   urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif)$/,
    //     //   handler: "CacheFirst",
    //     //   options: {
    //     //     cacheName: "external-images",
    //     //     expiration: {
    //     //       maxEntries: 100,
    //     //       maxAgeSeconds: 30 * 24 * 60 * 60, // 30 дней
    //     //     },
    //     //     cacheableResponse: {
    //     //       statuses: [0, 200], // Поддержка opaque ответов
    //     //     },
    //     //   },
    //     // },
    //   ],
    //   sourcemap: isProduction ? false : true,
    // }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/service-worker.js"),
          to: path.resolve(__dirname, "dist/service-worker.js"),
        },
      ],
    }),
  ],
};
