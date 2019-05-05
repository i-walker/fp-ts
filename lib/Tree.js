"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Array_1 = require("./Array");
var function_1 = require("./function");
var Eq_1 = require("./Eq");
exports.URI = 'Tree';
/**
 * @since 2.0.0
 */
exports.make = function (value, forest) {
    return {
        value: value,
        forest: forest
    };
};
/**
 * @since 2.0.0
 */
exports.getShow = function (S) {
    var show = function (t) {
        return "make(" + S.show(t.value) + ", [" + t.forest.map(show).join(', ') + "])";
    };
    return {
        show: show
    };
};
var map = function (fa, f) {
    return { value: f(fa.value), forest: fa.forest.map(function (tree) { return map(tree, f); }) };
};
var of = function (a) {
    return { value: a, forest: Array_1.empty };
};
var ap = function (fab, fa) {
    return chain(fab, function (f) { return map(fa, f); }); // <- derived
};
var chain = function (fa, f) {
    var _a = f(fa.value), value = _a.value, forest = _a.forest;
    var concat = Array_1.getMonoid().concat;
    return { value: value, forest: concat(forest, fa.forest.map(function (t) { return chain(t, f); })) };
};
var extract = function (fa) {
    return fa.value;
};
var extend = function (fa, f) {
    return { value: f(fa), forest: fa.forest.map(function (t) { return extend(t, f); }) };
};
var reduce = function (fa, b, f) {
    var r = f(b, fa.value);
    var len = fa.forest.length;
    for (var i = 0; i < len; i++) {
        r = reduce(fa.forest[i], r, f);
    }
    return r;
};
var foldMap = function (M) { return function (fa, f) {
    return reduce(fa, M.empty, function (acc, a) { return M.concat(acc, f(a)); });
}; };
var reduceRight = function (fa, b, f) {
    var r = b;
    var len = fa.forest.length;
    for (var i = len - 1; i >= 0; i--) {
        r = reduceRight(fa.forest[i], r, f);
    }
    return f(fa.value, r);
};
function traverse(F) {
    var traverseF = Array_1.array.traverse(F);
    var r = function (ta, f) {
        return F.ap(F.map(f(ta.value), function (value) { return function (forest) { return ({
            value: value,
            forest: forest
        }); }; }), traverseF(ta.forest, function (t) { return r(t, f); }));
    };
    return r;
}
function sequence(F) {
    var traverseF = traverse(F);
    return function (ta) { return traverseF(ta, function_1.identity); };
}
/**
 * @since 2.0.0
 */
exports.getEq = function (E) {
    var SA;
    var R = Eq_1.fromEquals(function (x, y) { return E.equals(x.value, y.value) && SA.equals(x.forest, y.forest); });
    SA = Array_1.getEq(R);
    return R;
};
/**
 * @since 2.0.0
 */
exports.tree = {
    URI: exports.URI,
    map: map,
    of: of,
    ap: ap,
    chain: chain,
    reduce: reduce,
    foldMap: foldMap,
    reduceRight: reduceRight,
    traverse: traverse,
    sequence: sequence,
    extract: extract,
    extend: extend
};
var draw = function (indentation, forest) {
    var r = '';
    var len = forest.length;
    var tree;
    for (var i = 0; i < len; i++) {
        tree = forest[i];
        var isLast = i === len - 1;
        r += indentation + (isLast ? '└' : '├') + '─ ' + tree.value;
        r += draw(indentation + (len > 1 && !isLast ? '│  ' : '   '), tree.forest);
    }
    return r;
};
/**
 * Neat 2-dimensional drawing of a forest
 *
 * @since 2.0.0
 */
exports.drawForest = function (forest) {
    return draw('\n', forest);
};
/**
 * Neat 2-dimensional drawing of a tree
 *
 * @example
 * import { make, drawTree, tree } from 'fp-ts/lib/Tree'
 *
 * const fa = make('a', [
 *   tree.of('b'),
 *   tree.of('c'),
 *   make('d', [tree.of('e'), tree.of('f')])
 * ])
 *
 * assert.strictEqual(drawTree(fa), `a
 * ├─ b
 * ├─ c
 * └─ d
 *    ├─ e
 *    └─ f`)
 *
 *
 * @since 2.0.0
 */
exports.drawTree = function (tree) {
    return tree.value + exports.drawForest(tree.forest);
};
/**
 * Build a tree from a seed value
 *
 * @since 2.0.0
 */
exports.unfoldTree = function (b, f) {
    var _a = f(b), a = _a[0], bs = _a[1];
    return { value: a, forest: exports.unfoldForest(bs, f) };
};
/**
 * Build a tree from a seed value
 *
 * @since 2.0.0
 */
exports.unfoldForest = function (bs, f) {
    return bs.map(function (b) { return exports.unfoldTree(b, f); });
};
function unfoldTreeM(M) {
    var unfoldForestMM = unfoldForestM(M);
    return function (b, f) { return M.chain(f(b), function (_a) {
        var a = _a[0], bs = _a[1];
        return M.chain(unfoldForestMM(bs, f), function (ts) { return M.of({ value: a, forest: ts }); });
    }); };
}
exports.unfoldTreeM = unfoldTreeM;
function unfoldForestM(M) {
    var traverseM = Array_1.array.traverse(M);
    var unfoldTree;
    return function (bs, f) {
        // tslint:disable-next-line
        if (unfoldTree === undefined) {
            unfoldTree = unfoldTreeM(M);
        }
        return traverseM(bs, function (b) { return unfoldTree(b, f); });
    };
}
exports.unfoldForestM = unfoldForestM;
/**
 * @since 2.0.0
 */
function elem(E) {
    var go = function (a, fa) {
        if (E.equals(a, fa.value)) {
            return true;
        }
        return fa.forest.some(function (tree) { return go(a, tree); });
    };
    return go;
}
exports.elem = elem;