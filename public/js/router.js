// SPA Router for Website Pengelolaan Perpustakaan
const Router = {
    routes: {},
    currentRoute: null,

    // Normalize path: e.g. "/dashboard" -> "dashboard", "#layanan?q=dilan" -> "layanan"
    normalize(path) {
        const cleaned = path.replace(/^#?\/?/, '').replace(/\/$/, '');
        const routeName = cleaned.split('?')[0];
        return routeName || 'beranda';
    },

    getQueryParams() {
        const hash = window.location.hash || '';
        const queryPart = hash.includes('?') ? hash.substring(hash.indexOf('?') + 1) : (window.location.search ? window.location.search.substring(1) : '');
        const params = new URLSearchParams(queryPart);
        return Object.fromEntries(params.entries());
    },

    add(path, handler, options = {}) {
        const norm = this.normalize(path);
        this.routes[norm] = { handler, ...options };
    },

    navigate(path) {
        window.location.hash = path.startsWith('#') ? path : '#' + path;
    },

    getHash() {
        return this.normalize(window.location.hash);
    },

    async resolve() {
        // Clean up pathname if user opened /login#... or /... so it doesn't get stuck in pathname
        if (window.location.pathname && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            const rawPath = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
            if (!window.location.hash && rawPath) {
                window.location.hash = rawPath;
            }
            // Replace browser URL to clean format: /#...
            try {
                window.history.replaceState(null, '', '/' + (window.location.hash || ''));
            } catch (e) {
                // ignore
            }
        }

        let hash = this.getHash();

        // Public routes accessible without authentication
        const publicRoutes = ['beranda', 'layanan', 'login', 'register'];

        // Redirect if not logged in and accessing protected route
        if (!Auth.isLoggedIn()) {
            if (!publicRoutes.includes(hash)) {
                window.location.hash = 'login';
                return;
            }
        } else {
            const user = Auth.getUser();
            if (user?.role === 'siswa' && user.is_first_login && hash !== 'lengkapi-akun') {
                window.location.hash = 'lengkapi-akun';
                return;
            }
            if (user?.role === 'siswa' && !user.is_first_login && hash === 'lengkapi-akun') {
                window.location.hash = 'dashboard';
                return;
            }
            // Logged in user visiting login
            if (hash === 'login' || hash === 'register') {
                window.location.hash = 'dashboard';
                return;
            }
        }

        const route = this.routes[hash];

        if (!route) {
            // Default route
            window.location.hash = 'beranda';
            return;
        }

        this.currentRoute = hash;
        try {
            await route.handler();
            Components.setupPasswordToggles(document.getElementById('app'));
        } catch (err) {
            console.error('Route handler error:', err);
        }
    },

    init() {
        window.addEventListener('hashchange', () => this.resolve());
        this.resolve();
    }
};
