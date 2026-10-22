// Register Page
function renderRegisterPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-brand">
                    <div class="auth-brand-icon"><i class="fas fa-user-plus"></i></div>
                    <h2>Daftar Akun Siswa</h2>
                    <p>Buat akun untuk mulai meminjam buku</p>
                </div>
                <form class="auth-form" id="register-form">
                    <div class="form-group">
                        <label class="form-label">NIS (Nomor Induk Siswa)</label>
                        <div class="form-input-wrapper">
                            <input type="text" class="form-input" id="reg-nis" placeholder="Contoh: 2024001" required>
                            <i class="fas fa-id-card"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nama Lengkap</label>
                        <div class="form-input-wrapper">
                            <input type="text" class="form-input" id="reg-nama" placeholder="Masukkan nama lengkap" required>
                            <i class="fas fa-user"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kelas</label>
                        <div class="form-input-wrapper">
                            <input type="text" class="form-input" id="reg-kelas" placeholder="Contoh: XII RPL 1" required>
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <div class="form-input-wrapper">
                            <input type="password" class="form-input" id="reg-password" placeholder="Minimal 6 karakter" required minlength="6">
                            <i class="fas fa-lock"></i>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg btn-block" id="reg-btn">
                        <i class="fas fa-user-plus"></i> Daftar
                    </button>
                </form>
                <div class="auth-footer">
                    Sudah punya akun? <a href="#/login">Masuk di sini</a>
                </div>
            </div>
        </div>
    `;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('reg-btn');
        const nis = document.getElementById('reg-nis').value.trim();
        const nama = document.getElementById('reg-nama').value.trim();
        const kelas = document.getElementById('reg-kelas').value.trim();
        const password = document.getElementById('reg-password').value;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendaftar...';

        try {
            await Auth.register({ nis, nama, kelas, password });
            Components.toast('Pendaftaran berhasil! Silakan masuk.', 'success');
            setTimeout(() => {
                window.location.hash = '#/login';
            }, 800);
        } catch (error) {
            Components.toast(error.message || 'Pendaftaran gagal', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-user-plus"></i> Daftar';
        }
    });
}
