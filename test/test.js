const tressa = require('tressa');
const hyperboo = require('../cjs/index.js').default;

tressa.title('hyperHTML.engine = majinbuu');

let a = [1, 2, 3, 4];
let b = [2, 5, 4];

hyperboo.update(
  {
    insert: Object,
    engine: {update: Object},
    getNode: Object
  },
  {removeChild: Object},
  {},
  a, 0, a.length, a.length,
  b, 0, b.length, b.length
);

b = [1, 2, 3, 4, 29];
a.indexOf = function () { return 0; };
hyperboo.update(
  {
    insert: Object,
    engine: {update: Object},
    getNode: Object
  },
  {removeChild: Object},
  {},
  a, 0, a.length, a.length,
  b, 0, b.length, b.length
);

hyperboo.MAX_LIST_SIZE = 0;
hyperboo.update(
  {
    insert: Object,
    engine: {update: Object},
    getNode: Object
  },
  {removeChild: Object},
  {},
  [], 0, 0, 0,
  [], 0, 0, 0
);
