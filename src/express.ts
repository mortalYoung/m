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

	app.post("*", bodyParser.json(), (req, res) => {
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
			Promise.resolve(impl.mocker(req.body)).then((values) => {
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

			const text: string = impl.mocker(req.body);
			let pointer = 0;
			let offset = Math.floor(Math.random() * 80 + 20);
			res.write(`data: ${encodeURIComponent(text.slice(pointer, pointer + offset))}\n\n`);
			pointer += offset;
			let timeout = setInterval(() => {
				offset = Math.floor(Math.random() * 80 + 20);
				res.write(`data: ${encodeURIComponent(text.slice(pointer, pointer + offset))}\n\n`);
				pointer += offset;

				if (pointer >= text.length) {
					clearInterval(timeout);
					res.end();
				}
			}, 200);

			// If client closes connection, stop sending events
			res.on("close", () => {
				clearInterval(timeout);
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
