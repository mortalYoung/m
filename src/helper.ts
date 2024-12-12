import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

export function multiple<T>(method: () => T, options: Parameters<typeof faker.helpers.multiple>[1]) {
	return faker.helpers.multiple<T>(method, options);
}

export function mockId() {
	return faker.string.uuid();
}

export function mockNum(...args: Parameters<typeof faker.number.int>) {
	return faker.number.int(...args);
}

export function mockName() {
	return faker.internet.userName();
}
export { dayjs };
