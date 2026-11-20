// Em produção, substitua pela URL do seu backend hospedado (ex: Render, Railway, VPS)
export const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://api-congresso-profecia.onrender.com/api';
