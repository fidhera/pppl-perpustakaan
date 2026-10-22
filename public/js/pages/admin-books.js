// Admin Books Management Page
async function renderAdminBooksPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        ${Components.header()}
        <main class="main-content">
            <div class="container">
                <div class="page-header">
                    <div>
                        <h1 class="page-title"><i class="fas fa-books"></i> Manajemen Buku</h1>
                        <p class="page-subtitle">Tambah buku baru, update stok, kelola cover dan data katalog</p>
                    </div>
                    <button class="btn btn-primary" id="btn-add-book">
                        <i class="fas fa-plus"></i> Tambah Buku Baru
                    </button>
                </div>

                <div class="filter-card">
                    <div class="filter-grid">
                        <div class="form-group mb-0">
                            <input type="text" id="admin-book-search" class="form-input" placeholder="Cari judul, pengarang, atau ISBN...">
                        </div>
                    </div>
                </div>

                <div id="admin-books-table" class="mt-4">
                    ${Components.loadingSpinner()}
                </div>
            </div>
        </main>
        ${Components.footer()}
    `;

    Components.initHeaderEvents();

    let books = [];

    async function loadBooks() {
        const tableContainer = document.getElementById('admin-books-table');
        const query = document.getElementById('admin-book-search').value.trim();

        tableContainer.innerHTML = Components.loadingSpinner();

        try {
            const res = await api.get(`/books?limit=100&search=${encodeURIComponent(query)}`);
            if (res.success && res.data) {
                books = Array.isArray(res.data) ? res.data : (res.data.books || []);
                renderTable(books);
            } else {
                renderTable([]);
            }
        } catch (e) {
            tableContainer.innerHTML = Components.emptyState('fas fa-exclamation-triangle', 'Gagal Memuat Buku', e.message);
        }
    }

    function renderTable(bookList) {
        const tableContainer = document.getElementById('admin-books-table');

        if (bookList.length === 0) {
            tableContainer.innerHTML = Components.emptyState('fas fa-book-open', 'Belum Ada Buku', 'Klik tombol Tambah Buku Baru untuk memulai.');
            return;
        }

        tableContainer.innerHTML = `
            <div class="table-responsive card">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Cover</th>
                            <th>Judul & Info</th>
                            <th>Kategori</th>
                            <th>Stok</th>
                            <th>Rak</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookList.map(b => `
                            <tr>
                                <td style="width: 60px;">
                                    <img src="${b.foto_cover ? `/uploads/${b.foto_cover}` : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=100'}" class="table-thumb" alt="${b.judul}" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=100'">
                                </td>
                                <td>
                                    <strong>${b.judul}</strong>
                                    <div class="text-muted small">${b.pengarang} (${b.tahun_terbit || '-'})</div>
                                </td>
                                <td><span class="badge badge-info">${b.genre || 'Umum'}</span></td>
                                <td>
                                    <span class="badge ${b.stok > 0 ? 'badge-success' : 'badge-danger'}">
                                        ${b.stok}
                                    </span>
                                </td>
                                <td><strong>${b.lokasi_rak || '-'}</strong></td>
                                <td>
                                    <button class="btn btn-secondary btn-sm edit-btn mr-1" data-id="${b.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm del-btn" data-id="${b.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        tableContainer.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const book = books.find(x => x.id == btn.dataset.id);
                if (book) openBookModal(book);
            });
        });

        tableContainer.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Hapus buku ini dari sistem?')) {
                    try {
                        await api.delete(`/books/${btn.dataset.id}`);
                        Components.toast('Buku berhasil dihapus', 'success');
                        loadBooks();
                    } catch (err) {
                        Components.toast(err.message || 'Gagal menghapus', 'error');
                    }
                }
            });
        });
    }

    function openBookModal(book = null) {
        const isEdit = !!book;
        Components.modal({
            title: isEdit ? 'Edit Data Buku' : 'Tambah Buku Baru',
            content: `
                <form id="book-form">
                    <div class="form-group">
                        <label class="form-label">Judul Buku *</label>
                        <input type="text" id="b-judul" class="form-input" value="${book ? book.judul : ''}" required>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Pengarang *</label>
                            <input type="text" id="b-pengarang" class="form-input" value="${book ? book.pengarang : ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Penerbit</label>
                            <input type="text" id="b-penerbit" class="form-input" value="${book && book.penerbit ? book.penerbit : ''}">
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Genre / Kategori *</label>
                            <input type="text" id="b-genre" class="form-input" value="${book ? book.genre : ''}" placeholder="Novel, Sejarah, Sains, dll" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tahun Terbit</label>
                            <input type="number" id="b-tahun" class="form-input" value="${book && book.tahun_terbit ? book.tahun_terbit : new Date().getFullYear()}">
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Jumlah Stok *</label>
                            <input type="number" id="b-stok" class="form-input" min="0" value="${book ? book.stok : 1}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Lokasi Rak *</label>
                            <input type="text" id="b-rak" class="form-input" value="${book ? book.lokasi_rak : 'A-01'}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Sinopsis / Deskripsi</label>
                        <textarea id="b-deskripsi" class="form-input" rows="3">${book && book.deskripsi ? book.deskripsi : ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Upload Foto Cover (Maks 5MB)</label>
                        <input type="file" id="b-cover" class="form-input" accept="image/*">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
                        <button type="submit" class="btn btn-primary" id="save-book-btn">
                            <i class="fas fa-save"></i> ${isEdit ? 'Simpan Perubahan' : 'Tambah Buku'}
                        </button>
                    </div>
                </form>
            `
        });

        document.getElementById('book-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('save-book-btn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

            const formData = new FormData();
            formData.append('judul', document.getElementById('b-judul').value.trim());
            formData.append('pengarang', document.getElementById('b-pengarang').value.trim());
            formData.append('penerbit', document.getElementById('b-penerbit').value.trim());
            formData.append('genre', document.getElementById('b-genre').value.trim());
            formData.append('tahun_terbit', document.getElementById('b-tahun').value);
            formData.append('stok', document.getElementById('b-stok').value);
            formData.append('lokasi_rak', document.getElementById('b-rak').value.trim());
            formData.append('deskripsi', document.getElementById('b-deskripsi').value.trim());

            const coverInput = document.getElementById('b-cover');
            if (coverInput.files[0]) {
                formData.append('cover', coverInput.files[0]);
            }

            try {
                if (isEdit) {
                    await api.upload(`/books/${book.id}`, formData, 'PUT');
                    Components.toast('Buku berhasil diperbarui', 'success');
                } else {
                    await api.upload('/books', formData, 'POST');
                    Components.toast('Buku baru berhasil ditambahkan', 'success');
                }
                Components.closeModal();
                loadBooks();
            } catch (err) {
                Components.toast(err.message || 'Gagal menyimpan buku', 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
            }
        });
    }

    document.getElementById('btn-add-book').addEventListener('click', () => openBookModal());

    let searchTimer;
    document.getElementById('admin-book-search').addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(loadBooks, 400);
    });

    loadBooks();
}
