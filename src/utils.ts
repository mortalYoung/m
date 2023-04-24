import * as fs from "fs";
import * as path from "path";

export const CONFIG = "m.config.js";

export interface IConfig {
	proxyMap: Record<string, Function>;
	redirect: string;
}

export default function getConfig(): Partial<IConfig> {
	try {
		const dir = path.join(process.cwd(), CONFIG);
		fs.accessSync(dir, fs.constants.F_OK);
		return require(dir);
	} catch (error) {
		console.error(error);
		return {};
	}
}
