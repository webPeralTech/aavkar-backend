"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const auth_1 = require("./auth");
exports.isAdmin = [
    auth_1.authenticate,
    (0, auth_1.authorize)('admin')
];
