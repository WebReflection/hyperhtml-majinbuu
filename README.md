# hyperhtml-majinbuu

The [majinbuu](https://github.com/WebReflection/majinbuu) based DOM engine

```js
// ESM example, import hyperHTML and this project
import hyper from 'https://unpkg.com/hyperhtml@latest/esm/main.js';
import hyperbuu from 'https://unpkg.com/hyperhtml-majinbuu@latest/esm/main.js';

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