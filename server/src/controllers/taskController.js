import Task from '../models/task.js';

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const createTask = async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            userId: req.user.userId
        });
        await task.save();

        const response = task.toObject();
        response.deadline = formatDate(response.deadline);

        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getAllTasks = async (req, res) => {
    try {
        const {
            search,
            priority,
            completed,
            category,
            tag,
            sortBy,
            page = 1,
            limit = 10,
            startDate,
            endDate
        } = req.query;

        // Base query
        const query = { userId: req.user.userId };

        // Search by title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by priority
        if (priority) {
            query.priority = priority;
        }

        // Filter by completion status
        if (completed) {
            query.completed = completed === 'true';
        }

        // Filter by category
        if (category) {
            query.categories = category;
        }

        // Filter by tag
        if (tag) {
            query.tags = tag;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.deadline = {};
            if (startDate) query.deadline.$gte = new Date(startDate);
            if (endDate) query.deadline.$lte = new Date(endDate);
        }

        // Sort configuration
        let sort = {};
        if (sortBy) {
            const [field, order] = sortBy.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1; // Default sort by creation date
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Execute query with pagination
        const tasks = await Task.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip)
            .lean(); 

    // Format the date in response
    const formattedTasks = tasks.map(task => ({
        ...task,
        deadline: formatDate(task.deadline)
    }));

        // Get total count for pagination
        const totalTasks = await Task.countDocuments(query);

        // Get statistics
        const statistics = await Task.aggregate([
            { $match: { userId: req.user.userId } },
            {
                $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: ['$completed', 1, 0] }
                    },
                    highPriority: {
                        $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
                    },
                    mediumPriority: {
                        $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
                    },
                    lowPriority: {
                        $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
                    },
                    overdueTasks: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $lt: ['$deadline', new Date()] },
                                        { $eq: ['$completed', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        res.json({
            tasks: formattedTasks,
            pagination: {
                total: totalTasks,
                pages: Math.ceil(totalTasks / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            },
            statistics: statistics[0] || {
                totalTasks: 0,
                completedTasks: 0,
                highPriority: 0,
                mediumPriority: 0,
                lowPriority: 0,
                overdueTasks: 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


export const updateTask = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        Object.assign(task, req.body);
        await task.save();

        // Format the response
        const response = task.toObject();
        response.deadline = formatDate(response.deadline);

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const result = await Task.deleteOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};