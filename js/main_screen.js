const form = document.getElementById('joinForm');
const API_BASE = 'http://localhost:8080';
const TEAM_TOKEN_KEY = 'teamToken';

function getTeamToken() {
    return localStorage.getItem(TEAM_TOKEN_KEY);
}

function setTeamToken(token) {
    if (token) {
        localStorage.setItem(TEAM_TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TEAM_TOKEN_KEY);
    }
}

function clearTeamSession() {
    localStorage.removeItem(TEAM_TOKEN_KEY);
}

function authHeaders() {
    const token = getTeamToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson(path, options = {}) {
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

async function checkExistingSession() {
    if (!getTeamToken()) {
        return;
    }

    try {
        const me = await fetchJson('/api/game/me');
        const game = await fetchJson(`/api/game/${me.gameId}/state`);

        if (game.status === 'WAITING') {
            window.location.href = 'lobby.html';
            return;
        }

        if (game.status === 'ACTIVE') {
            window.location.href = 'game.html';
            return;
        }

        clearTeamSession();
    } catch (error) {
        clearTeamSession();
    }
}

checkExistingSession();

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const naam = document.getElementById('team-name').value.trim();
    const pin = document.getElementById('spel-pin').value.trim();
    const fout = document.getElementById('error-msg');

    if (!naam || !pin) {
        fout.textContent = 'Vul alle velden in.';
        fout.style.display = 'block';
        return;
    }

    if (pin.length !== 6) {
        fout.textContent = 'De spelcode moet uit 6 tekens bestaan.';
        fout.style.display = 'block';
        return;
    }

    fout.style.display = 'none';

    try {
        const data = await fetchJson('/api/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin, name: naam })
        });

        setTeamToken(data.token);
        window.location.href = 'lobby.html';
    } catch (error) {
        fout.textContent = error.message || 'Serverfout';
        fout.style.display = 'block';
    }
});
