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
			proxyTimeout: 10 * 1000,
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
		Promise.resolve(impl.mocker(req.body)).then((values) => {
			res.send(values);
		});
	});

	return new Promise<void>((resolve) => {
		app.listen(port, "0.0.0.0", () => {
			resolve();
		});
	});
}
