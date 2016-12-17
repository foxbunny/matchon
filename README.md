# matchon

This library provides type-test pattern matching for JavaScript.

Patterns are rules about input types. Each rule is associated with branch, a
function that will be invoked for a set of arguments that match the rule.

[![Build Status](https://travis-ci.org/foxbunny/matchon.svg?branch=master)](https://travis-ci.org/foxbunny/matchon)
[![codecov](https://codecov.io/gh/foxbunny/matchon/branch/master/graph/badge.svg)](https://codecov.io/gh/foxbunny/matchon)
[![npm version](https://img.shields.io/npm/v/matchon.svg)](https://badge.fury.io/js/matchon)

## Installation

Matchon is written as an ES6 module. A compiled version is available in the
`dist` directory. The compiled version uses the UMD module format, and can be
used with AMD and CommonJS module loaders, browserify, or included using
`<script>` tags and accessed as `matchon` global object.

Matchon can be used installed using NPM:

```shell
npm install --save matchon
```

## Usage

To create a pattern-matched function, we need `match()` and `on()` functions
from matchon. The `match()` function creates the resulting function, and `on()`
is used to define individual rules and specify branch functions for the rules.

The return value of each branch function is the return value of a function
defined by `match()`.

```javascript
import { match, on } from 'matchon'

const timestamp = match(
  on('Date', d => d.getTime()),
  on('Number', n => n),
  on('String', Date.parse(s))
)

timestamp('2016-12-14') // 1481673600000
timestamp(1481673600000) // 1481673600000
timestamp(new Date(1481673600000)) // 1481673600000
```

You can supply a catch-all rule, which will match any pattern.

```javascript
const sanitizeValue = match(
  on('String', s => s.trim().toLowerCase()),
  on(() => '')
)

sanitizeValue('FOO ') // 'foo
sanitizeValue(12) // ''
sanitizeValue(null) // ''
```

Pattern matching is not limited to a single argument. You can use any number of
arguments, and you can match on different number of arguments. For example:

```javascript
const ROUTES = []
const addRoute = (rx, fn) => ROUTES.push([rx, fn])
const route = match(
  on('String, Function', (pattern, fn) => addRoute(new RegExp(pattern), fn)),
  on('RegExp, Function', (rx, fn) => addRoute(rx, fn)),
  on('Function', fn => addRoute(/.*/, fn))
)
```

The above example matches calls with two arguments, as well as a call with
single argument.

When there is no match, an exception is thrown:

```javascript
route(1, 2, 3) // Error: No patterns matched <Number,Number,Number>
```

The special `*` type can be used to match any type.

```javascript
const getKey = match(
  on('Object, String, *', (o, k, v) => o[k] || v),
  on('*, String, *', (o, k, v) => v),
)

getKey({foo: 12}, 'foo', 'default') // 12
getKey({bar: 12}, 'foo', 'default') // 'default'
getKey(null, 'foo', 'default') // 'default'
```

The `*` used at the end of the pattern does *not* signify an optional parameter.
An exception is raised if the *number* of arguments does not match the number of
types in the pattern.

```javascript
getKey({foo: 12}, 'foo') // Error: No pattern matched <Object,String>
```

## Performance?

It's quite apparent that the performance is not going to be through the roof.
Not recommended for use in performance sensitive scenarios. Having said that,
if you're not sure if your *particular* piece of code is performance sensitive
or not, it usually isn't. Don't worry about it.

The test suite includes a benchmark that you can run on your machine. It will
execute 30,000 pattern matches against a function with 3 patterns and 3 
arguments per pattern. This benchmark is *not* meant to prove anything. It's 
used in development to measure the impact of refactorings.

## Getting the source

The matchon source code is hosted [on
GitHub](https://github.com/foxbunny/matchon). The `master` branch tracks the
latest release. The `dev` branch will contain cutting edge features that may or
may not work.

## Reporting bugs

Bugs can be reported in the [GitHub issue
tracker](https://github.com/foxbunny/matchon/issues/). This is also a good place
for discussion and feature requests.

## License

Matchon is released under the MIT license. See the `LICENSE` file for more
information.