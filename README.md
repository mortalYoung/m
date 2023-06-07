<p align="center">
	M
</p>

---

<p align="center">
	<i>Mock Specify Requests But Proxy Others to Server</i>
</p>

# Usage

```shell
npx m serve -p 3000 -r http://localhost:3001
```

```js
// default.mock.js
Mock.fn('/api/v1/path').mockImplemention({
  code: 1,
  data: [],
});
```