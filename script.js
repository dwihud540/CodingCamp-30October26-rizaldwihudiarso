// ===== Expense & Budget Visualizer =====

// --- Constants ---
const STORAGE_KEY = 'ebv_transactions';
const THEME_KEY = 'ebv_theme';
const LIMIT_KEY = 'ebv_limit';
const CATEGORY_COLORS = {
    Food: '#ff6b6b',
    Transport: '#4ecdc4',
    Fun: '#ffe66d'
};
const CATEGORIES = ['Food', 'Transport', 'Fun'];

// --- State ---
let transactions = [];
let chart = null;
let spendingLimit = 0;

// --- DOM References ---
const form = document.getElementById('transactionForm');
const itemNameInput = document.getElementById('itemName');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const transactionList = document.getElementById('transactionList');
const totalBalanceEl = document.getElementById('totalBalance');
const validationMessage = document.getElementById('validationMessage');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const sortSelect = document.getElementById('sortSelect');
const spendingLimitInput = document.getElementById('spendingLimit');
const limitWarning = document.getElementById('limitWarning');
const monthlySummary = document.getElementById('monthlySummary');
const chartCanvas = document.getElementById('categoryChart');
const chartEmpty = document.getElementById('chartEmpty');

// ===== Storage =====
function saveTransactions() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
        alert('Could not save data to local storage. Your transactions will not persist.');
    }
}

function loadTransactions() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                transactions = parsed;
            }
        }
    } catch (e) {
        transactions = [];
    }
}

function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

function loadTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
}

function saveLimit(limit) {
    localStorage.setItem(LIMIT_KEY, String(limit));
}

function loadLimit() {
    const val = parseFloat(localStorage.getItem(LIMIT_KEY));
    return isNaN(val) ? 0 : val;
}

