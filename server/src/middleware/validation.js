import { validationResult, check } from 'express-validator';

export const taskValidationRules = [
    check('title').trim().notEmpty().withMessage('Title is required'),
    check('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
    check('deadline').isISO8601().withMessage('Invalid deadline date')
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

// export default {
//     taskValidationRules,
//     userValidationRules,
//     validate
// };