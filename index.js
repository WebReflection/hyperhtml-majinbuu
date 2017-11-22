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

  var _ref = [],
      slice = _ref.slice,
      splice = _ref.splice;


  require.E(exports).default = {
    MAX_LIST_SIZE: 1000, // max amount of diff to consider before giving up
    update: function update(utils, // common utilities to deal with hyperHTML nodes
    parentNode, // where DOM changes happen
    commentNode, // the placeholder/marker for the list of live nodes
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
        utils.engine.update(utils, parentNode, commentNode, liveNodes, liveStart, liveEnd, liveLength, virtualNodes, virtualStart, virtualEnd, virtualLength);
      } else {
        // compute changes via Levenshtein distance matrix
        majinbuu(majinbuu.aura(new Splicer(utils, parentNode, commentNode, liveNodes, liveStart), slice.call(liveNodes, liveStart, liveEnd + 1)), slice.call(virtualNodes, virtualStart, virtualEnd + 1),
        // useless to re-calc the max size in majinbuu
        Infinity);
      }
    }
  };

  function Splicer(utils, parentNode, node, childNodes, index) {
    this.utils = utils;
    this.parentNode = parentNode;
    this.node = node;
    this.childNodes = childNodes;
    this.index = index;
  }

  Splicer.prototype.splice = function (start, end) {
    var getNode = this.utils.getNode;
    var changes = [this.index + start, end || 0];
    var length = arguments.length;
    for (var i = 2; i < length; i++) {
      changes.push(arguments[i]);
    }
    var pn = this.parentNode;
    var cn = this.childNodes;
    var index = changes[0] + changes[1];
    var target = index < cn.length ? getNode(cn[index]) : this.node;
    var result = splice.apply(cn, changes);
    var reLength = result.length;
    for (var _i = 0; _i < reLength; _i++) {
      var tmp = result[_i];
      if (cn.indexOf(tmp) < 0) {
        pn.removeChild(getNode(tmp));
      }
    }
    if (2 < length) {
      this.utils.insert(pn, slice.call(changes, 2), target);
    }
  };
}, function (global, require, module, exports) {
  // ../node_modules/majinbuu/cjs/main.js
  'use strict';
  /*! Copyright (c) 2017, Andrea Giammarchi, @WebReflection */

  // grid operations

  var DELETE = 'del';
  var INSERT = 'ins';
  var SUBSTITUTE = 'sub';

  // typed Array
  var TypedArray = typeof Int32Array === 'function' ? Int32Array : Array;

  var majinbuu = function majinbuu(from, to, MAX_SIZE) {

    var fromLength = from.length;
    var toLength = to.length;
    var SIZE = MAX_SIZE || Infinity;
    var TOO_MANY = SIZE !== Infinity && SIZE < Math.sqrt((fromLength || 1) * (toLength || 1));

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
    performOperations(from, getOperations(from, to, levenstein(from, to)));
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
  var levenstein = function levenstein(from, to) {
    var fromLength = from.length + 1;
    var toLength = to.length + 1;
    var size = fromLength * toLength;
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
    while (++x < toLength) {
      grid[x] = x;
    }while (++y < fromLength) {
      X = x = 0;
      prow = crow;
      crow = y * toLength;
      grid[crow + x] = y;
      while (++x < toLength) {
        del = grid[prow + x] + 1;
        ins = grid[crow + X] + 1;
        sub = grid[prow + X] + (from[Y] == to[X] ? 0 : 1);
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
  var getOperations = function getOperations(Y, X, grid) {
    var list = [];
    var YL = Y.length + 1;
    var XL = X.length + 1;
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
          addOperation(list, SUBSTITUTE, x, y, 1, [X[x]]);
        }
      } else if (left <= top && left <= cell) {
        x--;
        addOperation(list, INSERT, x, y, 0, [X[x]]);
      } else {
        y--;
        addOperation(list, DELETE, x, y, 1, []);
      }
    }
    while (x--) {
      addOperation(list, INSERT, x, y, 0, [X[x]]);
    }
    while (y--) {
      addOperation(list, DELETE, x, y, 1, []);
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
    if (length) {
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
    }
  };

  majinbuu.aura = aura;

  Object.defineProperty(exports, '__esModule', { value: true }).default = majinbuu;
  exports.aura = aura;
  exports.majinbuu = majinbuu;
}]);

