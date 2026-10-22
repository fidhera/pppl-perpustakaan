const FirstLoginPage = {
    render() {
        const user = Auth.getUser();
        const app = document.getElementById('app');
        app.innerHTML = `
            <main class="first-login-page">
                <section class="first-login-panel">
                    <div class="first-login-mark"><i class="fa-solid fa-user-shield"></i></div>
                    <p class="eyebrow">AKTIVASI AKUN PERTAMA KALI</p>
                    <h1>Lengkapi Data Siswa</h1>
                    <p class="page-subtitle">Selamat datang di Perpustakaan! Karena ini adalah login pertama Anda dengan NISN, silakan lengkapi identitas diri dan ganti password default untuk keamanan akun.</p>
                    
                    <form id="first-login-form" class="first-login-form">
                        <div class="form-group">
                            <label class="form-label" for="first-username">
                                Username (NISN) <span style="color: #64748b; font-weight: normal;">(Tetap, Tidak Bisa Diubah)</span>
                            </label>
                            <div style="position: relative;">
                                <input id="first-username" class="form-input" style="background-color: #f1f5f9; cursor: not-allowed; font-weight: 600; padding-left: 2.25rem;" value="${user?.nis || user?.username || ''}" readonly aria-readonly="true">
                                <i class="fa-solid fa-lock" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #64748b;"></i>
                            </div>
                            <small style="color: #64748b; font-size: 0.775rem; margin-top: 0.25rem; display: block;">Username login Anda menggunakan NISN resmi dan dikunci demi verifikasi identitas.</small>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="first-name">Nama Lengkap *</label>
                            <input id="first-name" class="form-input" value="${user?.nama && user.nama !== 'Siswa Baru' ? user.nama : ''}" placeholder="Masukkan nama lengkap Anda" autocomplete="name" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="first-email">Email Aktif *</label>
                            <input id="first-email" type="email" class="form-input" value="${user?.email || ''}" placeholder="contoh: siswa@sekolah.sch.id" autocomplete="email" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="first-class">Kelas *</label>
                            <input id="first-class" class="form-input" value="${user?.kelas && user.kelas !== '-' ? user.kelas : ''}" placeholder="Contoh: XII IPA 1 atau XI RPL 2" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="first-current-password">Password Saat Ini *</label>
                            <input id="first-current-password" type="password" class="form-input" placeholder="Masukkan password saat login (siswa123)" autocomplete="current-password" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="first-new-password">Password Baru *</label>
                            <input id="first-new-password" type="password" class="form-input" minlength="6" placeholder="Minimal 6 karakter" autocomplete="new-password" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="first-confirm-password">Konfirmasi Password Baru *</label>
                            <input id="first-confirm-password" type="password" class="form-input" minlength="6" placeholder="Ulangi password baru Anda" autocomplete="new-password" required>
                        </div>
                        <button type="submit" class="btn btn-primary first-login-submit" id="first-login-submit" style="width: 100%; padding: 0.75rem; font-weight: 600;">
                            <i class="fa-solid fa-floppy-disk"></i> Simpan Data & Lanjutkan ke Dashboard
                        </button>
                    </form>
                </section>
            </main>
        `;
        Components.setupPasswordToggles(app);

        document.getElementById('first-login-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const newPassword = document.getElementById('first-new-password').value;
            const confirmPassword = document.getElementById('first-confirm-password').value;
            if (newPassword !== confirmPassword) {
                Components.showToast('Konfirmasi password baru tidak cocok.', 'error');
                return;
            }

            const button = document.getElementById('first-login-submit');
            button.disabled = true;
            try {
                const response = await API.put('/users/complete-profile', {
                    nama: document.getElementById('first-name').value.trim(),
                    email: document.getElementById('first-email').value.trim(),
                    kelas: document.getElementById('first-class').value.trim(),
                    current_password: document.getElementById('first-current-password').value,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                });
                API.setUser(response.data);
                Components.showToast('Akun berhasil dilengkapi.', 'success');
                window.location.hash = '#dashboard';
            } catch (error) {
                Components.showToast(error.message || 'Gagal menyimpan data akun.', 'error');
                button.disabled = false;
            }
        });
    }
};
