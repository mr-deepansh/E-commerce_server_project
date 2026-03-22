import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import pluginNode from "eslint-plugin-n";
import security from "eslint-plugin-security";
import importX from "eslint-plugin-import-x";

export default [
	{
		ignores: [
			"node_modules/**",
			"dist/**",
			"build/**",
			"coverage/**",
			"*.min.js",
			".env*",
			"logs/**",
		],
	},
	js.configs.recommended,
	{
		plugins: { n: pluginNode },
		rules: {
			"n/no-process-exit": "error",
			"n/no-sync": "error",
			"n/prefer-promises/fs": "error",
			"n/prefer-promises/dns": "error",
			"n/no-missing-import": "off",
			"n/no-unsupported-features/node-builtins": "warn",
		},
	},
	{
		plugins: { security },
		rules: {
			...security.configs.recommended.rules,
			"security/detect-object-injection": "warn",
			"security/detect-non-literal-regexp": "error",
			"security/detect-unsafe-regex": "error",
			"security/detect-child-process": "error",
		},
	},
	{
		plugins: { "import-x": importX },
		rules: {
			"import-x/no-duplicates": "error",
			"import-x/no-unused-modules": "warn",
			"import-x/no-circular-dependency": "error",
			"import-x/order": [
				"error",
				{
					groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
					"newlines-between": "always",
					alphabetize: { order: "asc", caseInsensitive: true },
				},
			],
		},
	},
	{
		files: ["src/**/*.js"],
		rules: {
			"no-console": ["error", { allow: ["warn", "error"] }],
			"no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
			"no-var": "error",
			"no-return-await": "error",
			"no-throw-literal": "error",
			"no-param-reassign": ["error", { props: false }],
			"prefer-const": "error",
			"prefer-destructuring": ["warn", { object: true, array: false }],
			"object-shorthand": "error",
			"prefer-template": "error",
			"eqeqeq": ["error", "always"],
			"curly": ["error", "all"],
			"require-await": "error",
			"no-async-promise-executor": "error",
			"no-promise-executor-return": "error",
			"no-fallthrough": "error",
			"no-duplicate-case": "error",
			"no-unreachable": "error",
			"no-constant-condition": ["error", { checkLoops: false }],
		},
	},
	{
		files: ["**/*.test.js", "**/*.spec.js"],
		rules: {
			"no-console": "off",
			"require-await": "off",
		},
	},
	prettier,
];