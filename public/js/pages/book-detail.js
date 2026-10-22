// Book Detail Page
async function renderBookDetailPage(params) {
    const bookId = params.id;
    const app = document.getElementById('app');

    app.innerHTML = `
        ${Components.header()}
        <main class="main-content">
            <div class="container">
                <a href="#/catalog" class="btn btn-secondary btn-sm mb-4">
                    <i class="fas fa-arrow-left"></i> Kembali ke Katalog
                </a>
                <div id="book-detail-container">
                    ${Components.loadingSpinner()}
                </div>
            </div>
        </main>
        ${Components.footer()}
    `;

    Components.initHeaderEvents();

    const container = document.getElementById('book-detail-container');

    try {
        const res = await api.get(`/books/${bookId}`);
        if (!res.success || !res.data) {
            container.innerHTML = Components.emptyState('fas fa-exclamation-circle', 'Buku Tidak Ditemukan');
            return;
        }

        const book = res.data;
        const coverUrl = book.foto_cover ? `/uploads/${book.foto_cover}` : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
        const isAvailable = book.stok > 0;

        container.innerHTML = `
            <div class="detail-card">
                <div class="detail-grid">
                    <div class="detail-cover-wrapper">
                        <img src="${coverUrl}" alt="${book.judul}" class="detail-cover-img" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'">
                    </div>
                    <div class="detail-info">
                        <div class="mb-2">
                            <span class="badge ${isAvailable ? 'badge-success' : 'badge-danger'}">
                                ${isAvailable ? `Tersedia (${book.stok} eksemplar)` : 'Stok Habis'}
                            </span>
                            <span class="badge badge-info ml-2">${book.genre || 'Umum'}</span>
                        </div>
                        <h1 class="detail-title">${book.judul}</h1>
                        <p class="detail-author"><i class="fas fa-pen-nib"></i> Penulis: <strong>${book.pengarang}</strong></p>

                        <div class="detail-meta-table">
                            <div class="meta-row">
                                <span class="meta-label">Penerbit:</span>
                                <span class="meta-val">${book.penerbit || '-'}</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Tahun Terbit:</span>
                                <span class="meta-val">${book.tahun_terbit || '-'}</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Lokasi Rak:</span>
                                <span class="meta-val"><strong>${book.lokasi_rak || '-'}</strong></span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Total Dipinjam:</span>
                                <span class="meta-val">${book.total_dipinjam || 0} kali</span>
                            </div>
                        </div>

                        <div class="detail-synopsis mt-4">
                            <h3>Sinopsis & Deskripsi</h3>
                            <p>${book.deskripsi ? book.deskripsi.replace(/\n/g, '<br>') : 'Tidak ada deskripsi tersedia.'}</p>
                        </div>

                        <div class="detail-actions mt-4">
                            ${!Auth.isAdmin() ? `
                                <button class="btn btn-primary btn-lg" id="btn-booking-book" ${!isAvailable ? 'disabled' : ''}>
                                    <i class="fas fa-calendar-check"></i> ${isAvailable ? 'Reservasi / Booking Buku' : 'Stok Sedang Habis'}
                                </button>
                            ` : `
                                <a href="#/admin/books" class="btn btn-primary btn-lg">
                                    <i class="fas fa-cog"></i> Kelola di Admin Panel
                                </a>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (!Auth.isAdmin() && isAvailable) {
            document.getElementById('btn-booking-book').addEventListener('click', () => {
                showBookingModal(book);
            });
        }

    } catch (error) {
        container.innerHTML = Components.emptyState('fas fa-exclamation-triangle', 'Gagal Memuat Detail', error.message);
    }
}

function showBookingModal(book) {
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    Components.modal({
        title: `Reservasi Buku: ${book.judul}`,
        content: `
            <form id="booking-modal-form">
                <div class="form-group">
                    <label class="form-label">Tanggal Rencana Pengambilan Buku</label>
                    <input type="date" id="booking-date" class="form-input" min="${today}" max="${maxDateStr}" value="${today}" required>
                    <small class="form-hint">Maksimal pengambilan 7 hari dari sekarang.</small>
                </div>
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> Batas maksimal booking aktif adalah 2 buku per siswa. Harap ambil buku tepat waktu setelah disetujui petugas.
                </div>
                <div class="modal-footer mt-4">
                    <button type="button" class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
                    <button type="submit" class="btn btn-primary" id="submit-booking-btn">
                        <i class="fas fa-check"></i> Konfirmasi Booking
                    </button>
                </div>
            </form>
        `
    });

    document.getElementById('booking-modal-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('booking-date').value;
        const btn = document.getElementById('submit-booking-btn');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

        try {
            const res = await api.post('/bookings', {
                buku_id: book.id,
                tanggal_rencana_ambil: date
            });

            if (res.success) {
                Components.closeModal();
                Components.toast('Reservasi berhasil diajukan! Menunggu persetujuan admin.', 'success');
                setTimeout(() => {
                    window.location.hash = '#/my-bookings';
                }, 1000);
            }
        } catch (error) {
            Components.toast(error.message || 'Gagal mengajukan booking', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check"></i> Konfirmasi Booking';
        }
    });
}
