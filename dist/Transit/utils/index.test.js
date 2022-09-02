"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const _1 = require(".");
(0, ava_1.default)('should return true when a string is passed', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.is((0, _1.isString)('this is a string'), true);
}));
(0, ava_1.default)('should return false when undefined is passed', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.is((0, _1.isString)(undefined), false);
}));
(0, ava_1.default)('should return false when number is passed', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.is((0, _1.isString)(5), false);
}));
