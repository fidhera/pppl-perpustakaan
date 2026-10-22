// Category Management Page (Matching Figma CategoryManagement.tsx)
const CategoryManagementPage = {
    categories: [],

    async render() {
        const user = Auth.getUser();
        if (user.role !== 'admin') {
            window.location.hash = '#dashboard';
            return;
        }

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="app-container">
                ${Components.renderNavbar('kategori')}
                <main class="main-content">
                    <div class="page-header">
                        <div>
                            <h1 class="page-title">Kategori Buku</h1>
                            <p class="page-subtitle">Kelola klasifikasi dan kategori koleksi buku perpustakaan</p>
                        </div>
                        <button class="btn btn-blue" onclick="CategoryManagementPage.openAddModal()">
                            <i class="fa-solid fa-plus"></i>
                            <span>Tambah Kategori</span>
                        </button>
                    </div>

                    <div class="card">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Kode</th>
                                        <th>Nama Kategori</th>
                                        <th>Deskripsi</th>
                                        <th>Jumlah Buku</th>
                                        <th>Tanggal Dibuat</th>
                                        <th style="text-align: right;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="cat-table-tbody">
                                    <tr><td colspan="6" style="text-align: center; padding: 3rem; color: #94a3b8;">Memuat data kategori...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        `;

        await this.loadCategories();
    },

    async loadCategories() {
        try {
            const res = await API.get('/categories');
            this.categories = res.data || [];
            this.renderTable();
        } catch (error) {
            console.error('Load categories error:', error);
            Components.showToast('Gagal memuat kategori', 'error');
        }
    },

    renderTable() {
        const tbody = document.getElementById('cat-table-tbody');
        if (!tbody) return;

        if (this.categories.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 3rem; color: #94a3b8;">Belum ada data kategori.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.categories.map(cat => `
            <tr>
                <td><span style="font-family: monospace; font-weight: 600; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 4px;">${cat.code}</span></td>
                <td><div style="font-weight: 600; color: #0f172a;">${cat.name}</div></td>
                <td><span style="color: #64748b; font-size: 0.85rem;">${cat.description || '-'}</span></td>
                <td>
                    <span class="badge" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">
                        ${cat.bookCount || 0} Buku
                    </span>
                </td>
                <td><span style="font-size: 0.85rem; color: #64748b;">${Components.formatDate(cat.created_at)}</span></td>
                <td style="text-align: right; white-space: nowrap;">
                    <button class="btn btn-outline btn-sm" onclick="CategoryManagementPage.openEditModal(${cat.id})" title="Edit">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-outline btn-sm" style="color: #dc2626;" onclick="CategoryManagementPage.confirmDelete(${cat.id}, '${cat.name.replace(/'/g, "\\'")}')" title="Hapus">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    openAddModal() {
        const body = `
            <form id="add-cat-form">
                <div class="form-group">
                    <label class="form-label">Kode Kategori *</label>
                    <input type="text" id="add-cat-code" class="form-input" placeholder="Contoh: FIK" required style="text-transform: uppercase;">
                </div>
                <div class="form-group">
                    <label class="form-label">Nama Kategori *</label>
                    <input type="text" id="add-cat-name" class="form-input" placeholder="Contoh: Fiksi" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Deskripsi</label>
                    <textarea id="add-cat-desc" class="form-textarea" rows="3" placeholder="Keterangan kategori"></textarea>
                </div>
            </form>
        `;

        Components.showModal({
            title: 'Tambah Kategori Buku',
            body: body,
            saveText: 'Simpan Kategori',
            onSave: async () => {
                const code = document.getElementById('add-cat-code').value.trim().toUpperCase();
                const name = document.getElementById('add-cat-name').value.trim();
                const description = document.getElementById('add-cat-desc').value.trim();

                if (!code || !name) {
                    Components.showToast('Kode dan nama kategori wajib diisi', 'error');
                    return;
                }

                try {
                    await API.post('/categories', { code, name, description });
                    Components.closeModal();
                    Components.showToast('Kategori berhasil ditambahkan', 'success');
                    await this.loadCategories();
                } catch (err) {
                    Components.showToast(err.message || 'Gagal menambahkan kategori', 'error');
                }
            }
        });
    },

    openEditModal(id) {
        const cat = this.categories.find(c => c.id == id);
        if (!cat) return;

        const body = `
            <form id="edit-cat-form">
                <div class="form-group">
                    <label class="form-label">Kode Kategori *</label>
                    <input type="text" id="edit-cat-code" class="form-input" value="${cat.code || ''}" required style="text-transform: uppercase;">
                </div>
                <div class="form-group">
                    <label class="form-label">Nama Kategori *</label>
                    <input type="text" id="edit-cat-name" class="form-input" value="${cat.name || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Deskripsi</label>
                    <textarea id="edit-cat-desc" class="form-textarea" rows="3">${cat.description || ''}</textarea>
                </div>
            </form>
        `;

        Components.showModal({
            title: 'Edit Kategori Buku',
            body: body,
            saveText: 'Simpan Perubahan',
            onSave: async () => {
                const code = document.getElementById('edit-cat-code').value.trim().toUpperCase();
                const name = document.getElementById('edit-cat-name').value.trim();
                const description = document.getElementById('edit-cat-desc').value.trim();

                try {
                    await API.put(`/categories/${id}`, { code, name, description });
                    Components.closeModal();
                    Components.showToast('Kategori berhasil diperbarui', 'success');
                    await this.loadCategories();
                } catch (err) {
                    Components.showToast(err.message || 'Gagal memperbarui kategori', 'error');
                }
            }
        });
    },

    confirmDelete(id, name) {
        Components.showModal({
            title: 'Hapus Kategori',
            body: `<p style="color: #475569;">Apakah Anda yakin ingin menghapus kategori <strong>"${name}"</strong>?</p>`,
            saveText: 'Ya, Hapus',
            onSave: async () => {
                try {
                    await API.delete(`/categories/${id}`);
                    Components.closeModal();
                    Components.showToast('Kategori berhasil dihapus', 'success');
                    await this.loadCategories();
                } catch (err) {
                    Components.showToast(err.message || 'Gagal menghapus kategori', 'error');
                }
            }
        });
    }
};
