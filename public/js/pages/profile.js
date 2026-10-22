// User Profile Page (Matching Figma UserProfile.tsx)
const ProfilePage = {
    async render() {
        const user = Auth.getUser();
        if (!user) {
            window.location.hash = '#login';
            return;
        }

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="app-container">
                ${Components.renderNavbar('profil')}
                <main class="main-content">
                    <div class="page-header">
                        <div>
                            <h1 class="page-title">Profil Pengguna</h1>
                            <p class="page-subtitle">Kelola informasi data akun dan keamanan kata sandi Anda</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; align-items: start;">
                        <!-- Left: Info & Role Privilege Card -->
                        <div>
                            <div class="card" style="text-align: center; padding: 2rem 1.5rem;">
                                <div style="width: 5rem; height: 5rem; border-radius: 50%; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; margin: 0 auto 1rem;">
                                    ${(user.nama || user.username || 'U').substring(0, 2).toUpperCase()}
                                </div>
                                <h2 style="font-size: 1.25rem; font-weight: 700; color: #0f172a;">${user.nama || user.username}</h2>
                                <p style="font-size: 0.85rem; color: #64748b; margin-top: 0.15rem;">@${user.username || user.nis}</p>
                                <div style="margin: 0.75rem 0;">
                                    ${Components.renderRoleBadge(user.role)}
                                </div>

                                <div style="border-top: 1px solid var(--border); margin-top: 1.5rem; padding-top: 1.25rem; text-align: left; font-size: 0.85rem; color: #475569; display: flex; flex-direction: column; gap: 0.75rem;">
                                    <div><i class="fa-regular fa-envelope" style="width: 20px; color: #94a3b8;"></i> ${user.email || 'Email belum diatur'}</div>
                                    <div><i class="fa-solid fa-graduation-cap" style="width: 20px; color: #94a3b8;"></i> Kelas/Bagian: ${user.kelas || '-'}</div>
                                    <div><i class="fa-regular fa-calendar" style="width: 20px; color: #94a3b8;"></i> Terdaftar: ${Components.formatDate(user.created_at)}</div>
                                </div>
                            </div>

                            <!-- Role Info Box -->
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title" style="font-size: 1rem;"><i class="fa-solid fa-shield-halved" style="color: #2563eb; margin-right: 0.5rem;"></i> Hak Akses Role</h3>
                                </div>
                                <div class="card-content" style="font-size: 0.85rem; color: #475569; line-height: 1.6;">
                                    ${this.getRoleDescription(user.role)}
                                </div>
                            </div>
                        </div>

                        <!-- Right: Edit Forms -->
                        <div>
                            <!-- Edit Profile -->
                            <div class="card">
                                <div class="card-header">
                                    <h2 class="card-title">Perbarui Profil</h2>
                                        <p class="card-description">${user.role === 'siswa' ? 'Username siswa ditetapkan menggunakan NISN.' : 'Ubah nama pengguna dan informasi kontak akun Anda.'}</p>
                                </div>
                                <div class="card-content">
                                    <form id="profile-edit-form">
                                        <div class="form-group">
                                            <label class="form-label">Username</label>
                                                <input type="text" id="prof-username" class="form-input" value="${user.role === 'siswa' ? (user.nis || user.username || '') : (user.username || '')}" ${user.role === 'siswa' ? 'readonly aria-readonly="true"' : ''} required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Nama Lengkap</label>
                                            <input type="text" id="prof-name" class="form-input" value="${user.nama || ''}" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Email</label>
                                            <input type="email" id="prof-email" class="form-input" value="${user.email || ''}">
                                        </div>
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fa-solid fa-floppy-disk"></i> Simpan Profil
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <!-- Change Password -->
                            <div class="card">
                                <div class="card-header">
                                    <h2 class="card-title">Ganti Password</h2>
                                    <p class="card-description">Pastikan menggunakan kombinasi kata sandi yang aman</p>
                                </div>
                                <div class="card-content">
                                    <form id="profile-pass-form">
                                        <div class="form-group">
                                            <label class="form-label">Password Saat Ini</label>
                                            <input type="password" id="pass-old" class="form-input" required placeholder="Masukkan password lama">
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Password Baru</label>
                                            <input type="password" id="pass-new" class="form-input" required placeholder="Minimal 6 karakter">
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Konfirmasi Password Baru</label>
                                            <input type="password" id="pass-confirm" class="form-input" required placeholder="Ulangi password baru">
                                        </div>
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fa-solid fa-key"></i> Perbarui Password
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;

        this.setupFormHandlers();
    },

    getRoleDescription(role) {
        if (role === 'admin') {
            return `<strong>Administrator:</strong> Memiliki akses penuh terhadap seluruh pengelolaan data sistem, termasuk inventaris buku, kondisi fisik, kategori, sirkulasi peminjaman, serta manajemen hak akses pengguna.`;
        } else if (role === 'pimpinan') {
            return `<strong>Pimpinan:</strong> Memiliki wewenang untuk memantau ringkasan eksekutif melalui Dashboard, memonitor kondisi fisik buku, dan mengevaluasi serta mencetak Laporan resmi perpustakaan.`;
        } else {
            return `<strong>Siswa (Anggota):</strong> Dapat mencari katalog buku, meminjam buku secara digital, memeriksa batas waktu pengembalian, dan melihat riwayat denda peminjaman pribadi.`;
        }
    },

    setupFormHandlers() {
        document.getElementById('profile-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('prof-username').value.trim();
            const name = document.getElementById('prof-name').value.trim();
            const email = document.getElementById('prof-email').value.trim();

            try {
                const res = await API.put('/users/profile', { username, name, email });
                API.setUser(res.data);
                Components.showToast('Profil berhasil diperbarui!', 'success');
                this.render();
            } catch (err) {
                Components.showToast(err.message || 'Gagal memperbarui profil', 'error');
            }
        });

        document.getElementById('profile-pass-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const oldPassword = document.getElementById('pass-old').value;
            const newPassword = document.getElementById('pass-new').value;
            const confirmPassword = document.getElementById('pass-confirm').value;

            if (newPassword !== confirmPassword) {
                Components.showToast('Password baru dan konfirmasi tidak cocok!', 'error');
                return;
            }

            if (newPassword.length < 6) {
                Components.showToast('Password baru minimal 6 karakter!', 'error');
                return;
            }

            try {
                await API.put('/users/change-password', { oldPassword, newPassword });
                Components.showToast('Password berhasil diubah!', 'success');
                document.getElementById('pass-old').value = '';
                document.getElementById('pass-new').value = '';
                document.getElementById('pass-confirm').value = '';
            } catch (err) {
                Components.showToast(err.message || 'Gagal mengubah password', 'error');
            }
        });
    }
};
