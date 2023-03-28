const webpack = require("webpack");
const stdLibBrowser = require('node-stdlib-browser');
const {
	NodeProtocolUrlPlugin
} = require('node-stdlib-browser/helpers/webpack/plugin');

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
        new NodeProtocolUrlPlugin(),
        new webpack.ProvidePlugin({
          process: "process/browser.js",
          Buffer: ["buffer", "Buffer"],
        }),
      ];
      config.resolve = {
        alias: stdLibBrowser,
        fallback: {
            crypto: require.resolve("crypto-browserify"),
            stream: require.resolve("stream-browserify"),
            assert: require.resolve("assert"),
            http: require.resolve("stream-http"),
            https: require.resolve("https-browserify"),
            os: require.resolve("os-browserify/browser"),
            zlib: require.resolve("browserify-zlib"),
            url: require.resolve("url"),
            buffer: require.resolve("buffer"),
            ws: require.resolve('ws-browserify'),
            path: require.resolve('path-browserify'),
            net: require.resolve("net-browserify"),
            tls: require.resolve("tls-browserify"),
            "crypto-browserify": require.resolve('crypto-browserify'),
    
            process: require.resolve('process/browser'),
            console: require.resolve('console-browserify'),
            constants: require.resolve('constants-browserify'),
            domain: require.resolve('domain-browser'),
            events: require.resolve('events'),
            punycode: require.resolve('punycode'),
            querystring: require.resolve('querystring-es3'),
            _stream_duplex: require.resolve('readable-stream/duplex'),
            _stream_passthrough: ('readable-stream/passthrough'),
            _stream_readable: require.resolve('readable-stream/readable'),
            _stream_transform: require.resolve('readable-stream/transform'),
            _stream_writable: require.resolve('readable-stream/writable'),
            string_decoder: require.resolve('string_decoder'),
            sys: require.resolve('util'),
            timers: require.resolve('timers-browserify'),
            tty: require.resolve('tty-browserify'),
            util: require.resolve('util'),
            vm: require.resolve('vm-browserify'),
    
            async_hooks: false,
            fs: false
        }
      }
      return config;
    },
  };
