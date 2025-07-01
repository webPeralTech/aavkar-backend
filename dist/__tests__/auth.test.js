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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe('Authentication', () => {
    const testUser = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'testpassword123',
        role: 'employee'
    };
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser).expect(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(testUser.email);
            expect(response.body.user).not.toHaveProperty('password');
        }));
        it('should return 400 for invalid email', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(Object.assign(Object.assign({}, testUser), { email: 'invalid-email' }))
                .expect(400);
            expect(response.body).toHaveProperty('error');
        }));
        it('should return 400 for duplicate email', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser);
            const response = yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser).expect(400);
            expect(response.body.error).toContain('already exists');
        }));
    });
    describe('POST /api/auth/login', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser);
        }));
        it('should login user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: testUser.password,
            })
                .expect(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(testUser.email);
        }));
        it('should return 401 for invalid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: 'wrongpassword',
            })
                .expect(401);
            expect(response.body.error).toBe('Invalid credentials');
        }));
        it('should return 401 for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'nonexistent@example.com',
                password: 'password123',
            })
                .expect(401);
            expect(response.body.error).toBe('Invalid credentials');
        }));
    });
    describe('GET /api/auth/profile', () => {
        let token;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const registerResponse = yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser);
            token = registerResponse.body.token;
        }));
        it('should get user profile successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(response.body.user.email).toBe(testUser.email);
            expect(response.body.user).not.toHaveProperty('password');
        }));
        it('should return 401 without token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default).get('/api/auth/profile').expect(401);
            expect(response.body.error).toBe('No token provided');
        }));
        it('should return 401 with invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
            expect(response.body.error).toBe('Invalid token');
        }));
    });
});
