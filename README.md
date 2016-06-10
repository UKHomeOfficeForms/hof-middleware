# hof-middleware
A collection of commonly used HOF middleware

HOF exports middleware with `cookies` and `errors`.

## Cookies

### Usage
```js
app.use(require('hof-middleware').cookies({
  'cookie-name': 'my-application-cookie',
  'param-name': 'my-query-param'
}));
```

This middleware must be declared before your other routes.

### Options
The `cookie-name` can be the same as your session cookie. (The
middleware will not overwrite it.) Defaults to `hof-cookie-check`.

The `param-name` should be chosen so that it does not clash with names
you are using elsewhere. In almost all cases the default value of
`hof-cookie-check` will suffice.

The error raised when cookies are not supported by the client can then
be handled in you error handler by identifying it using its `code`
property which will be set to `NO_COOKIES`.

## Errors

### Usage
```js
app.use(require('hof-middleware').errors({
  logger: require('/logger'),
  translate: require('hof').i18n.translate,
  debug: true
}));
```

This middleware must be declared *after* your other routes.

### Options
`logger` can be any object with an error method.

`translate` can be the HOF i18n translate function

`debug` set to true will present the stack trace in the form and return the err as the content of the template.

## Not found

Expects there to be a view called 404 in your configured `/views` directory

### Usage
```js
app.use(require('hof-middleware').notFound({
  logger: require('/logger'),
  translate: require('hof').i18n.translate
}));
```

This middleware should be declared *after* your other routes but *before* your errorhandler.

### Options
`logger` can be any object with a warn method.

`translate` can be the HOF i18n translate function

