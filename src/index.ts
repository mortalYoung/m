import chalk from "chalk";
import proxy from "./proxy";
import ServeService, { type IService } from "./serve";

class InitialService {
	static fn = (path: string) => {
		const serve = new ServeService();
		const instance = new InitialService(path, serve);
		proxy.set(path, instance);
		return instance.serve;
	};
	constructor(public path: string, public serve: IService) {}

	public getCurrentImplementation = () => {
		// @ts-ignore
		return (this.serve.implements as ImplementsList[]).at(0);
	};

	public shiftFirstImplementation = () => {
		// @ts-ignore
		(this.serve.implements as ImplementsList[]).shift();
	};

	public applyImplementation = () => {
		const impl = this.getCurrentImplementation();
		if (!impl) {
			return;
		}

		if (impl.count === Number.MAX_SAFE_INTEGER) {
			return;
		}

		impl.count -= 1;

		if (impl.count === 0) {
			this.shiftFirstImplementation();
		}
	};
}

export const Mock = InitialService;
export type { InitialService };
