// Login Page (Matching Figma Screen)
const LoginPage = {
    render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="login-wrapper">
                <div class="login-card">
                    <div class="login-header">
                        <div class="login-logo">
                            <img src="img/logo_smp-informatika-bina-generasi.png" alt="Logo SMP Informatika Bina Generasi" class="login-logo-img">
                        </div>
                        <h1 class="login-title">SMP INFORMATIKA BINA GENERASI</h1>
                        <p class="login-subtitle">Masuk untuk mengelola data buku perpustakaan</p>
                    </div>

                    <div id="login-alert" style="display: none; margin-bottom: 1rem; padding: 0.75rem 1rem; background: #fee2e2; border: 1px solid #fecaca; color: #b91c1c; border-radius: var(--radius); font-size: 0.85rem;"></div>

                    <form id="login-form" class="login-form">
                        <div class="form-group">
                            <label class="form-label" for="login-username">Username</label>
                            <input type="text" id="login-username" class="form-input" placeholder="Masukkan username" required autofocus>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="login-password">Password</label>
                            <input type="password" id="login-password" class="form-input" placeholder="Masukkan password" required>
                        </div>

                        <button type="submit" id="btn-submit-login" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem; padding: 0.75rem;">
                            Masuk
                        </button>
                    </form>
                </div>
            </div>
        `;

        Components.setupPasswordToggles(app);
        document.getElementById('login-form').addEventListener('submit', this.handleLogin);
    },

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('btn-submit-login');
        const alertBox = document.getElementById('login-alert');

        if (!username || !password) return;

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memproses...';
        alertBox.style.display = 'none';

        try {
            await Auth.login(username, password);
            Components.showToast('Login berhasil! Selamat datang.', 'success');
            window.location.hash = Auth.getUser()?.is_first_login ? '#lengkapi-akun' : '#dashboard';
        } catch (error) {
            btn.disabled = false;
            btn.textContent = 'Masuk';
            alertBox.textContent = error.message || 'Username atau password salah. Silakan coba lagi.';
            alertBox.style.display = 'block';
        }
    }
};

