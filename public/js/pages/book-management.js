// Book Management Page (Matching Figma BookManagement.tsx)
const BookManagementPage = {
    books: [],
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
                ${Components.renderNavbar('kelola-buku')}
                <main class="main-content">
                    <div class="page-header">
                        <div>
                            <h1 class="page-title">Kelola Buku</h1>
                            <p class="page-subtitle">Manajemen data buku, inventaris, status, dan koleksi perpustakaan</p>
                        </div>
                        <button class="btn btn-blue" onclick="BookManagementPage.openAddModal()">
                            <i class="fa-solid fa-plus"></i>
                            <span>Tambah Buku</span>
                        </button>
                    </div>

                    <div class="card">
                        <div class="card-content" style="padding-bottom: 0;">
                            <div class="filter-toolbar">
                                <div class="search-box">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" id="bm-search" class="form-input" placeholder="Cari judul, pengarang, kode atau ISBN...">
                                </div>

                                <div style="min-width: 160px;">
                                    <select id="bm-filter-category" class="form-select">
                                        <option value="ALL_CATEGORIES">Semua Kategori</option>
                                    </select>
                                </div>

                                <div style="min-width: 140px;">
                                    <select id="bm-filter-status" class="form-select">
                                        <option value="ALL_STATUS">Semua Status</option>
                                        <option value="Tersedia">Tersedia</option>
                                        <option value="Dipinjam">Dipinjam</option>
                                        <option value="Hilang">Hilang</option>
                                    </select>
                                </div>

                                <div style="min-width: 150px;">
                                    <select id="bm-filter-condition" class="form-select">
                                        <option value="ALL_CONDITIONS">Semua Kondisi</option>
                                        <option value="Baik">Baik</option>
                                        <option value="Rusak Ringan">Rusak Ringan</option>
                                        <option value="Rusak Berat">Rusak Berat</option>
                                        <option value="Hilang">Hilang</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Informasi Buku</th>
                                        <th>Kode / ISBN</th>
                                        <th>Kategori</th>
                                        <th>Lokasi Rak</th>
                                        <th>Stok</th>
                                        <th>Kondisi</th>
                                        <th>Status</th>
                                        <th style="text-align: right;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="bm-books-tbody">
                                    <tr><td colspan="8" style="text-align: center; padding: 3rem; color: #94a3b8;">Memuat data buku...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        `;

        this.setupEventListeners();
        await this.loadInitialData();
    },

    setupEventListeners() {
        const searchInput = document.getElementById('bm-search');
        const catSelect = document.getElementById('bm-filter-category');
        const statusSelect = document.getElementById('bm-filter-status');
        const condSelect = document.getElementById('bm-filter-condition');

        const filterHandler = () => this.filterAndRenderTable();

        searchInput.addEventListener('input', filterHandler);
        catSelect.addEventListener('change', filterHandler);
        statusSelect.addEventListener('change', filterHandler);
        condSelect.addEventListener('change', filterHandler);
    },

    async loadInitialData() {
        try {
            // Load Categories
            const catRes = await API.get('/categories');
            this.categories = catRes.data || [];
            
            const catSelect = document.getElementById('bm-filter-category');
            if (catSelect) {
                this.categories.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat.name;
                    opt.textContent = cat.name;
                    catSelect.appendChild(opt);
                });
            }

            // Load Books
            const res = await API.get('/books?limit=200');
            this.books = res.data || [];
            this.filterAndRenderTable();
        } catch (error) {
            console.error('Load books error:', error);
            Components.showToast('Gagal memuat data buku', 'error');
        }
    },

    filterAndRenderTable() {
        const query = document.getElementById('bm-search')?.value.toLowerCase().trim() || '';
        const selectedCat = document.getElementById('bm-filter-category')?.value || 'ALL_CATEGORIES';
        const selectedStatus = document.getElementById('bm-filter-status')?.value || 'ALL_STATUS';
        const selectedCond = document.getElementById('bm-filter-condition')?.value || 'ALL_CONDITIONS';

        const filtered = this.books.filter(book => {
            const matchesQuery = !query || 
                (book.judul && book.judul.toLowerCase().includes(query)) ||
                (book.pengarang && book.pengarang.toLowerCase().includes(query)) ||
                (book.kode_buku && book.kode_buku.toLowerCase().includes(query)) ||
                (book.isbn && book.isbn.toLowerCase().includes(query));

            const matchesCat = selectedCat === 'ALL_CATEGORIES' || book.genre === selectedCat;
            const matchesStatus = selectedStatus === 'ALL_STATUS' || book.status === selectedStatus;
            const matchesCond = selectedCond === 'ALL_CONDITIONS' || book.condition === selectedCond;

            return matchesQuery && matchesCat && matchesStatus && matchesCond;
        });

        const tbody = document.getElementById('bm-books-tbody');
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 3rem; color: #94a3b8;">Tidak ada buku yang sesuai dengan filter.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(book => `
            <tr>
                <td>
                    <div class="book-admin-cell">
                        ${book.cover ? `<img class="book-admin-thumb" src="${book.cover}" alt="Cover ${book.judul}">` : '<span class="book-admin-thumb book-admin-thumb-empty"><i class="fa-solid fa-book"></i></span>'}
                        <div><div style="font-weight: 600; color: #0f172a;">${book.judul}</div><div style="font-size: 0.8rem; color: #64748b;">${book.pengarang} • ${book.penerbit || '-'} (${book.tahun_terbit || '-'})</div></div>
                    </div>
                </td>
                <td>
                    <div style="font-weight: 500; font-family: monospace; font-size: 0.85rem;">${book.kode_buku || '-'}</div>
                    <div style="font-size: 0.75rem; color: #94a3b8;">${book.isbn || '-'}</div>
                </td>
                <td><span style="font-weight: 500; color: #334155;">${book.genre || '-'}</span></td>
                <td><span style="font-size: 0.85rem; color: #64748b;">${book.lokasi_rak || '-'}</span></td>
                <td><span style="font-weight: 600;">${book.stok}</span></td>
                <td>${Components.renderConditionBadge(book.condition || 'Baik')}</td>
                <td>${Components.renderStatusBadge(book.status || 'Tersedia')}</td>
                <td style="text-align: right; white-space: nowrap;">
                    <button class="btn btn-outline btn-sm" onclick="BookManagementPage.openEditModal(${book.id})" title="Edit">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-outline btn-sm" style="color: #dc2626;" onclick="BookManagementPage.confirmDelete(${book.id}, '${book.judul.replace(/'/g, "\\'")}')" title="Hapus">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    openAddModal() {
        const catOptions = this.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

        const body = `
            <form id="add-book-form">
                <div class="form-group">
                    <label class="form-label">Judul Buku *</label>
                    <input type="text" id="add-judul" class="form-input" required placeholder="Contoh: Algoritma dan Pemrograman">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Pengarang *</label>
                        <input type="text" id="add-pengarang" class="form-input" required placeholder="Nama pengarang">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Penerbit</label>
                        <input type="text" id="add-penerbit" class="form-input" placeholder="Nama penerbit">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Tahun Terbit</label>
                        <input type="number" id="add-tahun" class="form-input" value="${new Date().getFullYear()}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kode Buku</label>
                        <input type="text" id="add-kode" class="form-input" placeholder="Contoh: TEK-001">
                    </div>
                    <div class="form-group">
                        <label class="form-label">ISBN</label>
                        <input type="text" id="add-isbn" class="form-input" placeholder="978-xxx">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Kategori *</label>
                        <select id="add-genre" class="form-select" required>
                            ${catOptions || '<option value="Fiksi">Fiksi</option><option value="Teknologi">Teknologi</option><option value="Pendidikan">Pendidikan</option>'}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Jumlah Stok *</label>
                        <input type="number" id="add-stok" class="form-input" min="0" value="1" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Lokasi Rak</label>
                        <input type="text" id="add-rak" class="form-input" placeholder="Rak A1">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Kondisi</label>
                        <select id="add-condition" class="form-select">
                            <option value="Baik">Baik</option>
                            <option value="Rusak Ringan">Rusak Ringan</option>
                            <option value="Rusak Berat">Rusak Berat</option>
                            <option value="Hilang">Hilang</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select id="add-status" class="form-select">
                            <option value="Tersedia">Tersedia</option>
                            <option value="Dipinjam">Dipinjam</option>
                            <option value="Hilang">Hilang</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Deskripsi / Sinopsis</label>
                    <textarea id="add-deskripsi" class="form-textarea" rows="2" placeholder="Keterangan singkat tentang buku"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="add-cover">Foto cover buku</label>
                    <input type="file" id="add-cover" class="form-input" accept="image/jpeg,image/png,image/webp,image/gif">
                </div>
            </form>
        `;

        Components.showModal({
            title: 'Tambah Koleksi Buku Baru',
            body: body,
            saveText: 'Simpan Buku',
            onSave: async () => {
                const judul = document.getElementById('add-judul').value.trim();
                const pengarang = document.getElementById('add-pengarang').value.trim();
                const genre = document.getElementById('add-genre').value;
                const stok = document.getElementById('add-stok').value;

                if (!judul || !pengarang) {
                    Components.showToast('Judul dan pengarang wajib diisi', 'error');
                    return;
                }

                try {
                    const formData = new FormData();
                    const fields = {
                        judul,
                        pengarang,
                        penerbit: document.getElementById('add-penerbit').value.trim(),
                        tahun_terbit: document.getElementById('add-tahun').value,
                        kode_buku: document.getElementById('add-kode').value.trim(),
                        isbn: document.getElementById('add-isbn').value.trim(),
                        genre,
                        stok,
                        lokasi_rak: document.getElementById('add-rak').value.trim(),
                        condition: document.getElementById('add-condition').value,
                        status: document.getElementById('add-status').value,
                        deskripsi: document.getElementById('add-deskripsi').value.trim()
                    };
                    Object.entries(fields).forEach(([key, value]) => { if (value !== '') formData.append(key, value); });
                    const cover = document.getElementById('add-cover').files[0];
                    if (cover) formData.append('cover', cover);
                    await API.upload('/books', formData);

                    Components.closeModal();
                    Components.showToast('Buku berhasil ditambahkan', 'success');
                    await this.loadInitialData();
                } catch (err) {
                    Components.showToast(err.message || 'Gagal menambahkan buku', 'error');
                }
            }
        });
    },

    openEditModal(bookId) {
        const book = this.books.find(b => b.id == bookId);
        if (!book) return;

        const catOptions = this.categories.map(c => `
            <option value="${c.name}" ${c.name === book.genre ? 'selected' : ''}>${c.name}</option>
        `).join('');

        const body = `
            <form id="edit-book-form">
                <div class="form-group">
                    <label class="form-label">Judul Buku *</label>
                    <input type="text" id="edit-judul" class="form-input" value="${book.judul || ''}" required>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Pengarang *</label>
                        <input type="text" id="edit-pengarang" class="form-input" value="${book.pengarang || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Penerbit</label>
                        <input type="text" id="edit-penerbit" class="form-input" value="${book.penerbit || ''}">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Tahun Terbit</label>
                        <input type="number" id="edit-tahun" class="form-input" value="${book.tahun_terbit || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kode Buku</label>
                        <input type="text" id="edit-kode" class="form-input" value="${book.kode_buku || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">ISBN</label>
                        <input type="text" id="edit-isbn" class="form-input" value="${book.isbn || ''}">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Kategori *</label>
                        <select id="edit-genre" class="form-select" required>
                            ${catOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stok</label>
                        <input type="number" id="edit-stok" class="form-input" min="0" value="${book.stok}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Lokasi Rak</label>
                        <input type="text" id="edit-rak" class="form-input" value="${book.lokasi_rak || ''}">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Kondisi</label>
                        <select id="edit-condition" class="form-select">
                            <option value="Baik" ${book.condition === 'Baik' ? 'selected' : ''}>Baik</option>
                            <option value="Rusak Ringan" ${book.condition === 'Rusak Ringan' ? 'selected' : ''}>Rusak Ringan</option>
                            <option value="Rusak Berat" ${book.condition === 'Rusak Berat' ? 'selected' : ''}>Rusak Berat</option>
                            <option value="Hilang" ${book.condition === 'Hilang' ? 'selected' : ''}>Hilang</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select id="edit-status" class="form-select">
                            <option value="Tersedia" ${book.status === 'Tersedia' ? 'selected' : ''}>Tersedia</option>
                            <option value="Dipinjam" ${book.status === 'Dipinjam' ? 'selected' : ''}>Dipinjam</option>
                            <option value="Hilang" ${book.status === 'Hilang' ? 'selected' : ''}>Hilang</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Deskripsi / Sinopsis</label>
                    <textarea id="edit-deskripsi" class="form-textarea" rows="2">${book.deskripsi || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-cover">Ganti foto cover</label>
                    ${book.cover ? `<img class="book-cover-preview" src="${book.cover}" alt="Cover ${book.judul}">` : ''}
                    <input type="file" id="edit-cover" class="form-input" accept="image/jpeg,image/png,image/webp,image/gif">
                </div>
            </form>
        `;

        Components.showModal({
            title: 'Edit Data Buku',
            body: body,
            saveText: 'Simpan Perubahan',
            onSave: async () => {
                try {
                    const formData = new FormData();
                    const fields = {
                        judul: document.getElementById('edit-judul').value.trim(),
                        pengarang: document.getElementById('edit-pengarang').value.trim(),
                        penerbit: document.getElementById('edit-penerbit').value.trim(),
                        tahun_terbit: document.getElementById('edit-tahun').value,
                        kode_buku: document.getElementById('edit-kode').value.trim(),
                        isbn: document.getElementById('edit-isbn').value.trim(),
                        genre: document.getElementById('edit-genre').value,
                        stok: document.getElementById('edit-stok').value,
                        lokasi_rak: document.getElementById('edit-rak').value.trim(),
                        condition: document.getElementById('edit-condition').value,
                        status: document.getElementById('edit-status').value,
                        deskripsi: document.getElementById('edit-deskripsi').value.trim()
                    };
                    Object.entries(fields).forEach(([key, value]) => { if (value !== '') formData.append(key, value); });
                    const cover = document.getElementById('edit-cover').files[0];
                    if (cover) formData.append('cover', cover);
                    await API.upload(`/books/${bookId}`, formData, 'PUT');

                    Components.closeModal();
                    Components.showToast('Data buku berhasil diperbarui', 'success');
                    await this.loadInitialData();
                } catch (err) {
                    Components.showToast(err.message || 'Gagal memperbarui buku', 'error');
                }
            }
        });
    },

    confirmDelete(bookId, title) {
        Components.showModal({
            title: 'Konfirmasi Hapus Buku',
            body: `<p style="color: #475569;">Apakah Anda yakin ingin menghapus buku <strong>"${title}"</strong> dari sistem?</p>`,
            saveText: 'Ya, Hapus Buku',
            onSave: async () => {
                try {
                    await API.delete(`/books/${bookId}`);
                    Components.closeModal();
                    Components.showToast('Buku berhasil dihapus', 'success');
                    await this.loadInitialData();
                } catch (err) {
                    Components.showToast(err.message || 'Gagal menghapus buku', 'error');
                }
            }
        });
    }
};

