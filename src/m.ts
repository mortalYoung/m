import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import bodyParser from "body-parser";
import morgan from "morgan";

const app = express();
app.use(morgan("combined"));
app.use(bodyParser.json());

class M {
	#indirect;

	#proxyMap = new Map();
	constructor(proxyMap: Record<string, Function>, indirect: string) {
		this.#indirect = indirect;
		this.#init(proxyMap);
	}

	#init(proxy: Record<string, Function>) {
		this.#proxyMap = new Map(Object.entries(proxy));
	}

	restart(proxyMap: Record<string, Function>, indirect: string) {
		this.#indirect = indirect;
		this.#init(proxyMap);
	}

	async listen(port = 3000) {
		app.post(
			"*",
			(req, res, next) => {
				if (this.#proxyMap.has(req.url)) {
					const func = this.#proxyMap.get(req.url);
					res.send(func(req.body));
				} else {
					next();
				}
			},
			createProxyMiddleware({
				target: this.#indirect,
				changeOrigin: true,
			})
		);

		// Proxy ALL Get
		app.get(
			"*",
			createProxyMiddleware({
				target: this.#indirect,
				changeOrigin: true,
			})
		);
		return new Promise<void>((resolve) => {
			app.listen(port, "0.0.0.0", () => {
				resolve();
			});
		});
	}
}

export default M;
