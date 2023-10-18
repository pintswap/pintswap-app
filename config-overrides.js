const webpack = require('webpack');
const path = require('path');

module.exports = {
    webpack: function (config, env) {
        config.plugins.push(
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            }),
        );
        config.resolve = {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
            fallback: {
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                assert: require.resolve('assert'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                os: require.resolve('os-browserify/browser'),
                zlib: require.resolve('browserify-zlib'),
                url: require.resolve('url/'),
                buffer: require.resolve('buffer'),
                ws: require.resolve('ws-browserify'),
                path: require.resolve('path-browserify'),
                net: require.resolve('net-browserify'),
                tls: require.resolve('tls-browserify'),
                process: require.resolve('process/browser'),
                console: require.resolve('console-browserify'),
                constants: require.resolve('constants-browserify'),
                domain: require.resolve('domain-browser'),
                events: require.resolve('events'),
                punycode: require.resolve('punycode'),
                querystring: require.resolve('querystring-es3'),
                string_decoder: require.resolve('string_decoder'),
                sys: require.resolve('util'),
                timers: require.resolve('timers-browserify'),
                tty: require.resolve('tty-browserify'),
                util: require.resolve('util'),
                vm: require.resolve('vm-browserify'),
                'utf-8-validate': require.resolve('utf-8-validate'),
                async_hooks: false,
                fs: false,
            },
        };
        return config;
    },
};
