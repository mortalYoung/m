import * as p from "@clack/prompts";
import color from "picocolors";
import watch from "node-watch";
import { getConfig, accessConfigDir, CONFIG, getConfigDir } from "./utils";
import M from "./m";
import path from "path";
import { Command, Option, runExit } from "clipanion";
import { writeFileSync } from "fs";

runExit([
	class BootStrap extends Command {
		static paths: never[][] = [Command.Default];
		port = Option.String("-p,--port");
		async execute() {
			console.clear();

			p.intro(`${color.bgCyan(color.black(" M for Mocking!"))}`);

			if (!this.port) {
				const project = await p.group(
					{
						port: () =>
							p.text({
								message: "Type the port",
								placeholder: "3000",
								initialValue: "3000",
								validate: (value) => {
									if (!value) return "Please enter a port.";
									if (Number.isNaN(Number(value))) return "Please enter a valid port.";
								},
							}),
					},
					{
						onCancel: () => {
							process.exit(0);
						},
					}
				);
				this.port = project.port;
			}

			const config = getConfig();

			if (!config.redirect) {
				p.cancel(`Please type redirect on ${CONFIG}`);
				process.exit(0);
			}

			const m = new M(config.proxyMap || {}, config.redirect);
			m.listen(Number(this.port)).then(() => {
				p.outro(`Server start at ${color.underline(color.cyan(`http://0.0.0.0:${this.port}`))}`);

				p.outro(`Start to listen ${CONFIG} file...`);
				watch(path.join(process.cwd(), CONFIG), () => {
					p.outro(color.bgCyan(`${CONFIG} has changed, now restart`));
					const config = getConfig();
					if (!config.redirect) {
						p.cancel(`Please type redirect on ${CONFIG}`);
					} else {
						m.restart(config.proxyMap || {}, config.redirect);
					}
				});
			});
		}
	},
	class InitCommand extends Command {
		static paths: string[][] = [[`init`]];

		async execute(): Promise<number | void> {
			if (accessConfigDir()) throw new Error(`${CONFIG} file already exist!`);
			const dir = getConfigDir();
			writeFileSync(
				dir,
				`module.exports = {
	redirect: "",
	proxyMap: {},
};
			`
			);
			p.outro(color.green(`${CONFIG} file generated successfully at ${dir}`));
		}
	},
]);
