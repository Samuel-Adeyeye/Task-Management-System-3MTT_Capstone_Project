class UI {
    constructor(auth, taskManager) {
        this.auth = auth;
        this.taskManager = taskManager;
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        // Auth elements
        this.authForms = document.getElementById('authForms');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        
        // Main app elements
        this.mainApp = document.getElementById('mainApp');
        this.taskForm = document.getElementById('taskForm');
        this.tasksList = document.getElementById('tasksList');
        this.searchInput = document.getElementById('searchInput');
        this.priorityFilter = document.getElementById('priorityFilter');
        this.sortBy = document.getElementById('sortBy');
        
        // Other elements
        this.toast = document.getElementById('toast');
        this.userEmail = document.getElementById('userEmail');
        this.logoutBtn = document.getElementById('logoutBtn');
    }

    setupEventListeners() {
        // Auth events
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchAuthForm(btn.dataset.form));
        });

        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());

        // Task events
        this.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        this.searchInput.addEventListener('input', debounce(() => this.loadTasks(), 300));
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
            this.showApp();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        try {
            const email = e.target.querySelector('[type="email"]').value;
            const password = e.target.querySelector('[type="password"]').value;
            const confirmPassword = e.target.querySelectorAll('[type="password"]')[1].value;

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            await this.auth.register(email, password);
            this.showToast('Registration successful! Please login.', 'success');
            this.switchAuthForm('login');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    handleLogout() {
        this.auth.logout();
        this.showAuth();
    }

    async handleTaskSubmit(e) {
        e.preventDefault();
        try {
            const taskData = {
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDescription').value,
                priority: document.getElementById('taskPriority').value,
                deadline: document.getElementById('taskDeadline').value
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
            const filters = {
                search: this.searchInput.value,
                priority: this.priorityFilter.value,
                sortBy: this.sortBy.value
            };

            const tasks = await this.taskManager.getTasks(filters);
            this.renderTasks(tasks);
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    renderTasks(tasks) {
        this.tasksList.innerHTML = tasks.map(task => `
            <div class="task-card" data-id="${task._id}">
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <div class="task-actions">
                        <span class="priority-badge priority-${task.priority}">
                            ${task.priority}
                        </span>
                        <button class="btn btn-danger delete-task" data-id="${task._id}">
                            Delete
                        </button>
                    </div>
                </div>
                <p class="task-description">${task.description || ''}</p>
                <div class="task-deadline">
                    Due: ${new Date(task.deadline).toLocaleString()}
                </div>
            </div>
        `).join('');

        // Add delete event listeners
        this.tasksList.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDeleteTask(e));
        });
    }

    async handleDeleteTask(e) {
        const taskId = e.target.dataset.id;
        try {
            await this.taskManager.deleteTask(taskId);
            this.showToast('Task deleted successfully', 'success');
            this.loadTasks();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    switchAuthForm(form) {
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.form === form);
        });
        this.loginForm.classList.toggle('hidden', form !== 'login');
        this.registerForm.classList.toggle('hidden', form !== 'register');
    }

    showAuth() {
        this.authForms.classList.remove('hidden');
        this.mainApp.classList.add('hidden');
        this.userEmail.textContent = '';
    }

    showApp() {
        this.authForms.classList.add('hidden');
        this.mainApp.classList.remove('hidden');
        const user = JSON.parse(atob(this.auth.token.split('.')[1]));
        this.userEmail.textContent = user.email;
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

// Helper function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}