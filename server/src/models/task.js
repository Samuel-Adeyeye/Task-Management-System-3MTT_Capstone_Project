import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true,
      trim: true
    },
    deadline: {
        type: Date,
        required: true
      },
    completed: {
        type: Boolean,
        default: false,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
      },
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema);

export default Task;