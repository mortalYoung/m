export { default as Mock } from "./helper";

export interface IConfig {
	/**
	 * 转发地址
	 */
	redirect: `http://${string}`;
	/**
	 * 代理接口集合
	 */
	proxyMap?: Record<string, (params: any) => any>;
}
