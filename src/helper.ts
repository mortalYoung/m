import { faker } from "@faker-js/faker";

faker.setLocale("zh_CN");

const cache = new Map();

class Mock {
	static MockId = () => faker.datatype.uuid();
	static MockNumber = ({ min, max, precision }: Partial<{ min: number; max: number; precision: number }>) =>
		faker.datatype.number({ max, min, precision });
	static MockBoolean = () => faker.datatype.boolean();
	static MockProject = () => faker.word.noun();
	static MockPagination = (hash: string) => {
		if (cache.has(hash)) {
			return {
				length: () => ({
					fill: () => ({
						set: (current: number, pageSize: number) => {
							const data = cache.get(hash);
							const offset = (current - 1) * pageSize;
							return data.slice(offset, offset + pageSize);
						},
					}),
				}),
			};
		}

		return {
			length: (length: number) => ({
				fill: (func: (index: number) => any) => {
					const data = new Array(length).fill(1).map((_, idx) => func(idx));
					cache.set(hash, data);
					return {
						set: (current: number, pageSize: number) => {
							const offset = (current - 1) * pageSize;
							return data.slice(offset, offset + pageSize);
						},
					};
				},
			}),
		};
	};
}

export default Mock;
