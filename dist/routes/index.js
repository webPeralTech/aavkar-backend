"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const customers_routes_1 = __importDefault(require("./customers.routes"));
const company_routes_1 = __importDefault(require("./company.routes"));
const location_routes_1 = __importDefault(require("./location.routes"));
const products_routes_1 = __importDefault(require("./products.routes"));
const payment_routes_1 = __importDefault(require("./payment.routes"));
const invoice_routes_1 = __importDefault(require("./invoice.routes"));
const invoiceItem_routes_1 = __importDefault(require("./invoiceItem.routes"));
const taskAssignment_routes_1 = __importDefault(require("./taskAssignment.routes"));
const router = express_1.default.Router();
// Mount all routes
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/customers', customers_routes_1.default);
router.use('/companies', company_routes_1.default);
router.use('/locations', location_routes_1.default);
router.use('/products', products_routes_1.default);
router.use('/payments', payment_routes_1.default);
router.use('/invoices', invoice_routes_1.default);
router.use('/invoice-items', invoiceItem_routes_1.default);
router.use('/tasks', taskAssignment_routes_1.default);
exports.default = router;
