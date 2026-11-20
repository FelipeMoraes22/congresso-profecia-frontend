import { apiService } from './services/apiService.js';
import { initQrModal } from './components/qrModal.js';

let isAdmin = false;
let eventIsOpen = true;
let allQuestions = [];
let currentFilter = 'all';
let pollingInterval = null;

// Elementos do DOM
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const questionForm = document.getElementById('questionForm');
const closedNotice = document.getElementById('closedNotice');
const submitBtn = document.getElementById('submitBtn');
const btnLabel = document.getElementById('btnLabel');
const btnSpinner = document.getElementById('btnSpinner');
const publicSection = document.getElementById('publicSection');
const adminSection = document.getElementById('adminSection');
const adminToggleBtn = document.getElementById('adminToggleBtn');
const adminBtnText = document.getElementById('adminBtnText');
const toggleStatusBtn = document.getElementById('toggleStatusBtn');
const toggleStatusText = document.getElementById('toggleStatusText');
const questionsList = document.getElementById('questionsList');
const questionsCount = document.getElementById('questionsCount');
const adminAuthModal = document.getElementById('adminAuthModal');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const successModal = document.getElementById('successModal');

function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function updateStatusUI() {
    if (eventIsOpen) {
        statusDot.className = 'w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]';
        statusText.className = 'text-xs sm:text-sm font-semibold text-emerald-300 uppercase tracking-wider';
        statusText.textContent = 'Perguntas Abertas';

        if (!isAdmin) {
            questionForm.classList.remove('hidden');
            closedNotice.classList.add('hidden');
        }

        toggleStatusBtn.className = 'w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30';
        toggleStatusText.textContent = '● Evento Aberto (Clique p/ Fechar)';
    } else {
        statusDot.className = 'w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]';
        statusText.className = 'text-xs sm:text-sm font-semibold text-rose-300 uppercase tracking-wider';
        statusText.textContent = 'Perguntas Fechadas';

        if (!isAdmin) {
            questionForm.classList.add('hidden');
            closedNotice.classList.remove('hidden');
        }

        toggleStatusBtn.className = 'w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30';
        toggleStatusText.textContent = '○ Evento Fechado (Clique p/ Abrir)';
    }
}

function renderQuestions() {
    questionsCount.textContent = allQuestions.length;
    if (!isAdmin) return;

    const filtered = allQuestions.filter((q) => {
        if (currentFilter === 'pending') return !q.answered;
        if (currentFilter === 'answered') return q.answered;
        return true;
    });

    if (filtered.length === 0) {
        questionsList.innerHTML = `<div class="glass-card rounded-xl p-8 text-center text-gray-400 text-xs">Nenhuma pergunta encontrada neste filtro.</div>`;
        return;
    }

    questionsList.innerHTML = filtered.map((q) => {
        const dateObj = new Date(q.timestamp);
        const timeStr = isNaN(dateObj) ? '' : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `
      <div class="glass-card rounded-xl p-4 transition-all ${q.answered ? 'opacity-65 border-gray-700' : 'border-amber-500/30'}">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="flex items-center gap-2">
            <span class="font-bold text-xs text-amber-200">${escapeHtml(q.name)}</span>
            <span class="text-[10px] text-gray-400 font-mono">${timeStr}</span>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${q.answered ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
            ${q.answered ? 'Respondida' : 'Pendente'}
          </span>
        </div>
        <p class="text-sm text-gray-100 font-medium leading-relaxed mb-4">${escapeHtml(q.question)}</p>
        <div class="flex items-center justify-end gap-2 border-t border-amber-900/20 pt-3">
          <button data-action="toggle" data-id="${q.id}" data-status="${!q.answered}" 
            class="px-3 py-1.5 rounded-lg text-xs font-semibold ${q.answered ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40'} transition-colors">
            ${q.answered ? '↩ Marcar Pendente' : '✓ Marcar Respondida'}
          </button>
          <button data-action="delete" data-id="${q.id}" 
            class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-colors">
            🗑 Excluir
          </button>
        </div>
      </div>
    `;
    }).join('');
}

