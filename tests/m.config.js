const { Mock } = require("../lib");
/**
 * @type {import('../lib').IConfig}
 */
module.exports = {
	redirect: "http://localhost:8080",
	proxyMap: {
		"/api/v1/getInfo": (params) => {
			return {
				code: 1,
			};
		},
	},
};
