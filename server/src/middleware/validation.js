import { validationResult, check } from 'express-validator';

export const taskValidationRules = [
    check('title').trim().notEmpty().withMessage('Title is required'),
    check('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
    check('deadline').custom((value) => {
        const date = new Date(value);
        return !isNaN(date.getTime()); // Checks if it's a valid date
    })
    .withMessage('Please enter a valid date')
];

export const taskUpdateValidationRules = [
    check('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    check('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
    check('deadline').optional()
    .custom((value) => {
        const date = new Date(value);
        return !isNaN(date.getTime());
    })
    .withMessage('Please enter a valid date'),
    check('completed').optional().isBoolean().withMessage('Completed must be true or false')
];

export const userValidationRules = [
    check('email').isEmail().withMessage('Invalid email address'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
