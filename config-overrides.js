const webpack = require("webpack");

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        crypto: false,
        stream: false, 
        assert: false, 
        zlib: false, 
        fs: false,
        buffer: false, 
        http: false, 
        https: false, 
        os: false,
        path: false,
        net: false, 
        tls: false, 
        url: false,
        async_hooks: false
    });
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        }),
    ]);
    return config;
};
