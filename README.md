# hyperhtml-majinbuu

[![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/WebReflection/donate)
[![Coverage Status](https://coveralls.io/repos/github/WebReflection/hyperhtml-majinbuu/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/hyperhtml-majinbuu?branch=master)
[![Build Status](https://travis-ci.org/WebReflection/hyperhtml-majinbuu.svg?branch=master)](https://travis-ci.org/WebReflection/hyperhtml-majinbuu)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Greenkeeper badge](https://badges.greenkeeper.io/WebReflection/hyperhtml-majinbuu.svg)](https://greenkeeper.io/)

The [majinbuu](https://github.com/WebReflection/majinbuu) based DOM engine

```js
// ESM example, import hyperHTML and this project
import hyper from 'https://unpkg.com/hyperhtml@latest/esm/index.js';
import hyperbuu from 'https://unpkg.com/hyperhtml-majinbuu@latest/esm/index.js';

// set this project as hyperHTML engine
hyper.engine = hyperbuu;

// configure eventually MAX_LIST_SIZE
// to fallback, when too big,
// to the default hyperHTML engine
hyper.engine.MAX_LIST_SIZE = 500;
// by default this is 1000
```

You can also add the engine simply including `https://unpkg.com/hyperhtml-majinbuu@latest/min.js` script after `https://unpkg.com/hyperhtml@latest/min.js`.

You can use CommonJS too (based on `.default` convention):
```js
const hyper = require('hyperhtml').default;
hyper.engine = require('hyperhtml-majinbuu').default;
```