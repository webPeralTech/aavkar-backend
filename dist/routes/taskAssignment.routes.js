"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskAssignment_controller_1 = require("../controllers/taskAssignment.controller");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticate);
/**
 * @swagger
 * components:
 *   schemas:
 *     TaskAssignment:
 *       type: object
 *       required:
 *         - invoiceItemId
 *         - taskType
 *         - taskName
 *         - assignedTo
 *       properties:
 *         _id:
 *           type: string
 *           description: Task assignment ID
 *         invoiceItemId:
 *           type: string
 *           description: Invoice item ID
 *         taskType:
 *           type: string
 *           enum: [Design, Printing, QC, Binding, Packaging, Delivery, Custom]
 *           description: Type of task
 *         taskName:
 *           type: string
 *           description: Task name
 *         description:
 *           type: string
 *           description: Task description
 *         assignedTo:
 *           type: string
 *           description: Employee ID assigned to task
 *         assignedBy:
 *           type: string
 *           description: Manager ID who assigned the task
 *         status:
 *           type: string
 *           enum: [Assigned, In Progress, On Hold, Completed, Cancelled]
 *           description: Current task status
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High, Urgent]
 *           description: Task priority
 *         estimatedHours:
 *           type: number
 *           description: Estimated hours to complete
 *         actualHours:
 *           type: number
 *           description: Actual hours spent
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Task start date
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Task due date
 *         completedDate:
 *           type: string
 *           format: date-time
 *           description: Task completion date
 *         notes:
 *           type: string
 *           description: Task notes
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *           description: File attachments
 *         dependsOn:
 *           type: array
 *           items:
 *             type: string
 *           description: Task IDs this task depends on
 *         isDeleted:
 *           type: boolean
 *           description: Soft delete flag
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags: [Task Assignments]
 *     summary: Create a new task assignment
 *     description: Assign a task to an employee for an invoice item (Admin/Manager only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceItemId
 *               - taskType
 *               - taskName
 *               - assignedTo
 *             properties:
 *               invoiceItemId:
 *                 type: string
 *                 description: Invoice item ID
 *               taskType:
 *                 type: string
 *                 enum: [Design, Printing, QC, Binding, Packaging, Delivery, Custom]
 *                 description: Type of task
 *               taskName:
 *                 type: string
 *                 description: Task name
 *               description:
 *                 type: string
 *                 description: Task description
 *               assignedTo:
 *                 type: string
 *                 description: Employee ID to assign to
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Urgent]
 *                 description: Task priority
 *               estimatedHours:
 *                 type: number
 *                 description: Estimated hours to complete
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Due date
 *               dependsOn:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of task IDs this task depends on
 *     responses:
 *       201:
 *         description: Task assignment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Task assignment created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/TaskAssignment'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager only
 *       404:
 *         description: Invoice item or employee not found
 */
router.post('/', taskAssignment_controller_1.createTask);
/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags: [Task Assignments]
 *     summary: Get all task assignments
 *     description: Retrieve task assignments with filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: invoiceItemId
 *         schema:
 *           type: string
 *         description: Filter by invoice item ID
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned employee
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Assigned, In Progress, On Hold, Completed, Cancelled]
 *         description: Filter by task status
 *       - in: query
 *         name: taskType
 *         schema:
 *           type: string
 *           enum: [Design, Printing, QC, Binding, Packaging, Delivery, Custom]
 *         description: Filter by task type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in task name, description, or notes
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Tasks retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskAssignment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get('/', taskAssignment_controller_1.getTasks);
/**
 * @swagger
 * /api/tasks/my-tasks:
 *   get:
 *     tags: [Task Assignments]
 *     summary: Get my assigned tasks
 *     description: Get tasks assigned to the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Assigned, In Progress, On Hold, Completed, Cancelled]
 *         description: Filter by task status
 *     responses:
 *       200:
 *         description: My tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: My tasks retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskAssignment'
 */
router.get('/my-tasks', taskAssignment_controller_1.getMyTasks);
/**
 * @swagger
 * /api/tasks/workload:
 *   get:
 *     tags: [Task Assignments]
 *     summary: Get employee workload
 *     description: Get workload statistics for employees (Admin/Manager only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Specific employee ID (optional, admin only)
 *     responses:
 *       200:
 *         description: Workload retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Employee workload retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     workload:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           employeeName:
 *                             type: string
 *                           employeeRole:
 *                             type: string
 *                           totalTasks:
 *                             type: integer
 *                           urgentTasks:
 *                             type: integer
 *                           highPriorityTasks:
 *                             type: integer
 *                           totalEstimatedHours:
 *                             type: number
 *                           overdueTasks:
 *                             type: integer
 */
router.get('/workload', taskAssignment_controller_1.getEmployeeWorkload);
/**
 * @swagger
 * /api/tasks/statistics:
 *   get:
 *     tags: [Task Assignments]
 *     summary: Get task statistics
 *     description: Get task completion and time tracking statistics (Admin/Manager only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Task statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     statistics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Task status
 *                           count:
 *                             type: integer
 *                           totalEstimatedHours:
 *                             type: number
 *                           totalActualHours:
 *                             type: number
 *                           avgEstimatedHours:
 *                             type: number
 *                           avgActualHours:
 *                             type: number
 */
router.get('/statistics', taskAssignment_controller_1.getTaskStatistics);
/**
 * @swagger
 * /api/tasks/invoice-item/{invoiceItemId}:
 *   get:
 *     tags: [Task Assignments]
 *     summary: Get tasks by invoice item
 *     description: Get all tasks for a specific invoice item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice item ID
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Tasks retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskAssignment'
 */
router.get('/invoice-item/:invoiceItemId', taskAssignment_controller_1.getTasksByInvoiceItem);
/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     tags: [Task Assignments]
 *     summary: Get task by ID
 *     description: Retrieve a specific task assignment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Task retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/TaskAssignment'
 *       404:
 *         description: Task not found
 */
router.get('/:id', taskAssignment_controller_1.getTask);
/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     tags: [Task Assignments]
 *     summary: Update task
 *     description: Update a task assignment (Admin/Manager only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskName:
 *                 type: string
 *               description:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Urgent]
 *               estimatedHours:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Task updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/TaskAssignment'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.put('/:id', taskAssignment_controller_1.updateTask);
/**
 * @swagger
 * /api/tasks/{id}/status:
 *   put:
 *     tags: [Task Assignments]
 *     summary: Update task status
 *     description: Update the status of a task assignment (Employee can update their own tasks)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Assigned, In Progress, On Hold, Completed, Cancelled]
 *                 description: New task status
 *               actualHours:
 *                 type: number
 *                 description: Actual hours spent (optional)
 *               notes:
 *                 type: string
 *                 description: Progress notes (optional)
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Task status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/TaskAssignment'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized to update this task
 *       404:
 *         description: Task not found
 */
router.put('/:id/status', taskAssignment_controller_1.updateTaskStatus);
/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     tags: [Task Assignments]
 *     summary: Delete task
 *     description: Soft delete a task assignment (Admin/Manager only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Task deleted successfully
 *       403:
 *         description: Forbidden - Admin/Manager only
 *       404:
 *         description: Task not found
 */
router.delete('/:id', taskAssignment_controller_1.deleteTask);
exports.default = router;
