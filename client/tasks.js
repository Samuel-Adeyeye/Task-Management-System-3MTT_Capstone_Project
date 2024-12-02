class TaskManager {
    constructor(auth) {
        this.auth = auth;
        this.baseUrl = 'http://localhost:3000/api';
    }

    async createTask(taskData) {
        const response = await fetch(`${this.baseUrl}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.auth.token}`
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create task');
        }

        return response.json();
    }

    async getTasks(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(
            `${this.baseUrl}/tasks${queryParams ? `?${queryParams}` : ''}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.auth.token}`
                }
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch tasks');
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