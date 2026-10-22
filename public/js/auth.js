// Auth State Management
const Auth = {
    isLoggedIn() {
        return !!API.getToken() && !!API.getUser();
    },

    getUser() {
        return API.getUser();
    },

    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    },

    isPimpinan() {
        const user = this.getUser();
        return user && user.role === 'pimpinan';
    },

    isSiswa() {
        const user = this.getUser();
        return user && user.role === 'siswa';
    },

    isStaff() {
        return this.isAdmin() || this.isPimpinan();
    },

    async login(username, password) {
        const data = await API.post('/auth/login', { username, password, nis: username });
        API.setToken(data.data.token);
        API.setUser(data.data.user);
        return data;
    },

    async register(userData) {
        const data = await API.post('/auth/register', userData);
        API.setToken(data.data.token);
        API.setUser(data.data.user);
        return data;
    },

    logout() {
        API.removeToken();
        API.setUser(null);
        window.location.hash = '#login';
    },

    async refreshProfile() {
        try {
            const data = await API.get('/auth/profile');
            API.setUser(data.data);
            return data.data;
        } catch (e) {
            return null;
        }
    }
};
