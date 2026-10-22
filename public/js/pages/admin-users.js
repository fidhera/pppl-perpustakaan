// Admin Users Management Page
async function renderAdminUsersPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        ${Components.header()}
        <main class="main-content">
            <div class="container">
                <div class="page-header">
                    <div>
                        <h1 class="page-title"><i class="fas fa-users-cog"></i> Manajemen Pengguna & Siswa</h1>
                        <p class="page-subtitle">Daftar akun siswa, aktivasi akun, dan reset kata sandi</p>
                    </div>
                </div>

                <div class="filter-card">
                    <div class="filter-grid">
                        <div class="form-group mb-0">
                            <input type="text" id="admin-user-search" class="form-input" placeholder="Cari berdasarkan NIS atau Nama siswa...">
                        </div>
                    </div>
                </div>

                <div id="admin-users-table" class="mt-4">
                    ${Components.loadingSpinner()}
                </div>
            </div>
        </main>
        ${Components.footer()}
    `;

    Components.initHeaderEvents();

    let users = [];

    async function loadUsers() {
        const tableContainer = document.getElementById('admin-users-table');
        const query = document.getElementById('admin-user-search').value.trim();

        tableContainer.innerHTML = Components.loadingSpinner();

        try {
            const res = await api.get(`/users?search=${encodeURIComponent(query)}`);
            if (res.success && res.data) {
                users = Array.isArray(res.data) ? res.data : (res.data.users || []);
                renderTable(users);
            }
        } catch (e) {
            tableContainer.innerHTML = Components.emptyState('fas fa-exclamation-triangle', 'Gagal Memuat Pengguna', e.message);
        }
    }

    function renderTable(userList) {
        const tableContainer = document.getElementById('admin-users-table');

        if (userList.length === 0) {
            tableContainer.innerHTML = Components.emptyState('fas fa-users', 'Tidak Ada Pengguna Ditemukan');
            return;
        }

        tableContainer.innerHTML = `
            <div class="table-responsive card">
                <table class="table">
                    <thead>
                        <tr>
                            <th>NIS</th>
                            <th>Nama Siswa</th>
                            <th>Kelas</th>
                            <th>Role</th>
                            <th>Status Akun</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${userList.map(u => `
                            <tr>
                                <td><strong>${u.nis}</strong></td>
                                <td>${u.nama}</td>
                                <td>${u.kelas || '-'}</td>
                                <td><span class="badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}">${u.role}</span></td>
                                <td>
                                    <span class="badge ${u.is_active ? 'badge-success' : 'badge-danger'}">
                                        ${u.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td>
                                    ${u.role !== 'admin' ? `
                                        <button class="btn btn-warning btn-sm reset-btn mr-1" data-id="${u.id}" data-name="${u.nama}" title="Reset Password">
                                            <i class="fas fa-key"></i> Reset
                                        </button>
                                        <button class="btn ${u.is_active ? 'btn-danger' : 'btn-success'} btn-sm toggle-btn" data-id="${u.id}" data-active="${u.is_active}">
                                            ${u.is_active ? '<i class="fas fa-ban"></i> Blokir' : '<i class="fas fa-check"></i> Aktifkan'}
                                        </button>
                                    ` : '<span class="text-muted small">Admin Utama</span>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        tableContainer.querySelectorAll('.reset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const newPass = prompt(`Masukkan password baru untuk ${btn.dataset.name}:`, 'siswa123');
                if (newPass) {
                    api.put(`/users/${btn.dataset.id}/reset-password`, { new_password: newPass })
                        .then(() => Components.toast('Password berhasil direset', 'success'))
                        .catch(err => Components.toast(err.message, 'error'));
                }
            });
        });

        tableContainer.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const isCurrentlyActive = btn.dataset.active === 'true';
                try {
                    await api.put(`/users/${btn.dataset.id}/status`, { is_active: !isCurrentlyActive });
                    Components.toast('Status akun diperbarui', 'success');
                    loadUsers();
                } catch (err) {
                    Components.toast(err.message, 'error');
                }
            });
        });
    }

    let searchTimer;
    document.getElementById('admin-user-search').addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(loadUsers, 400);
    });

    loadUsers();
}
