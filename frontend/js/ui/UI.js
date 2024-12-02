import { debounce } from '../utils/helpers.js';

class UI {
    constructor(auth, taskManager) {
        this.auth = auth;
        this.taskManager = taskManager;
        this.initializeElements();
        this.setupEventListeners();
        this.currentPage = 1;
    }

    initializeElements() {
        // Auth elements
        this.authContainer = document.getElementById('authContainer');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.authTabs = document.querySelectorAll('.auth-tab');
        console.log('Auth tabs found:', this.authTabs.length);
        
        // Dashboard elements
        this.dashboard = document.getElementById('dashboard');
        this.taskForm = document.getElementById('taskForm');
        this.taskList = document.getElementById('taskList');
        this.searchInput = document.getElementById('searchInput');
        this.priorityFilter = document.getElementById('priorityFilter');
        this.sortBy = document.getElementById('sortBy');
        this.pagination = document.getElementById('pagination');
        
        // Statistics elements
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.highPriority = document.getElementById('highPriority');
        this.overdueTasks = document.getElementById('overdueTasks');
        
        // Other elements
        this.userEmail = document.getElementById('userEmail');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.toast = document.getElementById('toast');
    }
    setupEventListeners() { 
        // Auth tabs
        this.authTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                console.log('Tab clicked!');
                const tabType = tab.dataset.tab;
                console.log('Switching to:', tabType);
                this.switchAuthTab(tabType);
            });
        });

        // Forms
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => { 
            console.log('Register form submitted');
            this.handleRegister(e);
    });

        this.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());

        // Filters
        this.searchInput.addEventListener('input', debounce(() => this.loadTasks(), 500));
        this.priorityFilter.addEventListener('change', () => this.loadTasks());
        this.sortBy.addEventListener('change', () => this.loadTasks());
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
    async handleTaskSubmit(e) {
        e.preventDefault();
        try {
            const taskData = {
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDescription').value,
                priority: document.getElementById('taskPriority').value,
                deadline: document.getElementById('taskDeadline').value,
                categories: document.getElementById('taskCategories').value.split(',').map(c => c.trim()).filter(Boolean),
                tags: document.getElementById('taskTags').value.split(',').map(t => t.trim()).filter(Boolean)
            };

            await this.taskManager.createTask(taskData);
            this.showToast('Task created successfully', 'success');
            e.target.reset();
            this.loadTasks();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }
    async loadTasks() {
        try {
            const params = {
                search: this.searchInput.value,
                priority: this.priorityFilter.value,
                sortBy: this.sortBy.value,
                page: this.currentPage,
                limit: 6
            };

            const data = await this.taskManager.getTasks(params);
            this.renderTasks(data.tasks);
            this.updateStatistics(data.statistics);
            this.renderPagination(data.pagination);
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }
    renderTasks(tasks) {
        this.taskList.innerHTML = tasks.map(task => `
            <div class="task-card">
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <span class="priority-badge priority-${task.priority}">
                        ${task.priority}
                    </span>
                </div>
                <p>${task.description || ''}</p>
                <div class="task-meta">
                    <div>Deadline: ${task.deadline}</div>
                    ${task.categories.length ? `<div>Categories: ${task.categories.join(', ')}</div>` : ''}
                    ${task.tags.length ? `<div>Tags: ${task.tags.join(', ')}</div>` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn btn-primary" onclick="toggleTaskComplete('${task._id}', ${!task.completed})">
                        ${task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteTask('${task._id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    updateStatistics(stats) {
        this.totalTasks.textContent = stats.totalTasks;
        this.completedTasks.textContent = stats.completedTasks;
        this.highPriority.textContent = stats.highPriority;
        this.overdueTasks.textContent = stats.overdueTasks;
    }

    renderPagination(pagination) {
        const pages = [];
        for (let i = 1; i <= pagination.pages; i++) {
            pages.push(`
                <button class="page-btn ${i === pagination.currentPage ? 'active' : ''}"
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `);
        }
        this.pagination.innerHTML = pages.join('');
    }
    handleLogout() {
        this.auth.logout();
        this.showAuth();
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
        this.dashboard.style.display = 'none';
    }
    showDashboard() {
        this.authContainer.style.display = 'none';
        this.dashboard.style.display = 'block';
        this.loadTasks();
    }
    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast show ${type}`;
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

export default UI;