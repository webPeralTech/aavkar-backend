"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Log incoming request
    logger_1.default.info(Object.assign({ method: req.method, url: req.url, userAgent: req.get('User-Agent'), ip: req.ip }, (req.user && { userId: req.user._id })), 'Incoming request');
    // Override res.end to log response
    const originalEnd = res.end.bind(res);
    res.end = function (chunk, encoding) {
        const duration = Date.now() - start;
        logger_1.default.info(Object.assign({ method: req.method, url: req.url, statusCode: res.statusCode, duration: `${duration}ms` }, (req.user && { userId: req.user._id })), 'Request completed');
        return originalEnd(chunk, encoding);
    };
    next();
};
exports.requestLogger = requestLogger;
