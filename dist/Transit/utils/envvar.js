"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MTA_API_KEY = exports.extractStringEnvVar = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function extractStringEnvVar(key) {
    const value = process.env[key];
    if (value === undefined) {
        const message = `The environment variable "${key}" cannot be "undefined".`;
        throw new Error(message);
    }
    return value;
}
exports.extractStringEnvVar = extractStringEnvVar;
exports.MTA_API_KEY = extractStringEnvVar('MTA_API_KEY');
