import Mock from "./src";

module.exports = {
	redirect: "http://localhost:8080",
	proxyMap: {
		"/api/a": (params) => {
			return {
				code: 1,
				message: null,
				data: {
					currentPage: params.currentPage,
					pageSize: params.pageSize,
					data: Mock.MockPagination("1")
						.length(50)
						.fill((idx) => {
							return {
								id: idx,
							};
						})
						.set(params.currentPage, params.pageSize),
					totalCount: 50,
					totalPage: 1,
				},
				space: 0,
				version: "a",
				success: true,
			};
		},
	},
};