async function syncData() {
    try {
        const statusData = await apiService.getEventStatus();
        eventIsOpen = statusData.isOpen;
        updateStatusUI();

        if (isAdmin) {
            const qData = await apiService.getQuestions();
            allQuestions = qData.questions;
            renderQuestions();
        }
    } catch (err) {
        if (err.message === 'UNAUTHORIZED') {
            disableAdminMode();
        }
    }
}

function enableAdminMode() {
    isAdmin = true;
    adminBtnText.textContent = 'Sair do Admin';
    adminToggleBtn.classList.add('bg-amber-500/30', 'border-amber-400');
    publicSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    syncData();
}

function disableAdminMode() {
    isAdmin = false;
    apiService.clearToken();
    adminBtnText.textContent = 'Painel Admin';
    adminToggleBtn.classList.remove('bg-amber-500/30', 'border-amber-400');
    adminSection.classList.add('hidden');
    publicSection.classList.remove('hidden');
    updateStatusUI();
}

// Eventos do Formulário Público
questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!eventIsOpen) return;

    const name = document.getElementById('userName').value.trim();
    const question = document.getElementById('userQuestion').value.trim();
    if (!question) return;

    submitBtn.disabled = true;
    btnLabel.textContent = 'Enviando...';
    btnSpinner.classList.remove('hidden');

    try {
        await apiService.submitQuestion(name, question);
        questionForm.reset();
        successModal.classList.remove('hidden');
    } catch (err) {
        alert(err.message);
    } finally {
        submitBtn.disabled = false;
        btnLabel.textContent = 'Enviar Pergunta';
        btnSpinner.classList.add('hidden');
    }
});

// Eventos Admin
adminToggleBtn.addEventListener('click', () => {
    if (isAdmin) {
        disableAdminMode();
    } else {
        adminAuthModal.classList.remove('hidden');
        adminPasswordInput.focus();
    }
});

document.getElementById('confirmAdminAuthBtn').addEventListener('click', async () => {
    const pwd = adminPasswordInput.value;
    try {
        await apiService.loginAdmin(pwd);
        adminAuthModal.classList.add('hidden');
        adminPasswordInput.value = '';
        enableAdminMode();
    } catch {
        adminPasswordInput.classList.add('border-rose-500');
        setTimeout(() => adminPasswordInput.classList.remove('border-rose-500'), 1500);
    }
});

document.getElementById('cancelAdminAuthBtn').addEventListener('click', () => {
    adminAuthModal.classList.add('hidden');
    adminPasswordInput.value = '';
});

toggleStatusBtn.addEventListener('click', async () => {
    if (!isAdmin) return;
    try {
        const res = await apiService.toggleEventStatus(!eventIsOpen);
        eventIsOpen = res.isOpen;
        updateStatusUI();
    } catch (err) {
        console.error(err);
    }
});

// Delegação de eventos para botões de cada pergunta
questionsList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'toggle') {
        const nextStatus = btn.dataset.status === 'true';
        await apiService.updateQuestionAnswered(id, nextStatus);
        await syncData();
    } else if (action === 'delete') {
        await apiService.deleteQuestion(id);
        await syncData();
    }
});

// Filtros
document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach((b) => {
            b.className = 'filter-btn flex-1 py-2 rounded-lg font-semibold glass-card text-gray-300 hover:text-white';
        });
        e.target.className = 'filter-btn active flex-1 py-2 rounded-lg font-semibold bg-amber-500/30 border border-amber-500/50 text-white';
        currentFilter = e.target.dataset.filter;
        renderQuestions();
    });
});

document.getElementById('closeSuccessBtn').addEventListener('click', () => {
    successModal.classList.add('hidden');
});

// Inicialização
initQrModal();

if (apiService.getToken()) {
    enableAdminMode();
} else if (new URLSearchParams(window.location.search).get('admin') === 'true') {
    adminAuthModal.classList.remove('hidden');
}

syncData();
pollingInterval = setInterval(syncData, 5000);
