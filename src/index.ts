import proxy from "./proxy";
import ServeService, { type IService } from "./serve";
import * as helper from "./helper";

class InitialService {
	static fn = (path: string): Omit<IService, "implements"> => {
		const serve = new ServeService();
		const instance = new InitialService(path, serve);
		proxy.set(path, instance);
		return instance.serve;
	};
	constructor(public path: string, public serve: IService) {}

	public getCurrentImplementation = () => {
		return this.serve.implements.at(0);
	};

	public shiftFirstImplementation = () => {
		this.serve.implements.shift();
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

const Mock = InitialService;
export { Mock, helper };
export type { InitialService };
