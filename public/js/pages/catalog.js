// Catalog Page for Students (Katalog & Peminjaman Buku)
const CatalogPage = {
    books: [],
    categories: [],

    async render() {
        const user = Auth.getUser();
        const app = document.getElementById('app');

        app.innerHTML = `
            <div class="app-container">
                ${Components.renderNavbar('katalog')}
                <main class="main-content">
                    <div class="page-header">
                        <div>
                            <h1 class="page-title">Katalog Koleksi Buku</h1>
                            <p class="page-subtitle">Jelajahi buku pelajaran, literatur, novel, dan ajukan peminjaman secara mandiri</p>
                        </div>
                    </div>

                    <div class="card" style="margin-bottom: 1.5rem;">
                        <div class="card-content" style="padding: 1rem 1.25rem;">
                            <div class="filter-toolbar" style="margin-bottom: 0;">
                                <div class="search-box">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" id="cat-search" class="form-input" placeholder="Cari judul buku, pengarang, penerbit...">
                                </div>
                                <div style="min-width: 170px;">
                                    <select id="cat-genre" class="form-select">
                                        <option value="ALL">Semua Kategori</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="catalog-grid" class="book-cards-grid">
                        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #94a3b8;">
                            Memuat katalog buku...
                        </div>
                    </div>
                </main>
            </div>
        `;

        this.setupFilters();
        await this.loadCatalog();
    },

    setupFilters() {
        const search = document.getElementById('cat-search');
        const genre = document.getElementById('cat-genre');
        const handler = () => this.filterAndRender();

        search.addEventListener('input', handler);
        genre.addEventListener('change', handler);
    },

    async loadCatalog() {
        try {
            const [catRes, bookRes] = await Promise.all([
                API.get('/categories'),
                API.get('/books?limit=200')
            ]);

            this.categories = catRes.data || [];
            this.books = bookRes.data || [];

            const select = document.getElementById('cat-genre');
            if (select) {
                this.categories.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.name;
                    opt.textContent = c.name;
                    select.appendChild(opt);
                });
            }

            this.filterAndRender();
        } catch (error) {
            console.error('Catalog load error:', error);
            Components.showToast('Gagal memuat katalog buku', 'error');
        }
    },

    filterAndRender() {
        const query = document.getElementById('cat-search')?.value.toLowerCase().trim() || '';
        const selectedGenre = document.getElementById('cat-genre')?.value || 'ALL';

        const filtered = this.books.filter(b => {
            const matchesQuery = !query ||
                (b.judul && b.judul.toLowerCase().includes(query)) ||
                (b.pengarang && b.pengarang.toLowerCase().includes(query)) ||
                (b.penerbit && b.penerbit.toLowerCase().includes(query));

            const matchesGenre = selectedGenre === 'ALL' || b.genre === selectedGenre;
            return matchesQuery && matchesGenre;
        });

        const container = document.getElementById('catalog-grid');
        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #94a3b8;">Tidak ada buku yang sesuai dengan pencarian.</div>`;
            return;
        }

        container.innerHTML = filtered.map(b => {
            const isAvailable = b.stok > 0 && b.status === 'Tersedia';

            return `
                <div class="book-card">
                    <div class="book-card-header">
                        ${b.cover ? `<img src="${b.cover}" alt="Cover ${b.judul}" loading="lazy">` : '<i class="fa-solid fa-book-bookmark"></i>'}
                    </div>
                    <div class="book-card-body">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span class="badge" style="background: #f1f5f9; color: #475569;">${b.genre}</span>
                            ${Components.renderConditionBadge(b.condition || 'Baik')}
                        </div>

                        <h3 class="book-card-title">${b.judul}</h3>
                        <div class="book-card-author">Karya: ${b.pengarang}</div>

                        <div class="book-card-meta">
                            <div><i class="fa-solid fa-layer-group" style="width: 16px;"></i> Stok: <strong>${b.stok} eksemplar</strong></div>
                            <div><i class="fa-solid fa-map-pin" style="width: 16px;"></i> Lokasi: ${b.lokasi_rak || 'Rak Umum'}</div>
                            <div><i class="fa-regular fa-calendar" style="width: 16px;"></i> Tahun: ${b.tahun_terbit || '-'}</div>
                        </div>

                        <div class="book-card-footer">
                            <div>
                                ${Components.renderStatusBadge(isAvailable ? 'Tersedia' : (b.stok === 0 ? 'Habis' : b.status))}
                            </div>
                            <button class="btn btn-blue btn-sm" ${!isAvailable ? 'disabled' : ''} onclick="CatalogPage.openBorrowModal(${b.id}, '${b.judul.replace(/'/g, "\\'")}')">
                                <i class="fa-solid fa-hand-holding-hand"></i> Pinjam
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    openBorrowModal(bookId, bookTitle) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const formatDateInput = (d) => d.toISOString().split('T')[0];

        const body = `
            <form id="borrow-book-form">
                <div style="margin-bottom: 1.25rem; padding: 0.85rem; background: #eff6ff; border-radius: var(--radius); border: 1px solid #bfdbfe;">
                    <div style="font-weight: 700; color: #1e40af;">${bookTitle}</div>
                    <div style="font-size: 0.825rem; color: #3b82f6;">Pengajuan peminjaman buku oleh siswa</div>
                </div>

                <div class="form-group">
                    <label class="form-label">Tanggal Pengambilan Buku *</label>
                    <input type="date" id="borrow-take-date" class="form-input" value="${formatDateInput(tomorrow)}" required>
                    <small style="color: #64748b;">Pilih tanggal Anda akan mengambil buku fisik di perpustakaan.</small>
                </div>

                <div class="form-group">
                    <label class="form-label">Rencana Tanggal Pengembalian *</label>
                    <input type="date" id="borrow-return-date" class="form-input" value="${formatDateInput(nextWeek)}" required>
                    <small style="color: #64748b;">Maksimal durasi peminjaman adalah 7 hari.</small>
                </div>

                <div class="form-group">
                    <label class="form-label">Catatan Tambahan (Opsional)</label>
                    <textarea id="borrow-notes" class="form-textarea" rows="2" placeholder="Catatan keperluan tugas atau belajar mandiri"></textarea>
                </div>
            </form>
        `;

        Components.showModal({
            title: 'Ajukan Peminjaman Buku',
            body: body,
            saveText: 'Kirim Permohonan',
            onSave: async () => {
                const tgl_ambil = document.getElementById('borrow-take-date').value;
                const tgl_kembali_rencana = document.getElementById('borrow-return-date').value;
                const catatan = document.getElementById('borrow-notes').value.trim();

                if (!tgl_ambil || !tgl_kembali_rencana) {
                    Components.showToast('Tanggal ambil dan kembali wajib diisi', 'error');
                    return;
                }

                try {
                    await API.post('/bookings', {
                        book_id: bookId,
                        tgl_ambil,
                        tgl_kembali_rencana,
                        catatan
                    });

                    Components.closeModal();
                    Components.showToast('Permohonan peminjaman berhasil dikirim! Silakan cek menu Peminjaman Saya.', 'success');
                    await this.loadCatalog();
                } catch (err) {
                    Components.showToast(err.message || 'Gagal mengajukan peminjaman', 'error');
                }
            }
        });
    }
};