// ===== Theme =====
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? 'sun' : 'moon';
    saveTheme(theme);
    // Update chart colors if it exists
    if (chart) {
        updateChart();
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ===== Validation =====
function validateForm() {
    const name = itemNameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;

    // Check empty fields
    if (!name || !amountInput.value.trim() || !category) {
        showValidation('Please fill in all fields.');
        return null;
    }

    // Validate amount
    if (isNaN(amount) || amount < 0 || amount > 99999999999) {
        showValidation('Amount must be a positive number between 0 and 999.999.999.99.');
        return null;
    }

    // Check decimal places
    const decimalStr = amountInput.value.split('.')[1];
    if (decimalStr && decimalStr.length > 2) {
        showValidation('Amount must have at most 2 decimal places.');
        return null;
    }

    hideValidation();
    return { name, amount, category };
}

function showValidation(msg) {
    validationMessage.textContent = msg;
    validationMessage.classList.remove('hidden');
}

function hideValidation() {
    validationMessage.classList.add('hidden');
}

// ===== Transactions =====
function addTransaction(e) {
    e.preventDefault();
    const valid = validateForm();
    if (!valid) return;

    const transaction = {
        id: Date.now() + Math.random(),
        name: valid.name,
        amount: valid.amount,
        category: valid.category,
        date: new Date().toISOString()
    };

    transactions.unshift(transaction);
    saveTransactions();
    renderAll();

    // Reset form
    form.reset();
    itemNameInput.focus();
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    renderAll();
}

// ===== Rendering =====
function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getSortedTransactions() {
    const sort = sortSelect.value;
    let sorted = [...transactions];

    switch (sort) {
        case 'amount-asc':
            sorted.sort((a, b) => a.amount - b.amount);
            break;
        case 'amount-desc':
            sorted.sort((a, b) => b.amount - a.amount);
            break;
        case 'category':
            sorted.sort((a, b) => a.category.localeCompare(b.category));
            break;
        default:
            // Newest first (already unshifted)
            break;
    }
    return sorted;
}

function renderTransactionList() {
    const sorted = getSortedTransactions();

    if (sorted.length === 0) {
        transactionList.innerHTML = '<p class="empty-state">No transactions yet. Add one above!</p>';
        return;
    }

    transactionList.innerHTML = sorted.map(t => `
        <div class="transaction-item cat-${t.category.toLowerCase()}" role="listitem">
            <div class="transaction-info">
                <span class="transaction-name">${escapeHtml(t.name)}</span>
                <span class="transaction-meta">${t.category} - ${formatDate(t.date)}</span>
            </div>
            <div style="display:flex;align-items:center">
                <span class="transaction-amount">${formatCurrency(t.amount)}</span>
                <button class="btn-delete" onclick="deleteTransaction(${t.id})" aria-label="Delete transaction" title="Delete">&times;</button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderTotalBalance() {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    totalBalanceEl.textContent = formatCurrency(total);

    // Spending limit highlight
    if (spendingLimit > 0 && total > spendingLimit) {
        totalBalanceEl.classList.add('over-limit');
        limitWarning.classList.remove('hidden');
    } else {
        totalBalanceEl.classList.remove('over-limit');
        limitWarning.classList.add('hidden');
    }
}

// ===== Chart =====
function getCategoryTotals() {
    const totals = { Food: 0, Transport: 0, Fun: 0 };
    transactions.forEach(t => {
        if (totals[t.category] !== undefined) {
            totals[t.category] += t.amount;
        }
    });
    return totals;
}

function renderChart() {
    const totals = getCategoryTotals();
    const hasData = transactions.length > 0;

    if (hasData) {
        chartCanvas.style.display = 'block';
        chartEmpty.classList.add('hidden');
    } else {
        chartCanvas.style.display = 'none';
        chartEmpty.classList.remove('hidden');
        return;
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#e8e8f0' : '#1a1a2e';

    if (chart) {
        chart.data.datasets[0].data = CATEGORIES.map(c => totals[c]);
        chart.data.datasets[0].backgroundColor = CATEGORIES.map(c => CATEGORY_COLORS[c]);
        chart.options.plugins.legend.labels.color = textColor;
        chart.update();
    } else {
        const ctx = chartCanvas.getContext('2d');
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: CATEGORIES,
                datasets: [{
                    data: CATEGORIES.map(c => totals[c]),
                    backgroundColor: CATEGORIES.map(c => CATEGORY_COLORS[c]),
                    borderWidth: 2,
                    borderColor: isDark ? '#1a1a2e' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 16,
                            font: { size: 13 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                const label = ctx.label || '';
                                const value = ctx.parsed;
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return label + ': ' + formatCurrency(value) + ' (' + pct + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
}

function updateChart() {
    renderChart();
}

// ===== Monthly Summary =====
function renderMonthlySummary() {
    if (transactions.length === 0) {
        monthlySummary.innerHTML = '<p class="empty-state">No spending data available.</p>';
        return;
    }

    // Group by month
    const monthly = {};
    transactions.forEach(t => {
        const d = new Date(t.date);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        if (!monthly[key]) {
            monthly[key] = { label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), total: 0 };
        }
        monthly[key].total += t.amount;
    });

    // Sort chronologically (earliest to latest)
    const sortedMonths = Object.keys(monthly).sort().map(k => monthly[k]);

    monthlySummary.innerHTML = sortedMonths.map(m => `
        <div class="month-card" role="listitem">
            <span class="month-label">${m.label}</span>
            <span class="month-amount">${formatCurrency(m.total)}</span>
        </div>
    `).join('');
}

// ===== Master Render =====
function renderAll() {
    renderTransactionList();
    renderTotalBalance();
    renderChart();
    renderMonthlySummary();
}

// ===== Event Listeners =====
form.addEventListener('submit', addTransaction);
themeToggle.addEventListener('click', toggleTheme);
sortSelect.addEventListener('change', renderTransactionList);

spendingLimitInput.addEventListener('input', function() {
    spendingLimit = parseFloat(this.value) || 0;
    saveLimit(spendingLimit);
    renderTotalBalance();
});

// Expose deleteTransaction globally for inline onclick
window.deleteTransaction = deleteTransaction;

// ===== Init =====
function init() {
    // Load saved data
    loadTransactions();
    spendingLimit = loadLimit();
    spendingLimitInput.value = spendingLimit > 0 ? spendingLimit : '';

    // Apply theme
    const savedTheme = loadTheme();
    applyTheme(savedTheme);

    // Render everything
    renderAll();
}

init();
