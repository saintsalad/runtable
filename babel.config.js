module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          // NativeWind + react-native-css-interop rely on the classic JSX transform pipeline.
          // Keep React Compiler off here even if Metro passes supportsReactCompiler (Expo SDK 54).
          native: { 'react-compiler': false },
          web: { 'react-compiler': false },
        },
      ],
      'nativewind/babel',
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
