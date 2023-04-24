import Mock from './src';

module.exports = {
	redirect: "http://portalfront-default-53x-easyindex.base53.devops.dtstack.cn",
	proxyMap: {
		"/api/easyIndex/project/management/page-list": (params) => {
			return {
				code: 1,
				message: null,
				data: {
					currentPage: params.currentPage,
					pageSize: params.pageSize,
					data: Mock.MockPagination("1")
						.length(50)
						.fill((idx) => {
							const projectName = Mock.MockProject();
							return {
								id: idx,
								idxTotal: Mock.MockNumber({ min: 0, max: 20, precision: 1 }),
								isSpace: Mock.MockBoolean(),
								projectName,
								createUser: "admin@dtstack.com",
								gmtCreate: new Date().valueOf(),
								projectShowName: `${projectName}`,
								modelTotal: Mock.MockNumber({ min: 1, max: 5, precision: 1 }),
								publishIdx: Mock.MockNumber({ min: 1, max: 200, precision: 1 }),
								status: Mock.MockNumber({ min: 0, max: 1, precision: 1 }),
								topSign: 0,
							};
						})
						.set(params.currentPage, params.pageSize),
					totalCount: 50,
					totalPage: 1,
				},
				space: 0,
				version: "feat_5.3.x_dev",
				success: true,
			};
		},
	},
};
