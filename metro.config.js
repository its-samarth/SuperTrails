const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */

// Retrieve the default configuration
const defaultConfig = getDefaultConfig(__dirname);


const customConfig = {
  
};

// Merged the default and custom configurations
const mergedConfig = mergeConfig(defaultConfig, customConfig);

// Wraped the merged configuration with Reanimated's Metro config
const reanimatedConfig = wrapWithReanimatedMetroConfig(mergedConfig);

module.exports = reanimatedConfig;
