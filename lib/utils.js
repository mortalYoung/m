const { faker } = require("@faker-js/faker");
faker.setLocale("zh_CN");

const cache = new Map();

class Mock {
  static MockId = () => faker.datatype.uuid();
  static MockNumber = ({ min, max, precision }) =>
    faker.datatype.number({ max, min, precision });
  static MockBoolean = () => faker.datatype.boolean();
  static MockProject = () => faker.word.noun();
  static MockPagination = (hash) => {
    if (cache.has(hash)) {
      return {
        length: () => ({
          fill: () => ({
            set: (current, pageSize) => {
              const data = cache.get(hash);
              const offset = (current - 1) * pageSize;
              return data.slice(offset, offset + pageSize);
            },
          }),
        }),
      };
    }

    return {
      length: (length) => ({
        fill: (func) => {
          const data = new Array(length).fill(1).map((_, idx) => func(idx));
          cache.set(hash, data);
          return {
            set: (current, pageSize) => {
              const offset = (current - 1) * pageSize;
              return data.slice(offset, offset + pageSize);
            },
          };
        },
      }),
    };
  };
}

module.exports = Mock;
