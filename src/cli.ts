import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import prompts from "prompts";
import boxen from "boxen";
import pkg from "../package.json";
import { detectMockFile, esnoMockFile, generateMockFile, watchMockFile } from "./mockService";
import { startExpress } from "./express";
import proxy from "./proxy";

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
			console.log(chalk.green(`generate successful at ${detectMockFile()}`));
		}
	}

	const watcher = watchMockFile();
	watcher.on("ready", async () => {
		console.log(chalk.yellowBright(`Start listening...`));
		await esnoMockFile();
		startExpress(port, redirect);
	});
	watcher.on("change", async () => {
		console.log(chalk.yellowBright("Mock File Changed!"));
		proxy.clear();
		await esnoMockFile();
	});
})();