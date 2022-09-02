"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isString = void 0;
function isString(value) {
    return typeof value === 'string' || value instanceof String;
}
exports.isString = isString;
