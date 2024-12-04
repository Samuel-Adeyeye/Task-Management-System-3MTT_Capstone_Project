import { debounce } from '../utils/helpers.js';

class UI {
    constructor(auth, taskManager) {
        console.log('starting ========')
        this.auth = auth;
        this.taskManager = taskManager;
        this.initializeElements();
        this.setupAuthEventListeners();
        this.currentPage = 1;
    }

    initializeElements() {
        // Auth elements
        this.authContainer = document.getElementById('authContainer');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.authTabs = document.querySelectorAll('.auth-tab');
        console.log('Auth tabs found:', this.authTabs.length);
        
    }
    setupAuthEventListeners() {
        console.log('yooooooo')
        this.authTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAuthTab(tab.dataset.tab));
        });

        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    async handleLogin(e) {
        e.preventDefault();
        try {
            const email = e.target.querySelector('[type="email"]').value;
            const password = e.target.querySelector('[type="password"]').value;
            
            await this.auth.login(email, password);
            this.showToast('Logged in successfully', 'success');
            this.showDashboard();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }
    async handleRegister(e) {
        e.preventDefault();
        console.log('Handling register...');
        try {
            const email = e.target.querySelector('[type="email"]').value;
            const password = e.target.querySelector('[type="password"]').value;
            const confirmPassword = e.target.querySelectorAll('[type="password"]')[1].value;

            console.log('Register data:', { email });

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            await this.auth.register(email, password);
            this.showToast('Registration successful! Please login.', 'success');
            this.switchAuthTab('login');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }
    
    
    switchAuthTab(tab) {
        console.log('switchAuthTab called with:', tab);
    
        // Toggle tab active states
        this.authTabs.forEach(t => {
            if (t.dataset.tab === tab) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });
    
        // Toggle form visibility
        if (tab === 'login') {
            this.loginForm.style.display = 'block';
            this.registerForm.style.display = 'none';
            this.loginForm.classList.add('active');
            this.registerForm.classList.remove('active');
        } else {
            this.loginForm.style.display = 'none';
            this.registerForm.style.display = 'block';
            this.loginForm.classList.remove('active');
            this.registerForm.classList.add('active');
        }
    
        console.log('Current tab:', tab);
        console.log('Login form display:', this.loginForm.style.display);
        console.log('Register form display:', this.registerForm.style.display);
    }


    showAuth() {
        this.authContainer.style.display = 'block';
        if(this.dashboard)
        this.dashboard.style.display = 'none';
    }
    
    showToast(message, type = 'success') {
        if (this.toast) {
            
            this.toast.textContent = message;
            this.toast.className = `toast show ${type}`;
            setTimeout(() => {
                this.toast.classList.remove('show');
            }, 3000);
        }
    }
}

export default UI;