import AuthService from './services/AuthService.js';
import TaskService from './services/TaskService.js';
import UI from './ui/UI.js'; 
import { taskActions } from './utils/helpers.js';
import DashboardUI from './ui/DashboardUI.js';


console.log('App initializing...');


try {
    const auth = new AuthService();
    const taskManager = new TaskService(auth);
    const ui = new UI(auth, taskManager);
    const dashboardUI = new DashboardUI(taskManager, auth);

    // Make task actions globally available
    window.toggleTaskComplete = (taskId, completed) => 
        taskActions.toggleTaskComplete(taskId, completed, taskManager, ui);
    window.deleteTask = (taskId) => 
        taskActions.deleteTask(taskId, taskManager, ui);
    window.changePage = (page) => 
        taskActions.changePage(page, ui);

    // Check if user is already authenticated
if (auth.isAuthenticated()) {
    dashboardUI.showDashboard();
} else {
    ui.showAuth();
}
} catch (error) {
    console.error('Error initializing app:', error);
}