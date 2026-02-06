// Learn more https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ensure WASM is included
if (!config.resolver.assetExts.includes("wasm")) {
    config.resolver.assetExts.push("wasm");
}

// Add extra asset types without overwriting defaults
config.resolver.assetExts.push("db", "ttf", "png", "jpg");

// Add COEP / COOP headers (needed for SharedArrayBuffer + wa-sqlite)
config.server.enhanceMiddleware = (middleware) => {
    return (req, res, next) => {
        res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        return middleware(req, res, next);
    };
};

module.exports = withNativeWind(config, { input: "./global.css" });
