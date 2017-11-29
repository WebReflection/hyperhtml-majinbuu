const tressa = require('tressa');
const hyperboo = require('../cjs').default;

tressa.title('hyperHTML.engine = majinbuu');

let a = [1, 2, 3, 4];
let b = [2, 5, 4];

console.log(1);
hyperboo.update(
  {
    splicer: a,
    engine: {update: Object},
    getNode: Object
  },
  a, 0, a.length, a.length,
  b, 0, b.length, b.length
);

b = [1, 2, 3, 4, 29];
a.indexOf = function () { return 0; };
hyperboo.update(
  {
    splicer: a,
    engine: {update: Object},
    getNode: Object
  },
  a, 0, a.length, a.length,
  b, 0, b.length, b.length
);

hyperboo.MAX_LIST_SIZE = 0;
hyperboo.update(
  {
    splicer: a,
    engine: {update: Object},
    getNode: Object
  },
  [], 0, 0, 0,
  [], 0, 0, 0
);
