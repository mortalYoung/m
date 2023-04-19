const M = require("../lib/index.js");

const mock = new M(
  {
    "/api/easyIndex/project/management/page-list": (params) => {
      return {
        code: 1,
        message: null,
        data: {
          currentPage: params.currentPage,
          pageSize: params.pageSize,
          data: new Array(10).fill(1).map((_, idx) => {
            const projectName = M.MockProject();
            return {
              id: idx,
              idxTotal: M.MockNumber({ min: 0, max: 20, precision: 1 }),
              isSpace: M.MockBoolean(),
              projectName,
              createUser: "admin@dtstack.com",
              gmtCreate: new Date().valueOf(),
              projectShowName: `${projectName}`,
              modelTotal: M.MockNumber({ min: 1, max: 5, precision: 1 }),
              publishIdx: M.MockNumber({ min: 1, max: 200, precision: 1 }),
              status: M.MockNumber({ min: 0, max: 1, precision: 1 }),
              topSign: 0,
            };
          }),
          totalCount: 10,
          totalPage: 1,
        },
        space: 0,
        version: "feat_5.3.x_dev",
        success: true,
      };
    },
  },
  "http://portalfront-default-53x-easyindex.base53.devops.dtstack.cn"
);

mock.listen();
