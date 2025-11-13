const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  if (config.resolve) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
      'react-native-sound': 'react-native-web-sound',
    };
  }

  return config;
};