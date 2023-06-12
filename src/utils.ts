import chalk from "chalk";

export function info(...text: string[]) {
	return chalk.blueBright.bold(text);
}

export function highlight(...text: (string | undefined)[]) {
	return chalk.yellowBright.bold(text);
}

export function warn(...text: string[]) {
	return chalk.redBright.bold(text);
}

export function success(...text: string[]) {
	return chalk.green(text);
}
