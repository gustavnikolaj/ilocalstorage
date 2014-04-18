# iLocalStorage

[![Build Status](https://travis-ci.org/gustavnikolaj/ilocalstorage.svg?branch=master)](https://travis-ci.org/gustavnikolaj/ilocalstorage)

Provides an abstraction on top of the native localstorage
implementations in the browsers. The goal is to handle the differences
in implementations (which is really insignificant if existing at all)
and especially the differences in error scenarios.

## Installation

The package is available on [npm](https://www.npmjs.org/package/ilocalstorage).

```
$ npm install ilocalstorage
```

## Enhanced feature set

Besides the normal localstorage feature set, an extended set i
provided, that allows you to store any kind of data in localstorage,
and not just strings.

With native localStorage this would be the result:

```javascript
localStorage.setItem('foo', { bar: 'baz' });
localStorage.getItem('foo');
// => "[object Object]"
```

Transforming the input data to JSON before saving it, allows us to
persist objects in localstorage.

```javascript
var iStorage = new iLocalStorage();
iStorage.set('foo', { bar: 'baz' });
iStorage.get('foo');
// => { bar: 'baz'});
```

iLocalStorage.remove exists aswell, but it is just a mapping to the
native remoteItem method.
