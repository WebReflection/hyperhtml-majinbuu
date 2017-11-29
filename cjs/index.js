'use strict';
/*! (c) Andrea Giammarchi (ISC) */

const majinbuu = (m => m.default)(require('majinbuu'));

Object.defineProperty(exports, '__esModule', {value: true}).default = {
  MAX_LIST_SIZE: 1000,  // max amount of diff to consider before giving up
  update(
    utils,              // common utilities to deal with hyperHTML nodes
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
        utils.splicer,
        virtualNodes,
        liveStart,
        liveEnd,
        liveLength,
        virtualStart,
        virtualEnd,
        virtualLength,
        Infinity
      );
    }
  }
};
