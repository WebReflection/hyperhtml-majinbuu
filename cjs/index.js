'use strict';
/*! (c) Andrea Giammarchi (ISC) */

const majinbuu = (m => m.default)(require('majinbuu'));

const {slice, splice} = [];

Object.defineProperty(exports, '__esModule', {value: true}).default = {
  MAX_LIST_SIZE: 1000,  // max amount of diff to consider before giving up
  update(
    utils,              // common utilities to deal with hyperHTML nodes
    parentNode,         // where DOM changes happen
    commentNode,        // the placeholder/marker for the list of live nodes
    liveNodes,          // the current list of live nodes as Array
    liveStart,          // where nodes start being different (as index)
    liveEnd,            // where nodes end being different (as index)
    liveLength,         // exact same as liveNodes.length
    virtualNodes,       // the new list to represent on the DOM
    virtualStart,       // where new nodes start being different (as index)
    virtualEnd,         // where new nodes end being different (as index)
    virtualLength       // exact same as virtualNodes.length
  ) {
    // if the amount of changes is higher than majinbuu limit
    if (
      this.MAX_LIST_SIZE < Math.sqrt(
        ((liveEnd - liveStart) || 1) *
        ((virtualEnd - virtualStart) || 1)
      )
    ) {
      // fallback to the default engine which is
      // very fast but not nearly as smart
      utils.engine.update(
        utils,
        parentNode,
        commentNode,
        liveNodes,
        liveStart,
        liveEnd,
        liveLength,
        virtualNodes,
        virtualStart,
        virtualEnd,
        virtualLength
      );
    } else {
      // compute changes via Levenshtein distance matrix
      majinbuu(
        majinbuu.aura(
          new Splicer(
            utils,
            parentNode,
            commentNode,
            liveNodes,
            liveStart
          ),
          slice.call(liveNodes, liveStart, liveEnd + 1)
        ),
        slice.call(virtualNodes, virtualStart, virtualEnd + 1),
        // useless to re-calc the max size in majinbuu
        Infinity
      );
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
  const getNode = this.utils.getNode;
  const changes = [this.index + start, end || 0];
  const length = arguments.length;
  for (let i = 2; i < length; i++) {
    changes.push(arguments[i]);
  }
  const pn = this.parentNode;
  const cn = this.childNodes;
  const index = changes[0] + changes[1];
  const target = index < cn.length ? getNode(cn[index]) : this.node;
  const result = splice.apply(cn, changes);
  const reLength = result.length;
  for (let i = 0; i < reLength; i++) {
    const tmp = result[i];
    if (cn.indexOf(tmp) < 0) {
      pn.removeChild(getNode(tmp));
    }
  }
  if (2 < length) {
    this.utils.insert(pn, slice.call(changes, 2), target);
  }
};
