import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import bodyParser from "body-parser";
import morgan from "morgan";
import proxy from "./proxy";
import pkg from "../package.json";
import { highlight, info } from "./utils";

const app = express();
app.use(
	morgan((tokens, req, res) => {
		return [
			info(`[${pkg.name}[v${pkg.version}]]:`),
			highlight(tokens.method(req, res)),
			highlight(tokens.url(req, res)),
			highlight(tokens.status(req, res)),
			highlight("- " + tokens["response-time"](req, res) + " ms"),
		].join(" ");
	})
);

app.use(express.text());

export function startExpress(port: number, redirect: string) {
	app.all(
		"*",
		(req, _, next) => {
			if (req.method === "GET" || !proxy.has(req.url)) {
				// 转发代理
				next();
			} else {
				// mock 数据
				next("route");
			}
		},
		createProxyMiddleware({
			target: redirect,
			changeOrigin: true,
			logLevel: "silent",
			proxyTimeout: 60 * 1000,
			onError: function onError(err, req, res) {
				res.status(500);
				res.json({ error: "Error when connecting to remote server." });
			},
		}),
		(_, __, next) => {
			next("router");
		}
	);

	app.post("*", (req, res) => {
		if (!proxy.has(req.url)) {
			res.status(500);
			res.json({ error: "Error when proxy to remote server." });
			return;
		}
		const func = proxy.get(req.url);
		if (!func) return;
		const impl = func.getCurrentImplementation();
		if (!impl?.mocker) {
			res.json({ error: `Something went wrong with ${func.path}` });
			return;
		}
		func.applyImplementation();
		if (!impl.sse) {
			let body = req.body;
			try {
				body = JSON.parse(req.body);
			} catch (error) {}
			Promise.resolve(impl.mocker(body)).then((values) => {
				res.send(values);
			});
		} else {
			// SSE
			res.setHeader("Cache-Control", "no-cache");
			res.setHeader("Content-Type", "text/event-stream");
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader("Connection", "keep-alive");
			res.setHeader("Content-Encoding", "none");
			res.flushHeaders(); // flush the headers to establish SSE with client

			const text = impl.mocker(req.body);
			const timeouts: NodeJS.Timeout[] = [];
			if (typeof text === "string") {
				res.write(`data: ${encodeURIComponent(text)}\n\n`);
				res.write("[DONE]");
				res.end();
			} else if (Array.isArray(text)) {
				for (let index = 0; index < text.length; index++) {
					const txt = text[index];
					const delay = (index + 1) * 500;
					timeouts.push(
						setTimeout(() => {
							res.write(`data: ${encodeURIComponent(txt)}\n\n`);
							if (index === text.length - 1) {
								res.write("[DONE]");
								res.end();
							}
						}, delay)
					);
				}
			} else {
				res.write("[DONE]");
				res.end();
			}

			// If client closes connection, stop sending events
			res.on("close", () => {
				timeouts.forEach((t) => clearTimeout(t));
				res.end();
			});
		}
	});

	return new Promise<void>((resolve) => {
		app.listen(port, "0.0.0.0", () => {
			resolve();
		});
	});
}
