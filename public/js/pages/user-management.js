// User Management Page (Matching Figma UserManagement.tsx)
const UserManagementPage = {
    users: [],

    async render() {
        const currentUser = Auth.getUser();
        if (currentUser.role !== 'admin') {
            window.location.hash = '#dashboard';
            return;
        }

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="app-container">
                ${Components.renderNavbar('manajemen-user')}
                <main class="main-content">
                    <div class="page-header">
                        <div>
                            <h1 class="page-title">Manajemen User</h1>
                            <p class="page-subtitle">Kelola akun administrator, pimpinan perpustakaan, dan siswa anggota</p>
                        </div>
                        <button class="btn btn-blue" onclick="UserManagementPage.openAddModal()">
                            <i class="fa-solid fa-user-plus"></i>
                            <span>Tambah User</span>
                        </button>
                    </div>

                    <div class="card">
                        <div class="card-content" style="padding-bottom: 0;">
                            <div class="filter-toolbar">
                                <div class="search-box">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" id="um-search" class="form-input" placeholder="Cari nama, username, email atau NIS...">
                                </div>
                                <div style="min-width: 170px;">
                                    <select id="um-role-filter" class="form-select">
                                        <option value="">Semua Role</option>
                                        <option value="admin">Administrator</option>
                                        <option value="pimpinan">Pimpinan</option>
                                        <option value="siswa">Siswa</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Pengguna</th>
                                        <th>Role</th>
                                        <th>Email</th>
                                        <th>Kelas / Bagian</th>
                                        <th>Status</th>
                                        <th>Terdaftar</th>
                                        <th style="text-align: right;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="um-table-tbody">
                                    <tr><td colspan="7" style="text-align: center; padding: 3rem; color: #94a3b8;">Memuat data user...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        `;

        this.setupEventListeners();
        await this.loadUsers();
    },

    setupEventListeners() {
        const search = document.getElementById('um-search');
        const role = document.getElementById('um-role-filter');
        const handler = () => this.filterAndRender();
        search.addEventListener('input', handler);
        role.addEventListener('change', handler);
    },

    async loadUsers() {
        try {
            const res = await API.get('/users?limit=200');
            this.users = res.data?.users || [];
            this.filterAndRender();
        } catch (error) {
            console.error('Load users error:', error);
            Components.showToast('Gagal memuat pengguna', 'error');
        }
    },

    filterAndRender() {
        const query = document.getElementById('um-search')?.value.toLowerCase().trim() || '';
        const role = document.getElementById('um-role-filter')?.value || '';

        const filtered = this.users.filter(u => {
            const matchesQuery = !query ||
                (u.nama && u.nama.toLowerCase().includes(query)) ||
                (u.username && u.username.toLowerCase().includes(query)) ||
                (u.nis && u.nis.toLowerCase().includes(query)) ||
                (u.email && u.email.toLowerCase().includes(query));

            const matchesRole = !role || u.role === role;
            return matchesQuery && matchesRole;
        });

        const tbody = document.getElementById('um-table-tbody');
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 3rem; color: #94a3b8;">Tidak ada user yang sesuai.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(u => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background: #e0e7ff; color: #4338ca; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">
                            ${(u.nama || u.username || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #0f172a;">${u.nama}</div>
                            <div style="font-size: 0.775rem; color: #64748b;">@${u.username || u.nis}</div>
                        </div>
                    </div>
                </td>
                <td>${Components.renderRoleBadge(u.role)}</td>
                <td><span style="font-size: 0.85rem; color: #475569;">${u.email || '-'}</span></td>
                <td><span style="font-size: 0.85rem; color: #64748b;">${u.kelas || '-'}</span></td>
                <td>
                    <span class="badge ${u.is_active ? 'badge-baik' : 'badge-hilang'}">
                        ${u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                </td>
                <td><span style="font-size: 0.85rem; color: #64748b;">${Components.formatDate(u.created_at)}</span></td>
                <td style="text-align: right; white-space: nowrap;">
                    <button class="btn btn-outline btn-sm" onclick="UserManagementPage.openEditModal(${u.id})" title="Edit">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="UserManagementPage.resetPassword(${u.id}, '${u.nama}')" title="Reset Password">
                        <i class="fa-solid fa-key"></i>
                    </button>
                    <button class="btn btn-outline btn-sm" style="color: #dc2626;" onclick="UserManagementPage.confirmDelete(${u.id}, '${u.nama}')" title="Hapus">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    openAddModal() {
        const body = `
            <form id="add-user-form">
                <div class="form-group">
                    <label class="form-label">Username *</label>
                    <input type="text" id="add-u-username" class="form-input" required placeholder="Contoh: pimpinan2">
                </div>
                <div class="form-group">
                    <label class="form-label">Nama Lengkap *</label>
                    <input type="text" id="add-u-name" class="form-input" required placeholder="Nama user">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" id="add-u-email" class="form-input" placeholder="email@perpustakaan.com">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Role Akses *</label>
                        <select id="add-u-role" class="form-select" required>
                            <option value="siswa">Siswa (Anggota)</option>
                            <option value="pimpinan">Pimpinan</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Kelas / Bagian</label>
                        <input type="text" id="add-u-kelas" class="form-input" placeholder="Contoh: XII-IPA-1 atau Staff">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password Awal *</label>
                        <input type="password" id="add-u-password" class="form-input" required placeholder="Minimal 6 karakter">
                    </div>
                </div>
            </form>
        `;

        Components.showModal({
            title: 'Tambah Pengguna Baru',
            body: body,
            saveText: 'Simpan User',
            onSave: async () => {
                const username = document.getElementById('add-u-username').value.trim();
                const name = document.getElementById('add-u-name').value.trim();
                const email = document.getElementById('add-u-email').value.trim();
                const role = document.getElementById('add-u-role').value;
                const kelas = document.getElementById('add-u-kelas').value.trim();
                const password = document.getElementById('add-u-password').value;

                if (!username || !name || !password) {
                    Components.showToast('Username, nama dan password wajib diisi', 'error');
                    return;
                }

                try {
                    await API.post('/users', { username, name, email, role, kelas, password });
                    Components.closeModal();
                    Components.showToast('User berhasil ditambahkan', 'success');
                    await this.loadUsers();
                } catch (err) {
                    Components.showToast(err.message || 'Gagal menambahkan user', 'error');
                }
            }
        });
    },

    openEditModal(id) {
        const u = this.users.find(x => x.id == id);
        if (!u) return;

        const body = `
            <form id="edit-user-form">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" id="edit-u-username" class="form-input" value="${u.username || u.nis || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Nama Lengkap *</label>
                    <input type="text" id="edit-u-name" class="form-input" value="${u.nama || ''}" required>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" id="edit-u-email" class="form-input" value="${u.email || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Role Akses</label>
                        <select id="edit-u-role" class="form-select">
                            <option value="siswa" ${u.role === 'siswa' ? 'selected' : ''}>Siswa (Anggota)</option>
                            <option value="pimpinan" ${u.role === 'pimpinan' ? 'selected' : ''}>Pimpinan</option>
                            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrator</option>
                        </select>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Kelas / Bagian</label>
                        <input type="text" id="edit-u-kelas" class="form-input" value="${u.kelas || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status Akun</label>
                        <select id="edit-u-active" class="form-select">
                            <option value="1" ${u.is_active ? 'selected' : ''}>Aktif</option>
                            <option value="0" ${!u.is_active ? 'selected' : ''}>Nonaktif</option>
                        </select>
                    </div>
                </div>
            </form>
        `;

        Components.showModal({
            title: 'Edit Data Pengguna',
            body: body,
            saveText: 'Simpan Perubahan',
            onSave: async () => {
                const username = document.getElementById('edit-u-username').value.trim();
                const name = document.getElementById('edit-u-name').value.trim();
                const email = document.getElementById('edit-u-email').value.trim();
                const role = document.getElementById('edit-u-role').value;
                const kelas = document.getElementById('edit-u-kelas').value.trim();
                const is_active = document.getElementById('edit-u-active').value === '1';

                try {
                    await API.put(`/users/${id}`, { username, name, email, role, kelas, is_active });
                    Components.closeModal();
                    Components.showToast('Data user berhasil diperbarui', 'success');
                    await this.loadUsers();
                } catch (err) {
                    Components.showToast(err.message || 'Gagal memperbarui user', 'error');
                }
            }
        });
    },

    resetPassword(id, name) {
        const newPass = prompt(`Masukkan password baru untuk "${name}":`, '123456');
        if (!newPass) return;

        API.put(`/users/${id}/reset-password`, { password: newPass })
            .then(() => Components.showToast(`Password ${name} berhasil diubah`, 'success'))
            .catch(err => Components.showToast(err.message || 'Gagal mereset password', 'error'));
    },

    confirmDelete(id, name) {
        Components.showModal({
            title: 'Hapus User',
            body: `<p style="color: #475569;">Apakah Anda yakin ingin menghapus akun pengguna <strong>"${name}"</strong>?</p>`,
            saveText: 'Ya, Hapus',
            onSave: async () => {
                try {
                    await API.delete(`/users/${id}`);
                    Components.closeModal();
                    Components.showToast('User berhasil dihapus', 'success');
                    await this.loadUsers();
                } catch (err) {
                    Components.showToast(err.message || 'Gagal menghapus user', 'error');
                }
            }
        });
    }
};

