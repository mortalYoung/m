import { defineConfig } from "umi";

export default defineConfig({
	routes: [
		{ path: "/", component: "index" },
		{ path: "/docs", component: "docs" },
	],
	proxy: {
		"/api": {
			target: "http://127.0.0.1:3000",
			changeOrigin: true,
		},
	},
	npmClient: "pnpm",
});
