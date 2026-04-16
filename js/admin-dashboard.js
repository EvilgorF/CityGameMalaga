const API_BASE = 'http://lister.local:8080';
const ADMIN_TOKEN_KEY = 'adminToken';
const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);

if (!adminToken) {
    window.location.href = 'admin.html';
}

function authHeaders() {
    return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
}

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        ...options,
        headers: {
            ...(options.headers || {}),
            ...authHeaders()
        }
    });

    const text = await response.text();
    let data = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}`);
    }

    return data;
}

function formatDate(value) {
    return value ? new Date(value).toLocaleString('nl-NL') : '-';
}

function setActiveTab(tab) {
    document.querySelectorAll('.admin-tab').forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === tab);
    });

    document.getElementById('view-create').classList.toggle('active', tab === 'create');
    document.getElementById('view-games').classList.toggle('active', tab === 'games');

    if (tab === 'games') {
        loadGames();
    }
}

async function createGame() {
    const message = document.getElementById('create-message');
    message.textContent = '';

    const rawValue = document.getElementById('start-time').value;
    if (!rawValue) {
        message.textContent = 'Kies eerst een startdatum en tijd.';
        return;
    }

    try {
        const data = await request('/api/game/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startTime: new Date(rawValue).toISOString() })
        });

        message.textContent = `Spel #${data.gameId} aangemaakt. PIN: ${data.pin}`;
        //        setActiveTab('games');
    } catch (error) {
        message.textContent = error.message;
    }
}

async function loadGames() {
    const gamesList = document.getElementById('games-list');
    const message = document.getElementById('games-message');
    message.textContent = '';
    gamesList.innerHTML = '';

    try {
        const games = await request('/api/admin/games');

        if (!games.length) {
            gamesList.innerHTML = '<div class="game-card">Er zijn nog geen spellen beschikbaar.</div>';
            return;
        }

        games.forEach((game) => {
            const card = document.createElement('div');
            card.className = 'admin-game-card';
            card.innerHTML = `
                <span class="admin-game-status">${game.status}</span>
                <h3 class="admin-game-title">Spel #${game.id}</h3>
                <div class="admin-game-meta">
                  <span>PIN: ${game.pin}</span>
                  <span>Start: ${formatDate(game.startTime)}</span>
                  <span>Einde: ${formatDate(game.endTime)}</span>
                </div>
                <div class="admin-game-actions">
                  <button class="btn" data-action="start" data-id="${game.id}">Start</button>
                  <button class="secondary" data-action="finish" data-id="${game.id}">Beëindigen</button>
                </div>
            `;
            gamesList.appendChild(card);
        });
    } catch (error) {
        message.textContent = error.message;
    }
}

async function runGameAction(gameId, action) {
    const message = document.getElementById('games-message');
    try {
        await request(`/api/game/${gameId}/${action}`, { method: 'POST' });
        await loadGames();
    } catch (error) {
        message.textContent = error.message;
    }
}

async function logout() {
    try {
        await request('/api/auth/logout', { method: 'POST' });
    } finally {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        window.location.href = 'admin.html';
    }
}

document.querySelectorAll('.admin-tab').forEach((button) => {
    button.addEventListener('click', () => setActiveTab(button.dataset.tab));
});

document.getElementById('create-btn').addEventListener('click', createGame);
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('games-list').addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }

    await runGameAction(button.dataset.id, button.dataset.action);
});

document.getElementById('start-time').value = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16);
loadGames();
