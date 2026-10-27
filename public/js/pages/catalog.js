// Catalog Page for Students (Katalog & Peminjaman Buku)
const CatalogPage = {
    books: [],
    categories: [],
    filterAvailability: 'ALL', // 'ALL' or 'AVAILABLE'

    async render() {
        const user = Auth.getUser();
        const app = document.getElementById('app');

        app.innerHTML = `
            <div class="app-container">
                ${Components.renderNavbar('katalog')}
                <main class="main-content">
                    <div class="page-header" style="flex-wrap: wrap; gap: 1rem; align-items: flex-start;">
                        <div>
                            <h1 class="page-title">Katalog Koleksi Buku</h1>
                            <p class="page-subtitle">Jelajahi koleksi buku pelajaran, referensi, dan literatur. Ajukan peminjaman secara mandiri.</p>
                        </div>
                        <a href="#peminjaman-saya" class="btn btn-outline">
                            <i class="fa-regular fa-calendar-check"></i>
                            <span>Peminjaman Saya</span>
                        </a>
                    </div>

                    <!-- Search & Filter Card -->
                    <div class="card" style="margin-bottom: 1.5rem;">
                        <div class="card-content" style="padding: 1rem 1.25rem;">
                            <div class="filter-toolbar" style="margin-bottom: 0; display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
                                <div class="search-box" style="flex: 1; min-width: 240px;">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" id="cat-search" class="form-input" placeholder="Cari judul, pengarang, penerbit, atau ISBN...">
                                </div>
                                <div style="min-width: 170px;">
                                    <select id="cat-genre" class="form-select">
                                        <option value="ALL">Semua Kategori</option>
                                    </select>
                                </div>
                                <div style="display: flex; gap: 0.35rem; align-items: center;">
                                    <button type="button" class="btn btn-sm btn-primary filter-avail-btn" data-avail="ALL" onclick="CatalogPage.setAvailFilter('ALL')">
                                        Semua Koleksi
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline filter-avail-btn" data-avail="AVAILABLE" onclick="CatalogPage.setAvailFilter('AVAILABLE')">
                                        <i class="fa-solid fa-check"></i> Tersedia Saja
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Book Catalog Grid -->
                    <div id="catalog-grid" class="book-cards-grid">
                        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #94a3b8;">
                            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: #2563eb; margin-bottom: 1rem; display: block;"></i>
                            Memuat katalog buku perpustakaan...
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

        if (search) search.addEventListener('input', handler);
        if (genre) genre.addEventListener('change', handler);
    },

    setAvailFilter(type) {
        this.filterAvailability = type;
        document.querySelectorAll('.filter-avail-btn').forEach(btn => {
            if (btn.dataset.avail === type) {
                btn.className = 'btn btn-sm btn-primary filter-avail-btn';
            } else {
                btn.className = 'btn btn-sm btn-outline filter-avail-btn';
            }
        });
        this.filterAndRender();
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
                (b.penerbit && b.penerbit.toLowerCase().includes(query)) ||
                (b.kode_buku && b.kode_buku.toLowerCase().includes(query));

            const matchesGenre = selectedGenre === 'ALL' || b.genre === selectedGenre;
            const matchesAvail = this.filterAvailability === 'ALL' || (b.stok > 0);

            return matchesQuery && matchesGenre && matchesAvail;
        });

        const container = document.getElementById('catalog-grid');
        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: #ffffff; border-radius: var(--radius-lg); border: 1px dashed var(--border);">
                    <i class="fa-solid fa-book-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem; display: block;"></i>
                    <h3 style="font-weight: 700; color: #1e293b; margin-bottom: 0.35rem;">Buku Tidak Ditemukan</h3>
                    <p style="color: #64748b; font-size: 0.875rem; max-width: 440px; margin: 0 auto 1rem;">
                        Tidak ada buku yang sesuai dengan kata kunci atau filter yang Anda pilih. Coba gunakan kata kunci yang lebih umum atau atur ulang filter kategori.
                    </p>
                    <button class="btn btn-outline btn-sm" onclick="document.getElementById('cat-search').value = ''; document.getElementById('cat-genre').value = 'ALL'; CatalogPage.setAvailFilter('ALL');">
                        Reset Pencarian
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(b => {
            const isAvailable = Number(b.stok) > 0;
            const safeTitle = escapeHtml(b.judul || 'Tanpa Judul');
            const safeAuthor = escapeHtml(b.pengarang || 'Penulis Tidak Diketahui');
            const safeCategory = escapeHtml(b.genre || 'Umum');
            const safeRack = escapeHtml(b.lokasi_rak || 'Rak Umum');
            const coverSrc = b.cover ? escapeHtml(b.cover) : null;

            return `
                <article class="book-card" data-book-id="${b.id}">
                    <div class="book-card-cover-wrapper">
                        ${coverSrc ? `
                            <img src="${coverSrc}" alt="Sampul ${safeTitle}" class="book-card-img" loading="lazy" onerror="this.parentElement.innerHTML = '<div class=\\'book-card-placeholder\\'><i class=\\'fa-solid fa-book-bookmark\\'></i><span>${safeCategory}</span></div>';">
                        ` : `
                            <div class="book-card-placeholder">
                                <i class="fa-solid fa-book-bookmark"></i>
                                <span>${safeCategory}</span>
                            </div>
                        `}
                        <div class="book-card-cover-badge">
                            <span class="badge ${isAvailable ? 'badge-tersedia' : 'badge-habis'}">
                                ${isAvailable ? `Tersedia ${b.stok} eks.` : 'Stok Habis'}
                            </span>
                        </div>
                    </div>

                    <div class="book-card-content">
                        <div class="book-card-tags">
                            <span class="book-category-tag">${safeCategory}</span>
                            ${Components.renderConditionBadge(b.condition || 'Baik')}
                        </div>

                        <h3 class="book-card-title" title="${safeTitle}">${safeTitle}</h3>
                        <p class="book-card-author">Oleh: <strong>${safeAuthor}</strong></p>

                        <div class="book-card-meta">
                            <div class="meta-item"><i class="fa-solid fa-map-pin"></i> <span>Rak: <strong>${safeRack}</strong></span></div>
                            <div class="meta-item"><i class="fa-regular fa-calendar"></i> <span>Tahun: ${b.tahun_terbit || '-'}</span></div>
                        </div>

                        <div class="book-card-actions">
                            <button type="button" class="btn btn-outline btn-sm book-btn-detail" onclick="CatalogPage.openDetailModal(${b.id})">
                                <i class="fa-solid fa-circle-info"></i> Detail
                            </button>
                            <button type="button" class="btn btn-blue btn-sm book-btn-borrow" ${!isAvailable ? 'disabled title="Stok buku sedang habis"' : ''} onclick="CatalogPage.openBorrowModal(${b.id})">
                                <i class="fa-solid fa-hand-holding-hand"></i> ${isAvailable ? 'Pinjam' : 'Habis'}
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    },

    openDetailModal(bookId) {
        const book = this.books.find(b => b.id == bookId);
        if (!book) return;

        const isAvailable = Number(book.stok) > 0;
        const safeTitle = escapeHtml(book.judul);
        const safeAuthor = escapeHtml(book.pengarang || '-');
        const safePublisher = escapeHtml(book.penerbit || '-');
        const safeCategory = escapeHtml(book.genre || 'Umum');
        const safeRack = escapeHtml(book.lokasi_rak || 'Rak Umum');
        const coverSrc = book.cover ? escapeHtml(book.cover) : null;
        const safeDescription = book.deskripsi ? escapeHtml(book.deskripsi).replace(/\n/g, '<br>') : 'Belum ada sinopsis atau deskripsi untuk buku ini.';

        const body = `
            <div class="book-detail-dialog">
                <div class="book-detail-hero">
                    <div class="book-detail-thumb">
                        ${coverSrc ? `
                            <img src="${coverSrc}" alt="Sampul ${safeTitle}" onerror="this.parentElement.innerHTML = '<div class=\\'book-card-placeholder\\'><i class=\\'fa-solid fa-book-bookmark\\'></i></div>';">
                        ` : `
                            <div class="book-card-placeholder">
                                <i class="fa-solid fa-book-bookmark"></i>
                            </div>
                        `}
                    </div>
                    <div class="book-detail-hero-info">
                        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.4rem; flex-wrap: wrap;">
                            <span class="book-category-tag">${safeCategory}</span>
                            ${Components.renderConditionBadge(book.condition || 'Baik')}
                            <span class="badge ${isAvailable ? 'badge-tersedia' : 'badge-habis'}">
                                ${isAvailable ? `Tersedia (${book.stok} eksemplar)` : 'Stok Habis'}
                            </span>
                        </div>
                        <h2 class="book-detail-title">${safeTitle}</h2>
                        <p class="book-detail-subtitle">Karya: <strong>${safeAuthor}</strong></p>
                    </div>
                </div>

                <div class="book-meta-grid">
                    <div class="book-meta-item">
                        <span class="meta-label">Penerbit</span>
                        <strong class="meta-val">${safePublisher}</strong>
                    </div>
                    <div class="book-meta-item">
                        <span class="meta-label">Tahun Terbit</span>
                        <strong class="meta-val">${book.tahun_terbit || '-'}</strong>
                    </div>
                    <div class="book-meta-item">
                        <span class="meta-label">Lokasi Rak Fisik</span>
                        <strong class="meta-val" style="color: #2563eb;"><i class="fa-solid fa-map-pin"></i> ${safeRack}</strong>
                    </div>
                    <div class="book-meta-item">
                        <span class="meta-label">Kode Buku / Eksemplar</span>
                        <strong class="meta-val" style="font-family: monospace;">${escapeHtml(book.kode_buku || `BK-${book.id}`)}</strong>
                    </div>
                </div>

                <div class="book-detail-synopsis">
                    <h4>Sinopsis & Ringkasan</h4>
                    <p>${safeDescription}</p>
                </div>

                <div class="book-detail-notice">
                    <i class="fa-solid fa-circle-info"></i>
                    <div>
                        <strong>Ketentuan Peminjaman Siswa:</strong>
                        <span>Maksimal 2 buku aktif per siswa dengan durasi pinjam 7 hari kalender. Harap ambil buku di perpustakaan setelah permohonan disetujui.</span>
                    </div>
                </div>
            </div>
        `;

        Components.showModal({
            title: 'Detail Informasi Buku',
            body: body,
            cancelText: 'Tutup',
            saveText: isAvailable ? 'Ajukan Peminjaman' : null,
            maxWidth: '640px',
            onSave: isAvailable ? () => {
                Components.closeModal();
                setTimeout(() => CatalogPage.openBorrowModal(book.id), 200);
            } : null
        });
    },

    openBorrowModal(bookId) {
        const book = this.books.find(b => b.id == bookId);
        if (!book) return;

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const formatDateInput = (d) => d.toISOString().split('T')[0];
        const initialTakeDate = formatDateInput(tomorrow);

        const calculateReturnDate = (takeDateStr) => {
            const d = new Date(takeDateStr);
            d.setDate(d.getDate() + 7);
            return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        };

        const safeTitle = escapeHtml(book.judul);
        const safeAuthor = escapeHtml(book.pengarang || '-');
        const safeRack = escapeHtml(book.lokasi_rak || 'Rak Umum');
        const coverSrc = book.cover ? escapeHtml(book.cover) : null;

        const body = `
            <form id="borrow-book-form">
                <!-- Book Card Preview -->
                <div class="borrow-modal-book-card">
                    <div class="borrow-modal-thumb">
                        ${coverSrc ? `
                            <img src="${coverSrc}" alt="Cover" onerror="this.parentElement.innerHTML = '<i class=\\'fa-solid fa-book\\'></i>';">
                        ` : `
                            <i class="fa-solid fa-book"></i>
                        `}
                    </div>
                    <div class="borrow-modal-info">
                        <div class="borrow-modal-title">${safeTitle}</div>
                        <div class="borrow-modal-author">Karya: ${safeAuthor}</div>
                        <div class="borrow-modal-meta">
                            <span><i class="fa-solid fa-map-pin"></i> Rak: <strong>${safeRack}</strong></span>
                            <span><i class="fa-solid fa-box-archive"></i> Stok: <strong>${book.stok} eksemplar</strong></span>
                        </div>
                    </div>
                </div>

                <!-- Input Tanggal Ambil -->
                <div class="form-group" style="margin-top: 1.25rem;">
                    <label class="form-label" for="borrow-take-date">Tanggal Rencana Pengambilan Buku *</label>
                    <input type="date" id="borrow-take-date" class="form-input" min="${formatDateInput(today)}" value="${initialTakeDate}" required onchange="CatalogPage.updateReturnDatePreview(this.value)">
                    <small style="color: #64748b; display: block; margin-top: 0.35rem;">
                        Pilih tanggal Anda akan datang ke perpustakaan untuk mengambil buku fisik.
                    </small>
                </div>

                <!-- Estimasi Tanggal Kembali Preview -->
                <div class="form-group">
                    <label class="form-label">Estimasi Batas Pengembalian Buku</label>
                    <div id="borrow-return-preview" class="return-date-preview-box">
                        <i class="fa-regular fa-calendar-check"></i>
                        <div>
                            <span style="font-size: 0.775rem; color: #1e40af; text-transform: uppercase; font-weight: 700; display: block;">Batas Waktu Pengembalian (7 Hari)</span>
                            <strong id="borrow-return-text" style="color: #1e3a8a; font-size: 0.95rem;">${calculateReturnDate(initialTakeDate)}</strong>
                        </div>
                    </div>
                </div>

                <!-- Catatan Opsional -->
                <div class="form-group">
                    <label class="form-label" for="borrow-notes">Catatan Tambahan (Opsional)</label>
                    <textarea id="borrow-notes" class="form-textarea" rows="2" placeholder="Contoh: Keperluan tugas kelompok Bahasa Indonesia"></textarea>
                </div>

                <!-- Rules alert -->
                <div class="alert-info-box">
                    <i class="fa-solid fa-shield-halved"></i>
                    <div style="font-size: 0.8rem; line-height: 1.5; color: #1e40af;">
                        Permohonan peminjaman akan diverifikasi oleh petugas perpustakaan. Anda dapat memantau status persetujuan di menu <strong>Peminjaman Saya</strong>.
                    </div>
                </div>
            </form>
        `;

        Components.showModal({
            title: 'Ajukan Permohonan Peminjaman',
            body: body,
            saveText: 'Kirim Permohonan',
            cancelText: 'Batal',
            maxWidth: '560px',
            onSave: async () => {
                const takeDateInput = document.getElementById('borrow-take-date');
                const tgl_ambil = takeDateInput?.value;
                const catatan = document.getElementById('borrow-notes')?.value.trim() || '';

                if (!tgl_ambil) {
                    Components.showToast('Tanggal rencana pengambilan buku wajib diisi.', 'error');
                    takeDateInput?.focus();
                    return;
                }

                // Compute return date string
                const tglAmbilObj = new Date(tgl_ambil);
                const tglKembaliObj = new Date(tglAmbilObj);
                tglKembaliObj.setDate(tglKembaliObj.getDate() + 7);
                const tgl_kembali_rencana = tglKembaliObj.toISOString().split('T')[0];

                const saveBtn = document.getElementById('modal-btn-save');
                if (saveBtn) {
                    saveBtn.disabled = true;
                    saveBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Mengirim...';
                }

                try {
                    const res = await API.post('/bookings', {
                        book_id: book.id,
                        tgl_ambil,
                        tgl_kembali_rencana,
                        catatan
                    });

                    Components.closeModal();
                    Components.showToast('Permohonan peminjaman berhasil dikirim! Menunggu persetujuan admin.', 'success');

                    // Prompt to open My Bookings
                    setTimeout(() => {
                        window.location.hash = '#peminjaman-saya';
                    }, 800);
                } catch (err) {
                    console.error('Borrow error:', err);
                    Components.showToast(err.message || 'Gagal mengirim permohonan peminjaman', 'error');
                    if (saveBtn) {
                        saveBtn.disabled = false;
                        saveBtn.innerHTML = 'Kirim Permohonan';
                    }
                }
            }
        });
    },

    updateReturnDatePreview(dateValue) {
        const previewEl = document.getElementById('borrow-return-text');
        if (!previewEl || !dateValue) return;

        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return;

        d.setDate(d.getDate() + 7);
        previewEl.textContent = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
};
