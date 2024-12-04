import { debounce } from '../utils/helpers.js';

class DashboardUI {
    constructor(taskManager, auth) {
        this.taskManager = taskManager;
        this.auth = auth;
        this.initializeDashboardElements();
        this.setupDashboardEventListeners();
    }

    initializeDashboardElements() {
        this.dashboard = document.getElementById('dashboard');
        this.taskList = document.getElementById('taskList');
        this.pagination = document.getElementById('pagination');
        this.searchInput = document.getElementById('searchInput');
        this.priorityFilter = document.getElementById('priorityFilter');
        this.sortBy = document.getElementById('sortBy');
        this.statisticsElements = {
            totalTasks: document.getElementById('totalTasks'),
            completedTasks: document.getElementById('completedTasks'),
            highPriority: document.getElementById('highPriority'),
            overdueTasks: document.getElementById('overdueTasks')
        };
        this.userEmail = document.getElementById('userEmail');
        this.logoutBtn = document.getElementById('logoutBtn');
    }

    setupDashboardEventListeners() {
        this.searchInput.addEventListener('input', debounce(() => this.loadTasks(), 500));
        this.priorityFilter.addEventListener('change', () => this.loadTasks());
        this.sortBy.addEventListener('change', () => this.loadTasks());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
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
        this.dashboard.style.display = 'none';
        this.auth.showAuth();
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
}

export default DashboardUI;