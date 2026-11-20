import { API_BASE_URL } from '../config/env.js';

const TOKEN_KEY = 'congresso_admin_jwt';

export const apiService = {
    getToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    },

    setToken(token) {
        sessionStorage.setItem(TOKEN_KEY, token);
    },

    clearToken() {
        sessionStorage.removeItem(TOKEN_KEY);
    },

    async getEventStatus() {
        const res = await fetch(`${API_BASE_URL}/public/status`);
        if (!res.ok) throw new Error('Falha ao obter status do evento');
        return res.json();
    },

    async submitQuestion(name, question) {
        const res = await fetch(`${API_BASE_URL}/public/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, question }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao enviar pergunta');
        return data;
    },

    async loginAdmin(password) {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Senha incorreta');
        this.setToken(data.token);
        return data;
    },

    async getQuestions() {
        const res = await fetch(`${API_BASE_URL}/admin/questions`, {
            headers: { Authorization: `Bearer ${this.getToken()}` },
        });
        if (res.status === 401) {
            this.clearToken();
            throw new Error('UNAUTHORIZED');
        }
        if (!res.ok) throw new Error('Erro ao carregar perguntas');
        return res.json();
    },

    async toggleEventStatus(isOpen) {
        const res = await fetch(`${API_BASE_URL}/admin/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.getToken()}`,
            },
            body: JSON.stringify({ isOpen }),
        });
        if (!res.ok) throw new Error('Erro ao alterar status');
        return res.json();
    },

    async updateQuestionAnswered(id, answered) {
        const res = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.getToken()}`,
            },
            body: JSON.stringify({ answered }),
        });
        if (!res.ok) throw new Error('Erro ao atualizar pergunta');
        return res.json();
    },

    async deleteQuestion(id) {
        const res = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${this.getToken()}` },
        });
        if (!res.ok) throw new Error('Erro ao excluir pergunta');
        return res.json();
    },
};