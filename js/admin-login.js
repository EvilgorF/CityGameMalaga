const API_BASE = 'http://localhost:8080';
const ADMIN_TOKEN_KEY = 'adminToken';

function setAdminToken(token) {
    if (token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
}

async function login() {
    const message = document.getElementById('message');
    message.textContent = '';

    try {
        const response = await fetch(`${API_BASE}/api/auth/admin/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value
            })
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }

        setAdminToken(data.token);
        window.location.href = 'admin-dashboard.html';
    } catch (error) {
        message.textContent = error.message;
    }
}

document.getElementById('login-btn').addEventListener('click', login);

if (localStorage.getItem(ADMIN_TOKEN_KEY)) {
    window.location.href = 'admin-dashboard.html';
}
