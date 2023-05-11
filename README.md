<p align="center">
	M
</p>

*****

<p align="center">
	<i>Mock Specify Requests But Proxy Others to Server</i>
</p>

# Usage

First, generate the config file
```shell
npx m init
```
and specify the redirect

Then just
```shell
npx m
# or
npx m -p 3000
```

# Options

## Helper

### MockId

```js
Mock.MockId()
```



### MockNumber

```js
Mock.MockNumber({ mix: 1, max: 100, precision: 1 })
```


### MockBoolean

```js
Mock.MockBoolean()
```



### MockProject

```js
Mock.MockProject()
```


### MockPagination

```js
Mock.MockPagination({
  key: "/api/v1/path",
  current: 1,
  pageSize: 20,
  total: 50,
  dataType: (idx) => ({ id: idx })
})
```

