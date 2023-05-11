import { faker } from "@faker-js/faker";

faker.setLocale("zh_CN");

const cache = new Map();

interface IMockPagination {
	key?: string;
	total: number;
	current: number;
	pageSize?: number;
	dataType: (idx: number) => any;
}

class Mock {
	static MockId = () => faker.datatype.uuid();
	static MockNumber = ({ min, max, precision }: Partial<{ min: number; max: number; precision: number }>) =>
		faker.datatype.number({ max, min, precision });
	static MockBoolean = () => faker.datatype.boolean();

	static MockProject = () => faker.commerce.product();
	static MockPagination = (rawOp: IMockPagination) => {
		const op: Required<IMockPagination> = { key: new Date().valueOf().toString(), pageSize: 20, ...rawOp };
		const { key, current, pageSize, dataType } = op;
		if (cache.has(key)) {
			const data = cache.get(key);
			const offset = (current - 1) * pageSize;
			return data.slice(offset, offset + pageSize);
		}

		const data = new Array(length).fill(1).map((_, idx) => dataType(idx));
		cache.set(key, data);

		const offset = (current - 1) * pageSize;
		return data.slice(offset, offset + pageSize);
	};
}

export default Mock;
