import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import bodyParser from "body-parser";
import morgan from "morgan";
import proxy from "./proxy";
import chalk from "chalk";
import pkg from "../package.json";

const app = express();
app.use(
	morgan((tokens, req, res) => {
		return [
			chalk.blueBright.bold(`[${pkg.name}[v${pkg.version}]]:`),
			chalk.yellowBright.bold(tokens.method(req, res)),
			chalk.yellowBright.bold(tokens.url(req, res)),
			chalk.yellowBright.bold(tokens.status(req, res)),
			chalk.yellowBright.bold("- " + tokens["response-time"](req, res) + " ms"),
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
