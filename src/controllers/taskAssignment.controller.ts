import { Request, Response } from 'express';
import taskAssignmentModel, { ITaskAssignment } from '../models/taskAssignment.model';
import invoiceItemModel from '../models/invoiceItem.model';
import userModel from '../models/user.model';

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskData = req.body;
    const assignedBy = req.user._id; // From auth middleware

    console.log('Creating new task assignment:', { taskData });

    // Verify invoice item exists and is not deleted
    const invoiceItem = await invoiceItemModel.findOne({ _id: taskData.invoiceItemId, isDeleted: false });
    if (!invoiceItem) {
      res.status(404).json({
        statusCode: 404,
        message: 'Invoice item not found',
        error: 'Invoice item not found'
      });
      return;
    }

    // Verify assigned employee exists and is not deleted
    const employee = await userModel.findOne({ _id: taskData.assignedTo, isDeleted: false, isActive: true });
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
    const task: ITaskAssignment = new taskAssignmentModel(taskData);
    await task.save();

    // Populate related data
    await task.populate([
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
  } catch (error: any) {
    console.error('Create task assignment error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
        error: 'Validation failed',
        details: errors
      });
    } else {
      res.status(500).json({
        statusCode: 500,
        message: 'Server error during task assignment creation',
        error: 'Server error during task assignment creation'
      });
    }
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      invoiceItemId,
      assignedTo,
      status,
      taskType,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    console.log('Fetching tasks with filters:', { page, limit, invoiceItemId, assignedTo, status, taskType });

    // Build filter query
    const filter: any = { isDeleted: false };

    if (invoiceItemId) filter.invoiceItemId = invoiceItemId;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;
    if (taskType) filter.taskType = taskType;
    if (priority) filter.priority = priority;

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
    const sortObject: any = {};
    sortObject[sortBy as string] = sortDirection;

    const tasks = await taskAssignmentModel.find(filter)
      .populate('invoiceItemId', 'psDescription qty rate total')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit));

    const total = await taskAssignmentModel.countDocuments(filter);

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
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('Fetching task by ID:', { taskId: id });

    const task = await taskAssignmentModel.findOne({ _id: id, isDeleted: false })
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
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, actualHours, notes } = req.body;
    const userId = req.user._id;

    console.log('Updating task status:', { taskId: id, status, actualHours });

    const task = await taskAssignmentModel.findOne({ _id: id, isDeleted: false });

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

    const updateData: any = { status };
    if (actualHours !== undefined) updateData.actualHours = actualHours;
    if (notes) updateData.notes = notes;

    const updatedTask = await taskAssignmentModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'invoiceItemId', select: 'psDescription qty rate total' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'assignedBy', select: 'name email role' }
    ]);

    // Update invoice item overall status based on task completion
    await updateInvoiceItemStatus(task.invoiceItemId.toString());

    console.log('Task status updated successfully:', { taskId: id });

    res.status(200).json({
      statusCode: 200,
      message: 'Task status updated successfully',
      data: { task: updatedTask },
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log('Deleting task:', { taskId: id });

    const task = await taskAssignmentModel.findOne({ _id: id, isDeleted: false });

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
    await taskAssignmentModel.findByIdAndUpdate(id, { isDeleted: true });

    // Update invoice item overall status after task deletion
    await updateInvoiceItemStatus(task.invoiceItemId.toString());

    console.log('Task deleted successfully:', { taskId: id });

    res.status(200).json({
      statusCode: 200,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user._id;

    console.log('Updating task:', { taskId: id, updateData });

    const task = await taskAssignmentModel.findOne({ _id: id, isDeleted: false });

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
      const employee = await userModel.findOne({ 
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

    const updatedTask = await taskAssignmentModel.findByIdAndUpdate(id, updateData, {
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
  } catch (error: any) {
    console.error('Update task error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        statusCode: 400,
        message: 'Validation failed',
        error: 'Validation failed',
        details: errors
      });
    } else {
      res.status(500).json({
        statusCode: 500,
        message: 'Server error',
        error: 'Internal server error'
      });
    }
  }
};

export const getEmployeeWorkload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.query;

    console.log('Fetching employee workload:', { employeeId });

    const workload = await taskAssignmentModel.getEmployeeWorkload(employeeId as string);

    res.status(200).json({
      statusCode: 200,
      message: 'Employee workload retrieved successfully',
      data: { workload }
    });
  } catch (error) {
    console.error('Get employee workload error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const getMyTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = req.user._id;
    const { status } = req.query;

    console.log('Fetching my tasks:', { employeeId, status });

    const tasks = await taskAssignmentModel.getTasksByEmployee(employeeId.toString(), status as string);

    res.status(200).json({
      statusCode: 200,
      message: 'My tasks retrieved successfully',
      data: { tasks }
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const getTaskStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start_date, end_date } = req.query;

    console.log('Fetching task statistics:', { start_date, end_date });

    const startDate = start_date ? new Date(start_date as string) : undefined;
    const endDate = end_date ? new Date(end_date as string) : undefined;

    const stats = await taskAssignmentModel.getTaskStatistics(startDate, endDate);

    res.status(200).json({
      statusCode: 200,
      message: 'Task statistics retrieved successfully',
      data: { statistics: stats }
    });
  } catch (error) {
    console.error('Get task statistics error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

export const getTasksByInvoiceItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceItemId } = req.params;

    console.log('Fetching tasks by invoice item:', { invoiceItemId });

    const tasks = await taskAssignmentModel.getTasksByInvoiceItem(invoiceItemId);

    res.status(200).json({
      statusCode: 200,
      message: 'Tasks retrieved successfully',
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks by invoice item error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: 'Internal server error'
    });
  }
};

// Helper function to update invoice item overall status
async function updateInvoiceItemStatus(invoiceItemId: string) {
  try {
    const tasks = await taskAssignmentModel.find({ 
      invoiceItemId, 
      isDeleted: false 
    });

    if (tasks.length === 0) {
      // No tasks assigned yet
      await invoiceItemModel.findByIdAndUpdate(invoiceItemId, {
        overallStatus: 'Not Started',
        taskProgress: 0
      });
      return;
    }

    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    const onHoldTasks = tasks.filter(task => task.status === 'On Hold').length;

    let overallStatus: string;
    let taskProgress: number;

    if (completedTasks === tasks.length) {
      overallStatus = 'Completed';
      taskProgress = 100;
    } else if (completedTasks > 0 || inProgressTasks > 0) {
      overallStatus = 'In Progress';
      taskProgress = Math.round((completedTasks / tasks.length) * 100);
    } else if (onHoldTasks > 0) {
      overallStatus = 'On Hold';
      taskProgress = Math.round((completedTasks / tasks.length) * 100);
    } else {
      overallStatus = 'Not Started';
      taskProgress = 0;
    }

    await invoiceItemModel.findByIdAndUpdate(invoiceItemId, {
      overallStatus,
      taskProgress
    });

    console.log('Updated invoice item status:', { 
      invoiceItemId, 
      overallStatus, 
      taskProgress 
    });
  } catch (error) {
    console.error('Error updating invoice item status:', error);
  }
} 