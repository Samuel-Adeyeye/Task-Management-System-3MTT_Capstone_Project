import { config } from '../config/config.js';

class AuthService {
    constructor() {
        this.baseUrl = "http://localhost:3000/api";
        // this.baseUrl = config.API_URL;
        this.token = localStorage.getItem('token');
        // this.token = localStorage.getItem(config.TOKEN_KEY);
    }

    async register(email, password) {
        const response = await fetch(`${this.baseUrl}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        console.log('Registration response status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        return response.json();
    }

    async login(email, password) {
        const response = await fetch(`${this.baseUrl}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        this.token = data.token;
        localStorage.setItem(config.TOKEN_KEY, data.token);
        return data;
    }

    logout() {
        this.token = null;
        localStorage.removeItem(config.TOKEN_KEY);
    }

    isAuthenticated() {
        return !!this.token;
    }
}

export default new AuthService();