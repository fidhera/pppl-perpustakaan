// API Helper Module
const API = {
    baseURL: '/api',
    
    getToken() {
        return localStorage.getItem('token');
    },

    setToken(token) {
        localStorage.setItem('token', token);
    },

    removeToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {};
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: { ...headers, ...options.headers }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    this.removeToken();
                    if (window.location.hash !== '#/login') {
                        window.location.hash = '#/login';
                    }
                }
                throw { status: response.status, ...data };
            }

            return data;
        } catch (error) {
            if (error.status) throw error;
            throw { success: false, message: 'Gagal terhubung ke server.' };
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        const options = { method: 'POST' };
        if (body instanceof FormData) {
            options.body = body;
        } else {
            options.body = JSON.stringify(body);
        }
        return this.request(endpoint, options);
    },

    put(endpoint, body) {
        const options = { method: 'PUT' };
        if (body instanceof FormData) {
            options.body = body;
        } else {
            options.body = JSON.stringify(body);
        }
        return this.request(endpoint, options);
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    upload(endpoint, formData, method = 'POST') {
        return this.request(endpoint, {
            method: method,
            body: formData
        });
    }
};

const api = API;
window.api = API;
