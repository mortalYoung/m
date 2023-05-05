import * as fs from "fs";
import * as path from "path";

export const CONFIG = "m.config.js";

export interface IConfig {
	proxyMap: Record<string, Function>;
	redirect: string;
}

export function getConfigDir() {
	return path.join(process.cwd(), CONFIG);
}

export function accessConfigDir() {
	try {
		const dir = getConfigDir();
		fs.accessSync(dir, fs.constants.F_OK);
		return true;
	} catch (error) {
		return false;
	}
}

export function getConfig(): Partial<IConfig> {
	try {
		const dir = getConfigDir();
		if (accessConfigDir()) {
			delete require.cache[require.resolve(dir)];
			return require(dir);
		}

		return {};
	} catch (error) {
		console.error(error);
		return {};
	}
}
