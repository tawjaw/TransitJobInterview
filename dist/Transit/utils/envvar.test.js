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
const envvar_1 = require("./envvar");
(0, ava_1.default)('should get correct key', (t) => __awaiter(void 0, void 0, void 0, function* () {
    process.env.TEST = 'CORRECT';
    t.is((0, envvar_1.extractStringEnvVar)('TEST'), 'CORRECT');
    process.env.TEST = 'TEST';
    t.is((0, envvar_1.extractStringEnvVar)('TEST'), 'TEST');
}));
(0, ava_1.default)('should throw error when key not found', (t) => __awaiter(void 0, void 0, void 0, function* () {
    process.env.TEST = 'CORRECT';
    t.throws(() => {
        (0, envvar_1.extractStringEnvVar)('WRONG');
    });
}));
