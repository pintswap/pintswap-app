const webpack = require("webpack");

// module.exports = function override(config) {
//     const fallback = config.resolve.fallback || {};
//     Object.assign(fallback, {
//         // crypto: false,
//         // stream: false, 
//         // assert: false, 
//         // zlib: false, 
//         // fs: false,
//         // buffer: false, 
//         // http: false, 
//         // https: false, 
//         // os: false,
//         // path: false,
//         // net: false, 
//         // tls: false, 
//         // url: false,
//         // async_hooks: false,
//         crypto: require.resolve("crypto-browserify"),
//       stream: require.resolve("stream-browserify"),
//       assert: require.resolve("assert"),
//       http: require.resolve("stream-http"),
//       https: require.resolve("https-browserify"),
//       os: require.resolve("os-browserify"),
//       zlib: require.resolve("browserify-zlib"),
//       url: require.resolve("url"),
//       buffer: require.resolve("buffer"),
//       ws: require.resolve('ws-browserify')
//     });
//     config.resolve.fallback = fallback;
//     config.plugins = (config.plugins || []).concat([
//         new webpack.ProvidePlugin({
//             process: "process/browser",
//             Buffer: ["buffer", "Buffer"],
//         }),
//     ]);
//     return config;
// };

module.exports = {
    target: 'node',
    webpack: function (config, env) {
      config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
          process: "process/browser.js",
          Buffer: ["buffer", "Buffer"],
        }),
      ];
      config.resolve.fallback = {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify"),
        zlib: require.resolve("browserify-zlib"),
        url: require.resolve("url"),
        buffer: require.resolve("buffer"),
        ws: require.resolve('ws-browserify'),
        path: require.resolve('path-browserify'),
        net: require.resolve("net-browserify"),
        tls: require.resolve("tls-browserify"),
        // async_hooks: false,
        // fs: false
      };
      return config;
    },
  };
