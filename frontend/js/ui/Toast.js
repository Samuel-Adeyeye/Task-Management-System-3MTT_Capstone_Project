export class Toast {
    constructor() {
        this.toast = document.getElementById('toast');
    }

    show(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast show ${type}`;
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}