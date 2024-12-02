export function debounce(func, wait) {
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

// Global task action handlers
export const taskActions = {
    async toggleTaskComplete(taskId, completed, taskManager, ui) {
        try {
            await taskManager.updateTask(taskId, { completed });
            ui.loadTasks();
            ui.showToast('Task updated successfully', 'success');
        } catch (error) {
            ui.showToast(error.message, 'error');
        }
    },

    async deleteTask(taskId, taskManager, ui) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await taskManager.deleteTask(taskId);
                ui.loadTasks();
                ui.showToast('Task deleted successfully', 'success');
            } catch (error) {
                ui.showToast(error.message, 'error');
            }
        }
    },

    changePage(page, ui) {
        ui.currentPage = page;
        ui.loadTasks();
    }
};