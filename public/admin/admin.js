// Admin Dashboard JavaScript

const API_BASE = '/api/admin';
let authToken = null;
let charts = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    authToken = localStorage.getItem('admin_token');
    if (authToken) {
        showDashboard();
        loadData();
    } else {
        showLogin();
    }

    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('date-range').addEventListener('change', loadData);
});

function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success && data.token) {
            authToken = data.token;
            localStorage.setItem('admin_token', authToken);
            errorDiv.style.display = 'none';
            showDashboard();
            loadData();
        } else {
            errorDiv.textContent = data.error || 'Anmeldung fehlgeschlagen';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Verbindungsfehler. Bitte versuche es erneut.';
        errorDiv.style.display = 'block';
    }
}

function handleLogout() {
    authToken = null;
    localStorage.removeItem('admin_token');
    showLogin();
    // Destroy charts
    Object.values(charts).forEach(chart => chart.destroy());
    charts = {};
}

function getDateRange() {
    const range = document.getElementById('date-range').value;
    const now = new Date();
    let start, end;

    switch (range) {
        case 'today':
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'week':
            start = new Date(now);
            start.setDate(now.getDate() - 7);
            end = new Date(now);
            end.setDate(now.getDate() + 1);
            break;
        case 'month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
        case 'year':
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear() + 1, 0, 1);
            break;
        default: // all
            start = new Date(0);
            end = new Date(now.getFullYear() + 10, 0, 1);
    }

    return {
        start: start.toISOString().split('T')[0] + ' 00:00:00',
        end: end.toISOString().split('T')[0] + ' 23:59:59'
    };
}

async function loadData() {
    if (!authToken) return;

    const { start, end } = getDateRange();

    try {
        // Load stats
        const statsResponse = await fetch(`${API_BASE}/stats?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (statsResponse.status === 401) {
            handleLogout();
            return;
        }

        const stats = await statsResponse.json();
        updateStats(stats);

        // Load charts
        await Promise.all([
            loadTrafficSources(start, end),
            loadConversions(start, end),
            loadPageViews(start, end),
            loadDemographics(start, end),
            loadKeywords(start, end)
        ]);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function updateStats(stats) {
    document.getElementById('stat-visits').textContent = formatNumber(stats.totalVisits || 0);
    document.getElementById('stat-pageviews').textContent = formatNumber(stats.totalPageViews || 0);
    document.getElementById('stat-avgtime').textContent = formatTime(stats.avgTimeOnPage || 0);
    document.getElementById('stat-conversions').textContent = formatNumber(stats.totalConversions || 0);
}

async function loadTrafficSources(start, end) {
    try {
        const response = await fetch(`${API_BASE}/traffic-sources?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();

        if (charts.traffic) charts.traffic.destroy();
        charts.traffic = new Chart(document.getElementById('traffic-chart'), {
            type: 'doughnut',
            data: {
                labels: data.labels || [],
                datasets: [{
                    data: data.values || [],
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#ec4899',
                        '#64748b'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading traffic sources:', error);
    }
}

async function loadConversions(start, end) {
    try {
        const response = await fetch(`${API_BASE}/conversions?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();

        if (charts.conversions) charts.conversions.destroy();
        charts.conversions = new Chart(document.getElementById('conversions-chart'), {
            type: 'bar',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: 'Conversions',
                    data: data.values || [],
                    backgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading conversions:', error);
    }
}

async function loadPageViews(start, end) {
    try {
        const response = await fetch(`${API_BASE}/page-views?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();

        if (charts.pages) charts.pages.destroy();
        charts.pages = new Chart(document.getElementById('pages-chart'), {
            type: 'bar',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: 'Aufrufe',
                    data: data.values || [],
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading page views:', error);
    }
}

async function loadDemographics(start, end) {
    try {
        const response = await fetch(`${API_BASE}/demographics?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();

        if (charts.devices) charts.devices.destroy();
        charts.devices = new Chart(document.getElementById('devices-chart'), {
            type: 'pie',
            data: {
                labels: data.deviceTypes?.labels || [],
                datasets: [{
                    data: data.deviceTypes?.values || [],
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#64748b'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading demographics:', error);
    }
}

async function loadKeywords(start, end) {
    try {
        const response = await fetch(`${API_BASE}/keywords?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const keywords = await response.json();

        const tableDiv = document.getElementById('keywords-table');
        if (keywords.length === 0) {
            tableDiv.innerHTML = '<div class="loading">Keine Suchbegriffe gefunden</div>';
            return;
        }

        let html = '<table><thead><tr><th>Rang</th><th>Suchbegriff</th><th>Anzahl</th></tr></thead><tbody>';
        keywords.forEach((item, index) => {
            html += `<tr><td>${index + 1}</td><td>${escapeHtml(item.keyword)}</td><td>${item.count}</td></tr>`;
        });
        html += '</tbody></table>';
        tableDiv.innerHTML = html;
    } catch (error) {
        console.error('Error loading keywords:', error);
        document.getElementById('keywords-table').innerHTML = '<div class="loading">Fehler beim Laden</div>';
    }
}

function formatNumber(num) {
    return new Intl.NumberFormat('de-DE').format(num);
}

function formatTime(seconds) {
    if (!seconds || seconds < 60) {
        return Math.round(seconds || 0) + 's';
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}



