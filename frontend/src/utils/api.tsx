const API_BASE_URL = 'http://localhost:8081/api';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const apiFetch = async (endpoint: string, options: FetchOptions = {}) => {
    const token = localStorage.getItem('kratos_token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('kratos_token');
        localStorage.removeItem('kratos_user');
        window.location.href = '/';
        throw new Error('Session expirée ou non autorisée');
    }

    return response;
};
