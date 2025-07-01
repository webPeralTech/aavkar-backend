"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
// Configure logger based on environment
const logger = (0, pino_1.default)(Object.assign(Object.assign({ level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info') }, (isDevelopment && {
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
        },
    },
})), (isTest && {
    level: 'silent', // Disable logging during tests
})));
exports.default = logger;
