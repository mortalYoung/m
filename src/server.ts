import * as p from "@clack/prompts";
import color from "picocolors";
import getConfig, { CONFIG } from "./utils";
import M from "./m";

async function main() {
	console.clear();

	p.intro(`${color.bgCyan(color.black(" M for Mocking"))}`);

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

	const config = getConfig();

	if (!config.redirect) {
		p.cancel(`Please type redirect on ${CONFIG}`);
		process.exit(0);
	}

	const m = new M(config.proxyMap || {}, config.redirect);
	m.listen(Number(project.port)).then(() => {
		p.outro(`Server start at ${color.underline(color.cyan(`http://0.0.0.0:${project.port}`))}`);
	});
}

main().catch(console.error);
