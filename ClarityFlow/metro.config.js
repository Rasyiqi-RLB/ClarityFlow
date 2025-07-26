const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Use default Metro config for now to avoid build issues
// Optimizations will be handled at the app level

module.exports = config;
