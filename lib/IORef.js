"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @example
 * import { io, run } from 'fp-ts/lib/IO'
 * import { newIORef } from 'fp-ts/lib/IORef'
 *
 * assert.strictEqual(run(io.chain(newIORef(1), ref => io.chain(ref.write(2), () => ref.read))), 2)
 *
 * @since 2.0.0
 */
var IORef = /** @class */ (function () {
    function IORef(value) {
        var _this = this;
        this.value = value;
        this.read = function () { return _this.value; };
    }
    /**
     * @since 2.0.0
     */
    IORef.prototype.write = function (a) {
        var _this = this;
        return function () {
            _this.value = a;
        };
    };
    /**
     * @since 2.0.0
     */
    IORef.prototype.modify = function (f) {
        var _this = this;
        return function () {
            _this.value = f(_this.value);
        };
    };
    return IORef;
}());
exports.IORef = IORef;
/**
 * @since 2.0.0
 */
exports.newIORef = function (a) {
    return function () { return new IORef(a); };
};