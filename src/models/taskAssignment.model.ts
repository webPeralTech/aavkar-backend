import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITaskAssignment extends Document {
  invoiceItemId: mongoose.Types.ObjectId;
  taskType: 'Design' | 'Printing' | 'QC' | 'Binding' | 'Packaging' | 'Delivery' | 'Custom';
  taskName: string;
  description?: string;
  assignedTo: mongoose.Types.ObjectId; // User ID
  assignedBy: mongoose.Types.ObjectId; // User ID who assigned the task
  status: 'Assigned' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedHours?: number;
  actualHours?: number;
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  notes?: string;
  attachments?: string[]; // File paths or URLs
  dependsOn?: mongoose.Types.ObjectId[]; // Other task IDs this task depends on
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskAssignmentModel extends Model<ITaskAssignment> {
  getTasksByEmployee(employeeId: string, status?: string): Promise<ITaskAssignment[]>;
  getTasksByInvoiceItem(invoiceItemId: string): Promise<ITaskAssignment[]>;
  getTaskStatistics(startDate?: Date, endDate?: Date): Promise<any[]>;
  getEmployeeWorkload(employeeId?: string): Promise<any[]>;
}

const taskAssignmentSchema = new Schema<ITaskAssignment>(
  {
    invoiceItemId: {
      type: Schema.Types.ObjectId,
      ref: 'InvoiceItem',
      required: [true, 'Invoice Item ID is required'],
      index: true,
    },
    taskType: {
      type: String,
      enum: {
        values: ['Design', 'Printing', 'QC', 'Binding', 'Packaging', 'Delivery', 'Custom'],
        message: 'Task type must be one of: Design, Printing, QC, Binding, Packaging, Delivery, Custom'
      },
      required: [true, 'Task type is required'],
      index: true,
    },
    taskName: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
      maxlength: [200, 'Task name cannot be more than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned employee is required'],
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigning user is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Assigned', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
        message: 'Status must be one of: Assigned, In Progress, On Hold, Completed, Cancelled'
      },
      default: 'Assigned',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Urgent'],
        message: 'Priority must be one of: Low, Medium, High, Urgent'
      },
      default: 'Medium',
      index: true,
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative'],
      validate: {
        validator: function(v: number) {
          return !v || /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Estimated hours can have at most 2 decimal places'
      },
    },
    actualHours: {
      type: Number,
      min: [0, 'Actual hours cannot be negative'],
      validate: {
        validator: function(v: number) {
          return !v || /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: 'Actual hours can have at most 2 decimal places'
      },
    },
    startDate: {
      type: Date,
      index: true,
    },
    dueDate: {
      type: Date,
      index: true,
      validate: {
        validator: function(v: Date) {
          return !v || !this.startDate || v >= this.startDate;
        },
        message: 'Due date cannot be before start date'
      },
    },
    completedDate: {
      type: Date,
      validate: {
        validator: function(v: Date) {
          return !v || !this.startDate || v >= this.startDate;
        },
        message: 'Completed date cannot be before start date'
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot be more than 2000 characters'],
    },
    attachments: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 10; // Max 10 attachments
        },
        message: 'Cannot have more than 10 attachments'
      },
    },
    dependsOn: {
      type: [Schema.Types.ObjectId],
      ref: 'TaskAssignment',
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for better query performance
taskAssignmentSchema.index({ assignedTo: 1, status: 1 });
taskAssignmentSchema.index({ invoiceItemId: 1, taskType: 1 });
taskAssignmentSchema.index({ status: 1, priority: 1 });
taskAssignmentSchema.index({ dueDate: 1, status: 1 });
taskAssignmentSchema.index({ assignedTo: 1, dueDate: 1 });

// Pre-save middleware to set completed date when status changes to completed
taskAssignmentSchema.pre('save', function(next) {
  if (this.status === 'Completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  
  if (this.status === 'In Progress' && !this.startDate) {
    this.startDate = new Date();
  }

  // Round hours to 2 decimal places
  if (this.estimatedHours) {
    this.estimatedHours = Math.round(this.estimatedHours * 100) / 100;
  }
  if (this.actualHours) {
    this.actualHours = Math.round(this.actualHours * 100) / 100;
  }

  next();
});

// Virtual for task duration (if completed)
taskAssignmentSchema.virtual('duration').get(function() {
  if (this.startDate && this.completedDate) {
    const diff = this.completedDate.getTime() - this.startDate.getTime();
    return Math.round(diff / (1000 * 60 * 60)); // Return hours
  }
  return null;
});

// Virtual for overdue status
taskAssignmentSchema.virtual('isOverdue').get(function() {
  if (this.dueDate && this.status !== 'Completed' && this.status !== 'Cancelled') {
    return new Date() > this.dueDate;
  }
  return false;
});

// Static method to get tasks by employee
taskAssignmentSchema.statics.getTasksByEmployee = function(employeeId: string, status?: string) {
  const filter: any = { assignedTo: employeeId, isDeleted: false };
  if (status) filter.status = status;
  
  return this.find(filter)
    .populate('invoiceItemId', 'psDescription qty rate total')
    .populate('assignedBy', 'name role')
    .sort({ priority: -1, dueDate: 1 });
};

// Static method to get tasks by invoice item
taskAssignmentSchema.statics.getTasksByInvoiceItem = function(invoiceItemId: string) {
  return this.find({ invoiceItemId, isDeleted: false })
    .populate('assignedTo', 'name role')
    .populate('assignedBy', 'name role')
    .sort({ createdAt: 1 });
};

// Static method to get task statistics
taskAssignmentSchema.statics.getTaskStatistics = function(startDate?: Date, endDate?: Date) {
  const matchStage: any = { isDeleted: false };
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalEstimatedHours: { $sum: '$estimatedHours' },
        totalActualHours: { $sum: '$actualHours' },
        avgEstimatedHours: { $avg: '$estimatedHours' },
        avgActualHours: { $avg: '$actualHours' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get employee workload
taskAssignmentSchema.statics.getEmployeeWorkload = function(employeeId?: string) {
  const matchStage: any = { 
    isDeleted: false, 
    status: { $in: ['Assigned', 'In Progress'] }
  };
  if (employeeId) matchStage.assignedTo = new mongoose.Types.ObjectId(employeeId);

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$assignedTo',
        totalTasks: { $sum: 1 },
        urgentTasks: { 
          $sum: { $cond: [{ $eq: ['$priority', 'Urgent'] }, 1, 0] }
        },
        highPriorityTasks: { 
          $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] }
        },
        totalEstimatedHours: { $sum: '$estimatedHours' },
        overdueTasks: {
          $sum: {
            $cond: [
              { $and: [
                { $ne: ['$dueDate', null] },
                { $lt: ['$dueDate', new Date()] }
              ]},
              1, 0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'employee'
      }
    },
    { $unwind: '$employee' },
    {
      $project: {
        employeeName: '$employee.name',
        employeeRole: '$employee.role',
        totalTasks: 1,
        urgentTasks: 1,
        highPriorityTasks: 1,
        totalEstimatedHours: 1,
        overdueTasks: 1
      }
    },
    { $sort: { totalTasks: -1 } }
  ]);
};

// Ensure virtuals are included in JSON output
taskAssignmentSchema.set('toJSON', { virtuals: true });
taskAssignmentSchema.set('toObject', { virtuals: true });

export default mongoose.model<ITaskAssignment, ITaskAssignmentModel>('TaskAssignment', taskAssignmentSchema); 