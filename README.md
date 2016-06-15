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

## Deep translate

deepTranslate middleware supports nested conditional translations in order to show different content in different scenarios. The middleware adds a `translate` function to `req` which is used in various points throughout the architecture.  This middleware must be applied before any other middleware which rely on the `req.translate` function. Also when initializing the form wizard, or template mixins, if a `translate` function is provided, this will be used rather than the deepTranslate middleware.

### Usage

```js
const i18nFuture = require('hof').i18n;
const i18n = i18nFuture({
  path: path.resolve(__dirname, './path/to/translations')
})
app.use(require('hof-middleware').deepTranslate({
  translate: i18n.translate.bind(i18n)
}));
```

locales
```json
"fields": {
    "field-name": {
        "label": {
            "dependent-field": {
                "value-1": {
                    "dependent-field-2": {
                        "value-1": "Label 1",
                        "value-2": "Label 2"
                    }
                },
                "value-2": "Label 3"
            },
            "default": "Fallback label"
        }
    }
}
```

Using the translation key `fields.field-name.label` will return different values in different situations depending on the values of named fields. In the above example the following are true:

* If both `dependent-field` and `dependent-field-2` have the value `"value-1"`, the label returned will be `"Label 1"`.
* If the value of `dependent-field` is `"value-1"` and the value of `dependent-field-2` is `"value-2"`, the label returned will be `"Label 2"`.
* If the value of `dependent-field` is `"value-2"` the label returned will be `"Label 3"` regardless of the value of `dependent-field-2`
* The default label `"Fallback label"` will be used if value of `dependent-field` is neither of the given options, or it is `undefined`. It will also be used if the value of `dependent-field` is `"value-1"` and the value of `dependent-field-2` is neither of the given options or it is undefined.
