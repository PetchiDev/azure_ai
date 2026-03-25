module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { 
        jsxImportSource: "nativewind",
        nativewind: true
      }],
      "nativewind/babel",
    ],

    plugins: [
      // Robust inline fix for "import.meta" SyntaxError on Metro Web
      ({ types: t }) => ({
        visitor: {
          MemberExpression(path) {
            if (t.isMetaProperty(path.node.object) && path.node.object.meta.name === 'import' && path.node.object.property.name === 'meta') {
              path.replaceWith(t.memberExpression(t.identifier('process'), path.node.property));
            }
          },
          MetaProperty(path) {
            if (path.node.meta.name === "import" && path.node.property.name === "meta") {
              path.replaceWith(t.identifier('global'));
            }
          },
        },
      }),


      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],


  };
};
