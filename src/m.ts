import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import bodyParser from "body-parser";
import morgan from "morgan";

const app = express();
app.use(morgan("tiny"));

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
		app.all(
			"*",
			(req, _, next) => {
				if (req.method === "GET" || !this.#proxyMap.has(req.url)) {
					// 转发代理
					next();
				} else {
					// mock 数据
					next("route");
				}
			},
			createProxyMiddleware({
				target: this.#indirect,
				changeOrigin: true,
				logLevel: "debug",
				proxyTimeout: 10000,
				onError: function onError(err, req, res) {
					res.status(500);
					res.json({ error: "Error when connecting to remote server." });
				},
			}),
			(_, __, next) => {
				next("router");
			}
		);

		app.post("*", bodyParser.json(), (req, res) => {
			if (!this.#proxyMap.has(req.url)) {
				res.status(500);
				res.json({ error: "Error when proxy to remote server." });
				return;
			}
			const func = this.#proxyMap.get(req.url);
			res.send(func(req.body));
		});

		return new Promise<void>((resolve) => {
			app.listen(port, "0.0.0.0", () => {
				resolve();
			});
		});
	}
}

export default M;
