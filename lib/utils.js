const { faker } = require("@faker-js/faker");
faker.setLocale("zh_CN");

/**
 * @implements
 * @param {*} length
 */
function mockArray(length) {}

function mockId() {
  return faker.datatype.uuid();
}

function mockNumber({ min, max, precision }) {
  return faker.datatype.number({ max, min, precision });
}

function mockBoolean() {
  return faker.datatype.boolean();
}

function mockProject() {
  return faker.word.noun();
}

module.exports = { mockArray, mockId, mockNumber, mockBoolean, mockProject };
