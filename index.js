hyperHTML.engine = function (cache, modules) {
  function require(i) {
    return cache[i] || get(i);
  }
  function get(i) {
    var exports = {},
        module = { exports: exports };
    modules[i].call(exports, window, require, module, exports);
    return cache[i] = module.exports;
  }
  require.E = function (exports) {
    return Object.defineProperty(exports, '__esModule', { value: true });
  };
  require.I = function (m) {
    return m.__esModule ? m.default : m;
  };
  return require.I(require(0));
}([], [function (global, require, module, exports) {
  // index.js
  'use strict';
  /*! (c) Andrea Giammarchi (ISC) */

  var majinbuu = require.I(require(1));

  require.E(exports).default = {
    MAX_LIST_SIZE: 1000, // max amount of diff to consider before giving up
    update: function update(utils, // common utilities to deal with hyperHTML nodes
    liveNodes, // the current list of live nodes as Array
    liveStart, // where nodes start being different (as index)
    liveEnd, // where nodes end being different (as index)
    liveLength, // exact same as liveNodes.length
    virtualNodes, // the new list to represent on the DOM
    virtualStart, // where new nodes start being different (as index)
    virtualEnd, // where new nodes end being different (as index)
    virtualLength // exact same as virtualNodes.length
    ) {
      // if the amount of changes is higher than majinbuu limit
      if (this.MAX_LIST_SIZE < Math.sqrt((liveEnd - liveStart || 1) * (virtualEnd - virtualStart || 1))) {
        // fallback to the default engine which is
        // very fast but not nearly as smart
        utils.engine.update(utils, liveNodes, liveStart, liveEnd, liveLength, virtualNodes, virtualStart, virtualEnd, virtualLength);
      } else {
        // compute changes via Levenshtein distance matrix
        majinbuu(utils.splicer, virtualNodes, liveStart, liveEnd, liveLength, virtualStart, virtualEnd, virtualLength, Infinity);
      }
    }
  };
}, function (global, require, module, exports) {
  // ../node_modules/majinbuu/cjs/index.js
  'use strict';
  /*! Copyright (c) 2017, Andrea Giammarchi, @WebReflection */

  // grid operations

  var DELETE = 'del';
  var INSERT = 'ins';
  var SUBSTITUTE = 'sub';

  // typed Array
  var TypedArray = typeof Int32Array === 'function' ? Int32Array : Array;

  // shortcuts
  var min = Math.min,
      sqrt = Math.sqrt;


  var majinbuu = function majinbuu(from, to, fromStart, fromEnd, fromLength, toStart, toEnd, toLength, SIZE) {

    if (from === to) {
      //# same arrays. Do nothing
      return;
    }

    if (arguments.length < 4) {
      SIZE = fromStart || Infinity;
      fromLength = from.length;
      fromStart = 0;
      fromEnd = fromLength;
      toLength = to.length;
      toStart = 0;
      toEnd = toLength;
    } else {
      SIZE = SIZE || Infinity;
    }

    var TOO_MANY = SIZE !== Infinity && SIZE < sqrt((fromEnd - fromStart || 1) * (toEnd - toStart || 1));

    if (TOO_MANY || fromLength < 1) {
      if (TOO_MANY || toLength) {
        from.splice.apply(from, [0, fromLength].concat(to));
      }
      return;
    }
    if (toLength < 1) {
      from.splice(0);
      return;
    }
    var minLength = min(fromLength, toLength);
    var beginIndex = fromStart;
    while (beginIndex < minLength && from[beginIndex] === to[beginIndex]) {
      beginIndex += 1;
    }
    if (beginIndex == fromLength && fromLength == toLength) {
      // content of { from } and { to } are equal. Do nothing
      return;
    } else {
      // relative from both ends { from } and { to }. { -1 } is last element,
      // { -2 } is { to[to.length - 2] } and { from[fromLength - 2] } etc
      var endRelIndex = 0;
      var fromLengthMinus1 = fromEnd - 1;
      var toLengthMinus1 = toEnd - 1;
      while (beginIndex < minLength + endRelIndex && from[fromLengthMinus1 + endRelIndex] === to[toLengthMinus1 + endRelIndex]) {
        endRelIndex--;
      }
      performOperations(from, getOperations(levenstein(from, beginIndex, fromLength, to, endRelIndex, toLength), from, beginIndex, fromLength, to, endRelIndex, toLength));
    }
  };

  // given an object that would like to intercept
  // all splice operations performed through a list,
  // wraps the list.splice method to delegate such object
  // and it puts back original splice right before every invocation.
  // Note: do not use the same list in two different aura
  var aura = function aura(splicer, list) {
    var splice = list.splice;
    function $splice() {
      list.splice = splice;
      var result = splicer.splice.apply(splicer, arguments);
      list.splice = $splice;
      return result;
    }
    list.splice = $splice;
    return list;
  };

  // Helpers - - - - - - - - - - - - - - - - - - - - - -

  // originally readapted from:
  // http://webreflection.blogspot.co.uk/2009/02/levenshtein-algorithm-revisited-25.html
  // then rewritten in C for Emscripten (see levenstein.c)
  // then "screw you ASM" due no much gain but very bloated code
  var levenstein = function levenstein(from, beginIndex, fromLength, to, endRelIndex, toLength) {
    var fLength = fromLength + 1 - beginIndex + endRelIndex;
    var tLength = toLength + 1 - beginIndex + endRelIndex;
    var size = fLength * tLength;
    var grid = new TypedArray(size);
    var x = 0;
    var y = 0;
    var X = 0;
    var Y = 0;
    var crow = 0;
    var prow = 0;
    var del = void 0,
        ins = void 0,
        sub = void 0;
    grid[0] = 0;
    while (++x < tLength) {
      grid[x] = x;
    }while (++y < fLength) {
      X = x = 0;
      prow = crow;
      crow = y * tLength;
      grid[crow + x] = y;
      while (++x < tLength) {
        del = grid[prow + x] + 1;
        ins = grid[crow + X] + 1;
        sub = grid[prow + X] + (from[Y + beginIndex] == to[X + beginIndex] ? 0 : 1);
        grid[crow + x] = del < ins ? del < sub ? del : sub : ins < sub ? ins : sub;
        ++X;
      };
      Y = y;
    }
    return grid;
  };

  // add operations (in reversed order)
  var addOperation = function addOperation(list, type, x, y, count, items) {
    list.unshift({ type: type, x: x, y: y, count: count, items: items });
  };

  // walk the Levenshtein grid bottom -> up
  var getOperations = function getOperations(grid, Y, beginIndex, YLength, X, endRelIndex, XLength) {
    var list = [];
    var YL = YLength + 1 - beginIndex + endRelIndex;
    var XL = XLength + 1 - beginIndex + endRelIndex;
    var y = YL - 1;
    var x = XL - 1;
    var cell = void 0,
        top = void 0,
        left = void 0,
        diagonal = void 0,
        crow = void 0,
        prow = void 0;
    while (x && y) {
      crow = y * XL + x;
      prow = crow - XL;
      cell = grid[crow];
      top = grid[prow];
      left = grid[crow - 1];
      diagonal = grid[prow - 1];
      if (diagonal <= left && diagonal <= top && diagonal <= cell) {
        x--;
        y--;
        if (diagonal < cell) {
          addOperation(list, SUBSTITUTE, x + beginIndex, y + beginIndex, 1, [X[x + beginIndex]]);
        }
      } else if (left <= top && left <= cell) {
        x--;
        addOperation(list, INSERT, x + beginIndex, y + beginIndex, 0, [X[x + beginIndex]]);
      } else {
        y--;
        addOperation(list, DELETE, x + beginIndex, y + beginIndex, 1, []);
      }
    }
    while (x--) {
      addOperation(list, INSERT, x + beginIndex, y + beginIndex, 0, [X[x + beginIndex]]);
    }
    while (y--) {
      addOperation(list, DELETE, x + beginIndex, y + beginIndex, 1, []);
    }
    return list;
  };

  /* grouped operations */
  var performOperations = function performOperations(target, operations) {
    var length = operations.length;
    var diff = 0;
    var i = 1;
    var curr = void 0,
        prev = void 0,
        op = void 0;
    op = prev = operations[0];
    while (i < length) {
      curr = operations[i++];
      if (prev.type === curr.type && curr.x - prev.x <= 1 && curr.y - prev.y <= 1) {
        op.count += curr.count;
        op.items = op.items.concat(curr.items);
      } else {
        target.splice.apply(target, [op.y + diff, op.count].concat(op.items));
        diff += op.type === INSERT ? op.items.length : op.type === DELETE ? -op.count : 0;
        op = curr;
      }
      prev = curr;
    }
    target.splice.apply(target, [op.y + diff, op.count].concat(op.items));
  };

  majinbuu.aura = aura;

  Object.defineProperty(exports, '__esModule', { value: true }).default = majinbuu;
  exports.aura = aura;
  exports.majinbuu = majinbuu;
}]);

