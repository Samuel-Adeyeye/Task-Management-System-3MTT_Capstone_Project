import { config } from '../config/config.js';
import AuthService from './AuthService.js';

class TaskService {
    constructor() {
        this.baseUrl = `${config.API_URL}/tasks`;
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AuthService.token}`
        };
    }

    async createTask(taskData) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create task');
        }

        return response.json();
    }

    async getTasks(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(
            `${this.baseUrl}${queryString ? `?${queryString}` : ''}`,
            {
                headers: this.getHeaders()
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch tasks');
        }

        return response.json();
    }

    async updateTask(taskId, updates) {
        const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.auth.token}`
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update task');
        }

        return response.json();
    }

    async deleteTask(taskId) {
        const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.auth.token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete task');
        }

        return response.json();
    }
}


export default TaskService;