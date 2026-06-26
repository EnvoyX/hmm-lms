import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 100,
    tabWidth: 2,
    useTabs: false,

    // Style Preferences
    singleQuote: true,
    trailingComma: "all",
    semi: true,
    bracketSpacing: true,

    // Built-in Productivity Features
    sortImports: true,
    sortPackageJson: true,

    // Tailwind CSS Native Support
    tailwindAttributes: ["className", "class", "containerClassName"],
    tailwindFunctions: ["clsx", "twMerge", "cn"],

    // JSDoc Formatting
    jsdoc: {
      commentLineStrategy: "singleLine",
      addDefaultToDescription: true,
      verticalAlignment: true,
    },
});