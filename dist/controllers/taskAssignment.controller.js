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
exports.getTasksByInvoiceItem = exports.getTaskStatistics = exports.getMyTasks = exports.getEmployeeWorkload = exports.updateTask = exports.deleteTask = exports.updateTaskStatus = exports.getTask = exports.getTasks = exports.createTask = void 0;
const taskAssignment_model_1 = __importDefault(require("../models/taskAssignment.model"));
const invoiceItem_model_1 = __importDefault(require("../models/invoiceItem.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskData = req.body;
        const assignedBy = req.user._id; // From auth middleware
        console.log('Creating new task assignment:', { taskData });
        // Verify invoice item exists and is not deleted
        const invoiceItem = yield invoiceItem_model_1.default.findOne({ _id: taskData.invoiceItemId, isDeleted: false });
        if (!invoiceItem) {
            res.status(404).json({
                statusCode: 404,
                message: 'Invoice item not found',
                error: 'Invoice item not found'
            });
            return;
        }
        // Verify assigned employee exists and is not deleted
        const employee = yield user_model_1.default.findOne({ _id: taskData.assignedTo, isDeleted: false, isActive: true });
        if (!employee) {
            res.status(404).json({
                statusCode: 404,
                message: 'Employee not found or inactive',
                error: 'Employee not found or inactive'
            });
            return;
        }
        // Add assignedBy to task data
        taskData.assignedBy = assignedBy;
        // Create task assignment
        const task = new taskAssignment_model_1.default(taskData);
        yield task.save();
        // Populate related data
        yield task.populate([
            { path: 'invoiceItemId', select: 'psDescription qty rate total' },
            { path: 'assignedTo', select: 'name email role' },
            { path: 'assignedBy', select: 'name email role' }
        ]);
        console.log('Task assignment created successfully:', { taskId: task._id });
        res.status(201).json({
            statusCode: 201,
            message: 'Task assignment created successfully',
            data: { task },
        });
    }
    catch (error) {
        console.error('Create task assignment error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                statusCode: 400,
                message: 'Validation failed',
                error: 'Validation failed',
                details: errors
            });
        }
        else {
            res.status(500).json({
                statusCode: 500,
                message: 'Server error during task assignment creation',
                error: 'Server error during task assignment creation'
            });
        }
    }
});
exports.createTask = createTask;
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, invoiceItemId, assignedTo, status, taskType, priority, search, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
        console.log('Fetching tasks with filters:', { page, limit, invoiceItemId, assignedTo, status, taskType });
        // Build filter query
        const filter = { isDeleted: false };
        if (invoiceItemId)
            filter.invoiceItemId = invoiceItemId;
        if (assignedTo)
            filter.assignedTo = assignedTo;
        if (status)
            filter.status = status;
        if (taskType)
            filter.taskType = taskType;
        if (priority)
            filter.priority = priority;
        // Search functionality
        if (search) {
            filter.$or = [
                { taskName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        const sortObject = {};
        sortObject[sortBy] = sortDirection;
        const tasks = yield taskAssignment_model_1.default.find(filter)
            .populate('invoiceItemId', 'psDescription qty rate total')
            .populate('assignedTo', 'name email role')
            .populate('assignedBy', 'name email role')
            .sort(sortObject)
            .skip(skip)
            .limit(Number(limit));
        const total = yield taskAssignment_model_1.default.countDocuments(filter);
        res.status(200).json({
            statusCode: 200,
            message: 'Tasks retrieved successfully',
            data: {
                tasks,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    }
    catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getTasks = getTasks;
const getTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log('Fetching task by ID:', { taskId: id });
        const task = yield taskAssignment_model_1.default.findOne({ _id: id, isDeleted: false })
            .populate('invoiceItemId', 'psDescription qty rate total')
            .populate('assignedTo', 'name email role')
            .populate('assignedBy', 'name email role')
            .populate('dependsOn', 'taskName status');
        if (!task) {
            res.status(404).json({
                statusCode: 404,
                message: 'Task not found',
                error: 'Task not found'
            });
            return;
        }
        res.status(200).json({
            statusCode: 200,
            message: 'Task retrieved successfully',
            data: { task }
        });
    }
    catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getTask = getTask;
const updateTaskStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, actualHours, notes } = req.body;
        const userId = req.user._id;
        console.log('Updating task status:', { taskId: id, status, actualHours });
        const task = yield taskAssignment_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!task) {
            res.status(404).json({
                statusCode: 404,
                message: 'Task not found',
                error: 'Task not found'
            });
            return;
        }
        // Check if user is authorized to update this task
        if (task.assignedTo.toString() !== userId.toString() &&
            !['admin', 'manager'].includes(req.user.role)) {
            res.status(403).json({
                statusCode: 403,
                message: 'Not authorized to update this task',
                error: 'Access denied'
            });
            return;
        }
        const updateData = { status };
        if (actualHours !== undefined)
            updateData.actualHours = actualHours;
        if (notes)
            updateData.notes = notes;
        const updatedTask = yield taskAssignment_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate([
            { path: 'invoiceItemId', select: 'psDescription qty rate total' },
            { path: 'assignedTo', select: 'name email role' },
            { path: 'assignedBy', select: 'name email role' }
        ]);
        // Update invoice item overall status based on task completion
        yield updateInvoiceItemStatus(task.invoiceItemId.toString());
        console.log('Task status updated successfully:', { taskId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Task status updated successfully',
            data: { task: updatedTask },
        });
    }
    catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.updateTaskStatus = updateTaskStatus;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        console.log('Deleting task:', { taskId: id });
        const task = yield taskAssignment_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!task) {
            res.status(404).json({
                statusCode: 404,
                message: 'Task not found',
                error: 'Task not found'
            });
            return;
        }
        // Check if user is authorized to delete this task (only admin/manager)
        if (!['admin', 'manager'].includes(req.user.role)) {
            res.status(403).json({
                statusCode: 403,
                message: 'Not authorized to delete this task',
                error: 'Access denied'
            });
            return;
        }
        // Soft delete the task
        yield taskAssignment_model_1.default.findByIdAndUpdate(id, { isDeleted: true });
        // Update invoice item overall status after task deletion
        yield updateInvoiceItemStatus(task.invoiceItemId.toString());
        console.log('Task deleted successfully:', { taskId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Task deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.deleteTask = deleteTask;
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const userId = req.user._id;
        console.log('Updating task:', { taskId: id, updateData });
        const task = yield taskAssignment_model_1.default.findOne({ _id: id, isDeleted: false });
        if (!task) {
            res.status(404).json({
                statusCode: 404,
                message: 'Task not found',
                error: 'Task not found'
            });
            return;
        }
        // Check authorization
        if (!['admin', 'manager'].includes(req.user.role)) {
            res.status(403).json({
                statusCode: 403,
                message: 'Not authorized to update this task',
                error: 'Access denied'
            });
            return;
        }
        // Verify assigned employee exists if being updated
        if (updateData.assignedTo) {
            const employee = yield user_model_1.default.findOne({
                _id: updateData.assignedTo,
                isDeleted: false,
                isActive: true
            });
            if (!employee) {
                res.status(404).json({
                    statusCode: 404,
                    message: 'Assigned employee not found or inactive',
                    error: 'Employee not found or inactive'
                });
                return;
            }
        }
        const updatedTask = yield taskAssignment_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate([
            { path: 'invoiceItemId', select: 'psDescription qty rate total' },
            { path: 'assignedTo', select: 'name email role' },
            { path: 'assignedBy', select: 'name email role' }
        ]);
        console.log('Task updated successfully:', { taskId: id });
        res.status(200).json({
            statusCode: 200,
            message: 'Task updated successfully',
            data: { task: updatedTask },
        });
    }
    catch (error) {
        console.error('Update task error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                statusCode: 400,
                message: 'Validation failed',
                error: 'Validation failed',
                details: errors
            });
        }
        else {
            res.status(500).json({
                statusCode: 500,
                message: 'Server error',
                error: 'Internal server error'
            });
        }
    }
});
exports.updateTask = updateTask;
const getEmployeeWorkload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId } = req.query;
        console.log('Fetching employee workload:', { employeeId });
        const workload = yield taskAssignment_model_1.default.getEmployeeWorkload(employeeId);
        res.status(200).json({
            statusCode: 200,
            message: 'Employee workload retrieved successfully',
            data: { workload }
        });
    }
    catch (error) {
        console.error('Get employee workload error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getEmployeeWorkload = getEmployeeWorkload;
const getMyTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employeeId = req.user._id;
        const { status } = req.query;
        console.log('Fetching my tasks:', { employeeId, status });
        const tasks = yield taskAssignment_model_1.default.getTasksByEmployee(employeeId.toString(), status);
        res.status(200).json({
            statusCode: 200,
            message: 'My tasks retrieved successfully',
            data: { tasks }
        });
    }
    catch (error) {
        console.error('Get my tasks error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getMyTasks = getMyTasks;
const getTaskStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { start_date, end_date } = req.query;
        console.log('Fetching task statistics:', { start_date, end_date });
        const startDate = start_date ? new Date(start_date) : undefined;
        const endDate = end_date ? new Date(end_date) : undefined;
        const stats = yield taskAssignment_model_1.default.getTaskStatistics(startDate, endDate);
        res.status(200).json({
            statusCode: 200,
            message: 'Task statistics retrieved successfully',
            data: { statistics: stats }
        });
    }
    catch (error) {
        console.error('Get task statistics error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getTaskStatistics = getTaskStatistics;
const getTasksByInvoiceItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { invoiceItemId } = req.params;
        console.log('Fetching tasks by invoice item:', { invoiceItemId });
        const tasks = yield taskAssignment_model_1.default.getTasksByInvoiceItem(invoiceItemId);
        res.status(200).json({
            statusCode: 200,
            message: 'Tasks retrieved successfully',
            data: { tasks }
        });
    }
    catch (error) {
        console.error('Get tasks by invoice item error:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Server error',
            error: 'Internal server error'
        });
    }
});
exports.getTasksByInvoiceItem = getTasksByInvoiceItem;
// Helper function to update invoice item overall status
function updateInvoiceItemStatus(invoiceItemId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tasks = yield taskAssignment_model_1.default.find({
                invoiceItemId,
                isDeleted: false
            });
            if (tasks.length === 0) {
                // No tasks assigned yet
                yield invoiceItem_model_1.default.findByIdAndUpdate(invoiceItemId, {
                    overallStatus: 'Not Started',
                    taskProgress: 0
                });
                return;
            }
            const completedTasks = tasks.filter(task => task.status === 'Completed').length;
            const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
            const onHoldTasks = tasks.filter(task => task.status === 'On Hold').length;
            let overallStatus;
            let taskProgress;
            if (completedTasks === tasks.length) {
                overallStatus = 'Completed';
                taskProgress = 100;
            }
            else if (completedTasks > 0 || inProgressTasks > 0) {
                overallStatus = 'In Progress';
                taskProgress = Math.round((completedTasks / tasks.length) * 100);
            }
            else if (onHoldTasks > 0) {
                overallStatus = 'On Hold';
                taskProgress = Math.round((completedTasks / tasks.length) * 100);
            }
            else {
                overallStatus = 'Not Started';
                taskProgress = 0;
            }
            yield invoiceItem_model_1.default.findByIdAndUpdate(invoiceItemId, {
                overallStatus,
                taskProgress
            });
            console.log('Updated invoice item status:', {
                invoiceItemId,
                overallStatus,
                taskProgress
            });
        }
        catch (error) {
            console.error('Error updating invoice item status:', error);
        }
    });
}
