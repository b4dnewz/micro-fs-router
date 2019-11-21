# micro-fs-router

> A micro plugin that leverage the filesystem

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url]

## Features

- Works out of the box with zero config
- Automatically parse request query, params and body
- Can be extended with a compose function
- Support route params, nested routes, ...

## Getting started

Install the project using your favourite package manager.

```
npm install micro-fs-router
```

Import the module in your main script and run it with the routes path.

```js
import microFsRouter from "micro-fs-router";

const router = microFsRouter("./routes");

export default router;
```

Inside the `routes` folder a file called _hello.js_ with a micro function.

```js
export default function({ query }) {
    return `Hello, ${query.name || "micro"}`;
}
```

Now run it with __micro__ and try to access the service.

```
$ npx micro index.js
```

```
$ curl http://localhost:3000/hello
Hello, micro

$ curl http://localhost:3000/hello?name=test
Hello, test
```

## Contributing

1. Create an issue and describe your idea
2. Fork the project (https://github.com/b4dnewz/micro-fs-router/fork)
3. Create your __feature branch__ (`git checkout -b my-new-feature`)
4. Commit your changes with logic (`git commit -am 'Add some feature'`)
5. Publish the branch (`git push origin my-new-feature`)
6. Add __some test__ for your new feature
7. Create a new Pull Request

---

## License

Made with love and [MIT](./LICENSE) license © [Filippo Conti](https://b4dnewz.github.io/)

[npm-image]: https://badge.fury.io/js/micro-fs-router.svg
[npm-url]: https://npmjs.org/package/micro-fs-router
[travis-image]: https://travis-ci.org/b4dnewz/micro-fs-router.svg?branch=master
[travis-url]: https://travis-ci.org/b4dnewz/micro-fs-router
[coveralls-image]: https://coveralls.io/repos/b4dnewz/micro-fs-router/badge.svg
[coveralls-url]: https://coveralls.io/r/b4dnewz/micro-fs-router