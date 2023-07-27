import chalk from "chalk";

type IMock = any;
type IMockFunction = (params: any) => IMock | Promise<IMock>;
type ImplementsList = { count: number; mocker: IMockFunction };

export interface IService {
	mockImplementation: (mock: IMock | IMockFunction) => IService;
	mockImplementationOnce: (mock: IMock | IMockFunction) => IService;
	mockResolvedValue: (mock: IMock | IMockFunction, delay?: number) => IService;
	mockResolvedValueOnce: (mock: IMock | IMockFunction, delay?: number) => IService;
	mockRejectedValue: (mock: IMock | IMockFunction, delay?: number) => IService;
	mockRejectedValueOnce: (mock: IMock | IMockFunction, delay?: number) => IService;
	skip: () => void;
}

export default class ServeService implements IService {
	implements: ImplementsList[] = [];

	skip = () => {
		this.implements.length = 0;
		Object.freeze(this.implements);
	};

	mockRejectedValueOnce: (mock: any, delay?: number | undefined) => IService = (mocker, delay = 300) => {
		return this.mockImplementationOnce((params: any) => {
			return new Promise((_, reject) => {
				setTimeout(() => {
					reject(typeof mocker === "function" ? mocker(params) : mocker);
				}, delay);
			});
		});
	};

	mockRejectedValue: (mock: any, delay?: number | undefined) => IService = (mocker, delay = 300) => {
		return this.mockImplementation((params: any) => {
			return new Promise((_, reject) => {
				setTimeout(() => {
					reject(typeof mocker === "function" ? mocker(params) : mocker);
				}, delay);
			});
		});
	};

	mockResolvedValueOnce: (mock: any, delay?: number | undefined) => IService = (mocker, delay = 300) => {
		return this.mockImplementationOnce((params: any) => {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(typeof mocker === "function" ? mocker(params) : mocker);
				}, delay);
			});
		});
	};

	mockResolvedValue: (mock: any, delay?: number) => IService = (mocker, delay = 300) => {
		return this.mockImplementation((params: any) => {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(typeof mocker === "function" ? mocker(params) : mocker);
				}, delay);
			});
		});
	};

	mockImplementation: (mocker: IMock | IMockFunction) => IService = (mocker) => {
		if (!Object.isFrozen(this.implements)) {
			this.implements.push({
				count: Number.MAX_SAFE_INTEGER,
				mocker: typeof mocker !== "function" ? () => mocker : mocker,
			});
		}
		return this;
	};

	mockImplementationOnce: (mocker: IMock | IMockFunction) => IService = (mocker) => {
		if (this.implements.find((i) => i.count === Number.MAX_SAFE_INTEGER)) {
			console.log(
				chalk.yellowBright("Do NOT set mockImplementation before mockImplementationOnce, otherwise mockImplementationOnce won't work")
			);
		}

		if (!Object.isFrozen(this.implements)) {
			this.implements.push({
				count: 1,
				mocker: typeof mocker !== "function" ? () => mocker : mocker,
			});
		}
		return this;
	};
}
