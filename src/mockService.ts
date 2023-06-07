import path from "path";
import fs from "fs";
import chokidar from "chokidar";
import pkg from "../package.json";

const SUPPORT_FILE_EXTENSION = [".js"];

const ROOT_PATH = process.cwd();

const FILE_NAME = "default.mock";

export function detectMockFile() {
	for (let index = 0; index < SUPPORT_FILE_EXTENSION.length; index++) {
		const ext = SUPPORT_FILE_EXTENSION[index];
		const file = `${FILE_NAME}${ext}`;
		try {
			fs.accessSync(path.join(ROOT_PATH, file));
			return path.join(ROOT_PATH, file);
		} catch (error) {
			continue;
		}
	}

	return false;
}

export function generateMockFile() {
	const filePath = path.join(ROOT_PATH, `${FILE_NAME}${SUPPORT_FILE_EXTENSION[0]}`);
	if (fs.existsSync(filePath)) {
		throw new Error(`${filePath} was already existed!`);
	}
	const code = `const { Mock } = require('${process.env.NODE_ENV === "development" ? "./dist" : pkg.name}')\n`;

	fs.writeFileSync(filePath, code);
}

export function watchMockFile() {
	const filePath = detectMockFile();
	if (!filePath) {
		throw new Error("No Mock File Error");
	}
	return chokidar.watch(filePath, { interval: 300 });
}

export async function esnoMockFile() {
	const filePath = detectMockFile();
	if (!filePath) {
		throw new Error("No Mock File Error");
	}

	delete require.cache[require.resolve(filePath)];
	require(filePath);
}
