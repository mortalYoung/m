<p align="center">
	M
</p>

---

<p align="center">
	<i>Mock Specify Requests But Proxy Others to Server，Mock Data Like Jest</i>
</p>

# Usage

```shell
npx m serve -p 3000 -r http://localhost:3001
```

```js
// default.mock.js
Mock.fn("/api/v1/path").mockImplementation({
	code: 1,
	data: [],
});
```

## Options

| 属性 | 描述                                           | 默认值 |
| ---- | ---------------------------------------------- | ------ |
| `-p` | 端口                                           | `3000` |
| `-r` | 重定向 URL，不需要 Mock 的接口会重定向到该地址 | -      |
