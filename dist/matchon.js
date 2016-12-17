(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.matchon = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _toArray(arr) {
    return Array.isArray(arr) ? arr : Array.from(arr);
  }

  var whatis = function whatis(x) {
    return x && x.constructor ? x.constructor.name : Object.prototype.toString.call(x).replace('[object ', '').replace(']', '');
  };

  var mismatch = function mismatch() {
    for (var _len = arguments.length, xs = Array(_len), _key = 0; _key < _len; _key++) {
      xs[_key] = arguments[_key];
    }

    throw new Error('No pattern matched <' + pattern(xs) + '>');
  };

  var first = function first(_ref, p) {
    var _ref2 = _toArray(_ref),
        fn = _ref2[0],
        rest = _ref2.slice(1);

    if (!fn) return mismatch;
    var f = fn(p);
    if (f) return f;
    return first(rest, p);
  };

  var isSameType = function isSameType(x, y) {
    return x === '*' || y === '*' || x === y;
  };

  var hasMatch = function hasMatch(xs, ys) {
    return xs.length === ys.length && xs.reduce(function (acc, x, i) {
      return acc && isSameType(x, ys[i]);
    }, true);
  };

  var trim = function trim(s) {
    return s.trim();
  };

  var normalized = function normalized(p) {
    return p.split(',').map(trim);
  };

  var pattern = function pattern(xs) {
    return xs.map(whatis);
  };

  var _on = function _on(p, fn) {
    var norm = normalized(p);
    return function (p2) {
      return hasMatch(norm, p2) ? fn : undefined;
    };
  };

  var match = exports.match = function match() {
    for (var _len2 = arguments.length, fns = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      fns[_key2] = arguments[_key2];
    }

    return function () {
      for (var _len3 = arguments.length, xs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        xs[_key3] = arguments[_key3];
      }

      return first(fns, pattern(xs)).apply(undefined, xs);
    };
  };

  var on = exports.on = match(_on('String, Function', _on), _on('Function', function (fn) {
    return function () {
      return fn;
    };
  }));
});
