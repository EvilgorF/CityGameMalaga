const form = document.getElementById('joinForm');
const API_BASE = 'http://localhost:8080';

// Als er al een sessie is → direct doorsturen
async function checkExistingSession() {
    const existingToken = localStorage.getItem('token');
    if (!existingToken) return;

    try {
        const payload = JSON.parse(atob(existingToken.split('.')[1]));
        const gameId = payload.gameId;

        const res  = await fetch(`${API_BASE}/api/game/${gameId}/state`);
        const data = await res.json();

        if (data.status === 'WAITING')  window.location.href = 'lobby.html';
        if (data.status === 'ACTIVE')   window.location.href = 'game.html';
        if (data.status === 'FINISHED') localStorage.clear();
    } catch (e) {
        localStorage.clear();
    }
}

checkExistingSession();

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('team-name').value.trim();
    const pin  = document.getElementById('spel-pin').value.trim();
    const err  = document.getElementById('error-msg');

    if (!name || !pin) {
        err.textContent = 'Vul alle velden in.';
        err.style.display = 'block';
        return;
    }
    if (pin.length !== 6) {
        err.textContent = 'PIN moet 6 cijfers zijn.';
        err.style.display = 'block';
        return;
    }

    err.style.display = 'none';

    try {
        const res  = await fetch(`${API_BASE}/api/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ pin, name })
        });

        const text = await res.text();

        if (!res.ok) {
            let message = `Serverfout (${res.status})`;
            try {
                const body = JSON.parse(text);
                if (body.message) message = body.message;
            } catch {
                if (text) message = text.slice(0, 200);
            }
            err.textContent = message;
            err.style.display = 'block';
            return;
        }

        if (!text) {
            err.textContent = 'Lege response van server.';
            err.style.display = 'block';
            return;
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            err.textContent = 'Ongeldige JSON van server.';
            err.style.display = 'block';
            return;
        }

        if (!data.token) {
            err.textContent = 'Geen token van server — controleer de API.';
            err.style.display = 'block';
            return;
        }

        const payload = JSON.parse(atob(data.token.split('.')[1]));
        localStorage.setItem('token',    data.token);
        localStorage.setItem('gameId',   payload.gameId);
        localStorage.setItem('teamId',   payload.teamId);
        localStorage.setItem('teamName', payload.sub);

        window.location.href = 'lobby.html';

    } catch (e) {
        const raw = e && e.message ? e.message : String(e);
        if (/Failed to fetch|NetworkError|Load failed|fetch/i.test(raw)) {
            err.textContent =
                'Geen verbinding met ' + API_BASE +
                '. Start de backend (poort 8080), of open de site via http://localhost:… (Live Server), niet als los HTML-bestand.';
        } else {
            err.textContent = 'Fout: ' + raw;
        }
        err.style.display = 'block';
    }
});