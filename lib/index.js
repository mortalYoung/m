const express = require("express");
const proxyMiddleWare = require("http-proxy-middleware");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();

const {
  mockArray,
  mockId,
  mockNumber,
  mockBoolean,
  mockProject,
} = require("./utils.js");

app.use(morgan("combined"));
app.use(bodyParser.json());

class M {
  static MockArray = mockArray;
  static MockId = mockId;
  static MockNumber = mockNumber;
  static MockBoolean = mockBoolean;
  static MockProject = mockProject;
  #indirect;

  #proxyMap = new Map();
  /**
   *
   * @param {Record<string, Function>} proxyMap
   * @param {string} indirect
   */
  constructor(proxyMap, indirect) {
    this.#indirect = indirect;
    this.#init(proxyMap);
  }

  /**
   *
   * @param {Record<string, Function>} proxy
   */
  #init(proxy) {
    this.#proxyMap = new Map(Object.entries(proxy));
  }

  async listen(port = 3000) {
    app.post(
      "*",
      (req, res, next) => {
        if (this.#proxyMap.has(req.url)) {
          const func = this.#proxyMap.get(req.url);
          res.send(func(req.body));
        } else {
          next();
        }
      },
      proxyMiddleWare.createProxyMiddleware({
        target: this.#indirect,
        changeOrigin: true,
      })
    );
    return new Promise((resolve) => {
      app.listen(port, "0.0.0.0", () => {
        resolve();
      });
    });
  }
}

module.exports = M;
