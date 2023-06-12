import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import prompts from "prompts";
import ora from "ora";
import boxen from "boxen";
import pkg from "../package.json";
import { detectMockFile, esnoMockFile, generateMockFile, watchMockFile } from "./mockService";
import { startExpress } from "./express";
import proxy from "./proxy";
import { highlight, success, warn } from "./utils";

console.clear();
console.log(
	chalk.blueBright(
		boxen(`M for Mocking(v${pkg.version})`, {
			title: "M",
			titleAlignment: "center",
			padding: {
				top: 2,
				bottom: 2,
				left: 32,
				right: 32,
			},
		})
	)
);

const parser = yargs(hideBin(process.argv)).options({
	port: { type: "number", alias: "p", description: "port to bind on", default: 3000 },
	redirect: { type: "string", alias: "r", description: "redirect address", default: "" },
});

(async () => {
	const argv = await parser.argv;
	let port = argv.port;
	let redirect = argv.redirect;
	const spinner = ora("Checking Config...").start();
	if (Number.isNaN(argv.port)) {
		port = (
			await prompts({
				type: "number",
				name: "port",
				message: "Type the port",
				initial: 3000,
			})
		).port;
	}

	if (!redirect) {
		redirect = (
			await prompts({
				type: "text",
				name: "redirect",
				message: "Type the redirect",
				validate: (value) => (!value ? `Redirect is required!` : true),
				format: (val: string) => (val.startsWith("http://") ? val : `http://${val}`),
			})
		).redirect;
	}

	const url = new URL(redirect);
	const LOCAL = ["localhost", "127.0.0.1"];
	if (url.port === port.toString() && LOCAL.includes(url.hostname)) {
		console.log(warn("💥 Might cause infinite request because of same url!"));
	}

	const mkPath = detectMockFile();
	if (!mkPath) {
		const { value } = await prompts({
			type: "confirm",
			name: "value",
			message: "Detect No Mock File, Would you like to generate one?",
			initial: true,
		});
		if (value) {
			generateMockFile();
			console.log(success(`generate successful at ${detectMockFile()}`));
		}
	}

	const watcher = watchMockFile();
	watcher.on("ready", async () => {
		spinner.text = "Config Check Completion!";
		spinner.succeed();
		console.log(highlight(`Start listening...`));
		await esnoMockFile();
		startExpress(port, redirect);
	});
	watcher.on("change", async () => {
		console.log(highlight("Mock File Changed!"));
		proxy.clear();
		await esnoMockFile();
	});
})();
