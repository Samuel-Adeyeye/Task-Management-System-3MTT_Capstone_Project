document.addEventListener('DOMContentLoaded', () => {
    const auth = new Auth();
    const taskManager = new TaskManager(auth);
    const ui = new UI(auth, taskManager);

    // Check if user is already authenticated
    if (auth.isAuthenticated()) {
        ui.showApp();
    } else {
        ui.showAuth();
    }
});