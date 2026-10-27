// My Bookings Page (Peminjaman Saya untuk Siswa)
const MyBookingsPage = {
    bookings: [],
    currentTab: 'all',

    async render() {
        const user = Auth.getUser();
        if (!user) {
            window.location.hash = '#login';
            return;
        }

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="app-container">
                ${Components.renderNavbar('peminjaman-saya')}
                <main class="main-content">
                    <div class="page-header" style="flex-wrap: wrap; gap: 1rem; align-items: flex-start;">
                        <div>
                            <h1 class="page-title">Peminjaman Saya</h1>
                            <p class="page-subtitle">Pantau status permohonan, jadwal pengambilan buku fisik, batas pengembalian, dan riwayat sirkulasi.</p>
                        </div>
                        <a href="#katalog" class="btn btn-blue">
                            <i class="fa-solid fa-plus"></i>
                            <span>Pinjam Buku Lain</span>
                        </a>
                    </div>

                    <!-- Summary Stats Grid -->
                    <div class="student-my-stats-grid">
                        <div class="student-stat-box" onclick="MyBookingsPage.switchTab('disetujui')" style="cursor: pointer;">
                            <div class="stat-icon-wrap icon-green"><i class="fa-solid fa-circle-check"></i></div>
                            <div>
                                <div class="stat-num" id="count-disetujui">0</div>
                                <div class="stat-label">Siap Diambil (ACC)</div>
                            </div>
                        </div>
                        <div class="student-stat-box" onclick="MyBookingsPage.switchTab('diambil')" style="cursor: pointer;">
                            <div class="stat-icon-wrap icon-purple"><i class="fa-solid fa-book-bookmark"></i></div>
                            <div>
                                <div class="stat-num" id="count-diambil">0</div>
                                <div class="stat-label">Sedang Dipinjam</div>
                            </div>
                        </div>
                        <div class="student-stat-box" onclick="MyBookingsPage.switchTab('pending')" style="cursor: pointer;">
                            <div class="stat-icon-wrap icon-yellow"><i class="fa-solid fa-hourglass-start"></i></div>
                            <div>
                                <div class="stat-num" id="count-pending">0</div>
                                <div class="stat-label">Menunggu Persetujuan</div>
                            </div>
                        </div>
                        <div class="student-stat-box" onclick="MyBookingsPage.switchTab('history')" style="cursor: pointer;">
                            <div class="stat-icon-wrap icon-blue"><i class="fa-solid fa-clock-rotate-left"></i></div>
                            <div>
                                <div class="stat-num" id="count-history">0</div>
                                <div class="stat-label">Riwayat Selesai</div>
                            </div>
                        </div>
                    </div>

                    <!-- Main Table Card -->
                    <div class="card">
                        <div class="card-header" style="border-bottom: 1px solid var(--border); padding: 1.25rem; flex-direction: column; align-items: stretch; gap: 1rem;">
                            <!-- Filter Tabs -->
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <button type="button" class="btn btn-primary btn-sm my-tab-btn" data-tab="all" onclick="MyBookingsPage.switchTab('all')">
                                    Semua Permohonan (<span id="count-all">0</span>)
                                </button>
                                <button type="button" class="btn btn-outline btn-sm my-tab-btn" data-tab="disetujui" onclick="MyBookingsPage.switchTab('disetujui')">
                                    <i class="fa-solid fa-circle-check" style="color: #16a34a;"></i> Siap Diambil
                                </button>
                                <button type="button" class="btn btn-outline btn-sm my-tab-btn" data-tab="diambil" onclick="MyBookingsPage.switchTab('diambil')">
                                    <i class="fa-solid fa-book-open-reader" style="color: #7c3aed;"></i> Sedang Dipinjam
                                </button>
                                <button type="button" class="btn btn-outline btn-sm my-tab-btn" data-tab="pending" onclick="MyBookingsPage.switchTab('pending')">
                                    <i class="fa-regular fa-clock" style="color: #d97706;"></i> Menunggu ACC
                                </button>
                                <button type="button" class="btn btn-outline btn-sm my-tab-btn" data-tab="history" onclick="MyBookingsPage.switchTab('history')">
                                    <i class="fa-solid fa-box-archive" style="color: #64748b;"></i> Riwayat Selesai
                                </button>
                            </div>

                            <!-- Search Filter Toolbar -->
                            <div class="filter-toolbar" style="margin-bottom: 0;">
                                <div class="search-box" style="flex: 1; min-width: 240px;">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" id="my-search" class="form-input" placeholder="Cari berdasarkan judul buku, pengarang, atau kode booking..." oninput="MyBookingsPage.renderTable()">
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th style="min-width: 260px;">Buku & Kode Booking</th>
                                        <th style="min-width: 110px;">Tgl Pengajuan</th>
                                        <th style="min-width: 130px;">Jadwal Ambil</th>
                                        <th style="min-width: 140px;">Batas Kembali</th>
                                        <th style="min-width: 130px;">Status</th>
                                        <th style="min-width: 240px;">Petunjuk / Keterangan</th>
                                        <th style="text-align: right; min-width: 120px;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="my-bookings-tbody">
                                    <tr>
                                        <td colspan="7" style="text-align: center; padding: 3rem; color: #94a3b8;">
                                            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.5rem; color: #2563eb; margin-bottom: 0.5rem; display: block;"></i>
                                            Memuat riwayat peminjaman...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        `;

        await this.loadMyBookings();
    },

    async loadMyBookings() {
        try {
            const res = await API.get('/bookings/my?limit=150');
            this.bookings = res.data?.bookings || (Array.isArray(res.data) ? res.data : []);
            this.updateTabCounters();
            this.renderTable();
        } catch (error) {
            console.error('Load my bookings error:', error);
            Components.showToast('Gagal memuat daftar peminjaman Anda', 'error');
        }
    },

    updateTabCounters() {
        const cAll = this.bookings.length;
        const cDisetujui = this.bookings.filter(b => b.status === 'disetujui').length;
        const cDiambil = this.bookings.filter(b => ['diambil', 'terlambat'].includes(b.status)).length;
        const cPending = this.bookings.filter(b => b.status === 'pending').length;
        const cHistory = this.bookings.filter(b => ['dikembalikan', 'ditolak'].includes(b.status)).length;

        const updateEl = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        updateEl('count-all', cAll);
        updateEl('count-disetujui', cDisetujui);
        updateEl('count-diambil', cDiambil);
        updateEl('count-pending', cPending);
        updateEl('count-history', cHistory);
    },

    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.my-tab-btn').forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.className = 'btn btn-primary btn-sm my-tab-btn';
            } else {
                btn.className = 'btn btn-outline btn-sm my-tab-btn';
            }
        });
        this.renderTable();
    },

    renderTable() {
        const tbody = document.getElementById('my-bookings-tbody');
        if (!tbody) return;

        const searchQuery = document.getElementById('my-search')?.value.toLowerCase().trim() || '';

        // Filter by tab
        let filtered = this.bookings.filter(item => {
            if (this.currentTab === 'disetujui') return item.status === 'disetujui';
            if (this.currentTab === 'diambil') return ['diambil', 'terlambat'].includes(item.status);
            if (this.currentTab === 'pending') return item.status === 'pending';
            if (this.currentTab === 'history') return ['dikembalikan', 'ditolak'].includes(item.status);
            return true;
        });

        // Filter by search
        if (searchQuery) {
            filtered = filtered.filter(item => {
                const book = item.book || {};
                const kode = item.kode_booking || `BK-${item.id}`;
                return (book.judul && book.judul.toLowerCase().includes(searchQuery)) ||
                       (book.pengarang && book.pengarang.toLowerCase().includes(searchQuery)) ||
                       kode.toLowerCase().includes(searchQuery);
            });
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 3.5rem 1rem;">
                        <i class="fa-solid fa-book-open" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 1rem; display: block;"></i>
                        <p style="color: #64748b; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.25rem;">
                            ${searchQuery ? 'Tidak ada peminjaman yang cocok dengan pencarian Anda.' : 'Belum ada data peminjaman di kategori ini.'}
                        </p>
                        <p style="color: #94a3b8; font-size: 0.825rem; margin-bottom: 1rem;">
                            Jelajahi berbagai buku menarik di katalog perpustakaan dan ajukan peminjaman sekarang.
                        </p>
                        <a href="#katalog" class="btn btn-blue btn-sm" style="display: inline-flex;">
                            <i class="fa-solid fa-magnifying-glass"></i> Buka Katalog Buku
                        </a>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(item => {
            const book = item.book || {};
            const ret = item.return || {};
            const isApproved = item.status === 'disetujui';
            const isLate = item.status === 'terlambat';
            const bookingCode = item.kode_booking || `BK-${String(item.id).padStart(5, '0')}`;
            const coverSrc = book.cover ? escapeHtml(book.cover) : null;
            const safeTitle = escapeHtml(book.judul || 'Buku Perpustakaan');
            const safeAuthor = escapeHtml(book.pengarang || '-');
            const safeRack = escapeHtml(book.lokasi_rak || 'Umum');

            // Action buttons
            let actionHtml = '';
            if (item.status === 'pending') {
                actionHtml = `
                    <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-outline btn-sm" style="color: #dc2626; border-color: #fca5a5;" onclick="MyBookingsPage.cancelBooking(${item.id})" title="Batalkan Permohonan">
                            <i class="fa-solid fa-xmark"></i> Batal
                        </button>
                    </div>
                `;
            } else if (isApproved) {
                actionHtml = `
                    <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-blue btn-sm" onclick="MyBookingsPage.openTicketModal(${item.id})">
                            <i class="fa-solid fa-ticket"></i> Kartu Ambil
                        </button>
                    </div>
                `;
            } else {
                actionHtml = `
                    <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                        <button type="button" class="btn btn-outline btn-sm" onclick="MyBookingsPage.openTicketModal(${item.id})">
                            <i class="fa-solid fa-circle-info"></i> Detail
                        </button>
                    </div>
                `;
            }

            // Info guide column
            let infoGuide = '';
            if (ret.denda > 0) {
                infoGuide = `
                    <div style="color: #dc2626; font-weight: 700; font-size: 0.85rem;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Denda: Rp ${Number(ret.denda).toLocaleString('id-ID')}
                    </div>
                    <div style="font-size: 0.775rem; color: #64748b;">Kondisi: ${escapeHtml(ret.kondisi || 'Baik')} ${ret.catatan ? `(${escapeHtml(ret.catatan)})` : ''}</div>
                `;
            } else if (item.status === 'ditolak') {
                infoGuide = `
                    <div style="color: #b91c1c; font-size: 0.825rem; font-weight: 500;">
                        <i class="fa-solid fa-circle-xmark"></i> Ditolak: ${escapeHtml(item.alasan_tolak || 'Alasan tidak disebutkan oleh admin.')}
                    </div>
                `;
            } else if (isApproved) {
                infoGuide = `
                    <div class="approved-pickup-box">
                        <div style="color: #166534; font-size: 0.825rem; font-weight: 700;">
                            <i class="fa-solid fa-circle-check"></i> Siap diambil di perpustakaan!
                        </div>
                        <div style="font-size: 0.775rem; color: #15803d; margin-top: 0.15rem;">
                            Tunjukkan kode <strong>${escapeHtml(bookingCode)}</strong> ke petugas di <strong>Rak ${safeRack}</strong>.
                        </div>
                    </div>
                `;
            } else if (item.status === 'pending') {
                infoGuide = `
                    <div style="color: #92400e; font-size: 0.825rem; line-height: 1.4;">
                        <i class="fa-solid fa-hourglass-start"></i> Permohonan sedang ditinjau petugas perpustakaan.
                    </div>
                `;
            } else if (item.status === 'diambil') {
                infoGuide = `
                    <div style="color: #1e40af; font-size: 0.825rem;">
                        <i class="fa-solid fa-book-open-reader"></i> Buku sedang aktif Anda pinjam. Harap jaga kebersihan fisik buku.
                    </div>
                `;
            } else if (isLate) {
                infoGuide = `
                    <div style="color: #b91c1c; font-size: 0.825rem; font-weight: 700;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Melewati tenggat! Segera kembalikan ke meja sirkulasi.
                    </div>
                `;
            } else if (item.status === 'dikembalikan') {
                infoGuide = `
                    <div style="color: #15803d; font-size: 0.825rem;">
                        <i class="fa-solid fa-check-double"></i> Selesai. Buku telah dikembalikan ke perpustakaan.
                    </div>
                `;
            }

            return `
                <tr class="${isApproved ? 'row-approved-highlight' : ''}">
                    <td>
                        <div style="display: flex; gap: 0.85rem; align-items: center;">
                            <div class="table-book-thumb">
                                ${coverSrc ? `
                                    <img src="${coverSrc}" alt="Cover" onerror="this.parentElement.innerHTML = '<i class=\\'fa-solid fa-book\\'></i>';">
                                ` : `
                                    <i class="fa-solid fa-book"></i>
                                `}
                            </div>
                            <div style="min-width: 0;">
                                <div style="font-weight: 700; color: #0f172a; font-size: 0.925rem; line-height: 1.35; margin-bottom: 0.2rem;">${safeTitle}</div>
                                <div style="font-size: 0.775rem; color: #64748b; margin-bottom: 0.35rem;">
                                    ${safeAuthor} · Rak: <strong>${safeRack}</strong>
                                </div>
                                <span class="booking-code-pill"><i class="fa-solid fa-ticket"></i> ${escapeHtml(bookingCode)}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span style="font-size: 0.85rem; color: #475569;">
                            ${Components.formatDate(item.tgl_booking)}
                        </span>
                    </td>
                    <td>
                        <div style="font-size: 0.85rem; font-weight: 600; color: ${isApproved ? '#166534' : '#334155'};">
                            ${Components.formatDate(item.tgl_ambil)}
                        </div>
                        ${isApproved ? `<span class="badge" style="background: #dcfce7; color: #166534; font-size: 0.7rem; margin-top: 0.25rem;"><i class="fa-solid fa-check"></i> ACC</span>` : ''}
                    </td>
                    <td>
                        <div style="font-size: 0.85rem; font-weight: 600; color: ${isLate ? '#dc2626' : '#334155'};">
                            ${Components.formatDate(item.tgl_kembali_rencana)}
                        </div>
                        ${isLate ? `<span class="badge badge-terlambat" style="font-size: 0.7rem; margin-top: 0.25rem;">Terlambat</span>` : ''}
                    </td>
                    <td>
                        ${Components.renderStatusBadge(item.status)}
                    </td>
                    <td>
                        ${infoGuide}
                    </td>
                    <td style="text-align: right;">
                        ${actionHtml}
                    </td>
                </tr>
            `;
        }).join('');
    },

    openTicketModal(id) {
        const item = this.bookings.find(b => b.id == id);
        if (!item) return;

        const book = item.book || {};
        const user = Auth.getUser() || {};
        const isApproved = item.status === 'disetujui';
        const bookingCode = item.kode_booking || `BK-${String(item.id).padStart(5, '0')}`;
        const safeTitle = escapeHtml(book.judul || 'Buku Perpustakaan');
        const safeAuthor = escapeHtml(book.pengarang || '-');
        const safePublisher = escapeHtml(book.penerbit || '-');
        const safeRack = escapeHtml(book.lokasi_rak || 'Rak Umum');
        const coverSrc = book.cover ? escapeHtml(book.cover) : null;

        const body = `
            <div id="printable-ticket" class="borrow-ticket-wrapper">
                <!-- Header Kartu -->
                <div class="borrow-ticket-header">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <img src="img/logo_smp-informatika-bina-generasi.png" alt="Logo SMP" style="width: 44px; height: 44px; object-fit: contain;">
                        <div>
                            <div style="font-size: 0.725rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1e3a8a;">SMP INFORMATIKA BINA GENERASI</div>
                            <div style="font-size: 1.05rem; font-weight: 800; color: #0f172a;">KARTU PENGAMBILAN BUKU</div>
                            <div style="font-size: 0.75rem; color: #64748b;">Perpustakaan Digital Terpadu</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="ticket-code-tag">${escapeHtml(bookingCode)}</div>
                        <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">Status: <strong>${escapeHtml(item.status).toUpperCase()}</strong></div>
                    </div>
                </div>

                <!-- Info Siswa & Buku -->
                <div class="borrow-ticket-body">
                    <div class="ticket-meta-section">
                        <div class="ticket-meta-col">
                            <span class="ticket-label">Nama Siswa:</span>
                            <strong class="ticket-val">${escapeHtml(user.nama || user.username)}</strong>
                        </div>
                        <div class="ticket-meta-col">
                            <span class="ticket-label">NISN / Identitas:</span>
                            <strong class="ticket-val">${escapeHtml(user.nis || '-')}</strong>
                        </div>
                        <div class="ticket-meta-col">
                            <span class="ticket-label">Kelas:</span>
                            <strong class="ticket-val">${escapeHtml(user.kelas || 'Siswa SMP')}</strong>
                        </div>
                    </div>

                    <div class="ticket-book-card">
                        <div class="ticket-book-thumb">
                            ${coverSrc ? `
                                <img src="${coverSrc}" alt="Cover" onerror="this.parentElement.innerHTML = '<i class=\\'fa-solid fa-book\\'></i>';">
                            ` : `
                                <i class="fa-solid fa-book"></i>
                            `}
                        </div>
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 0.25rem 0; font-size: 1rem; font-weight: 700; color: #0f172a;">${safeTitle}</h4>
                            <div style="font-size: 0.8rem; color: #475569; margin-bottom: 0.35rem;">Penulis: <strong>${safeAuthor}</strong> · Penerbit: ${safePublisher}</div>
                            <div style="font-size: 0.8rem; color: #1e40af;"><i class="fa-solid fa-map-pin"></i> Lokasi Rak: <strong>${safeRack}</strong></div>
                        </div>
                    </div>

                    <!-- Dates Grid -->
                    <div class="ticket-dates-grid">
                        <div class="ticket-date-box">
                            <span class="date-box-label">Tanggal Pengajuan</span>
                            <strong class="date-box-val">${Components.formatDate(item.tgl_booking)}</strong>
                        </div>
                        <div class="ticket-date-box" style="background: ${isApproved ? '#f0fdf4' : '#f8fafc'}; border-color: ${isApproved ? '#bbf7d0' : '#e2e8f0'};">
                            <span class="date-box-label" style="color: ${isApproved ? '#166534' : '#64748b'};">Jadwal Ambil Buku</span>
                            <strong class="date-box-val" style="color: ${isApproved ? '#15803d' : '#0f172a'};">${Components.formatDate(item.tgl_ambil)}</strong>
                        </div>
                        <div class="ticket-date-box">
                            <span class="date-box-label">Batas Waktu Pengembalian</span>
                            <strong class="date-box-val" style="color: #b91c1c;">${Components.formatDate(item.tgl_kembali_rencana)}</strong>
                        </div>
                    </div>

                    ${isApproved ? `
                        <div class="ticket-instruction-box">
                            <i class="fa-solid fa-circle-check" style="font-size: 1.25rem; color: #16a34a; margin-top: 0.15rem;"></i>
                            <div style="font-size: 0.825rem; color: #166534; line-height: 1.5;">
                                <strong>Permohonan Anda Telah Disetujui (ACC)!</strong><br>
                                Harap tunjukkan kartu ini di layar ponsel Anda atau sebutkan kode booking <strong>${escapeHtml(bookingCode)}</strong> kepada petugas di meja perpustakaan untuk mengambil buku fisik.
                            </div>
                        </div>
                    ` : ''}

                    ${item.status === 'ditolak' ? `
                        <div style="padding: 0.85rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius); font-size: 0.825rem; color: #991b1b;">
                            <strong>Alasan Penolakan:</strong> ${escapeHtml(item.alasan_tolak || 'Stok tidak mencukupi atau sedang dalam pemeliharaan fisik.')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        Components.showModal({
            title: isApproved ? 'Bukti ACC Pengambilan Buku' : 'Detail Permohonan Peminjaman',
            body: body,
            cancelText: 'Tutup',
            saveText: '<i class="fa-solid fa-print"></i> Cetak / Simpan Bukti',
            maxWidth: '620px',
            onSave: () => {
                window.print();
            }
        });
    },

    async cancelBooking(id) {
        if (!confirm('Apakah Anda yakin ingin membatalkan permohonan peminjaman buku ini?')) return;

        try {
            await API.delete(`/bookings/${id}`);
            Components.showToast('Permohonan peminjaman berhasil dibatalkan', 'info');
            await this.loadMyBookings();
        } catch (err) {
            console.error('Cancel booking error:', err);
            Components.showToast(err.message || 'Gagal membatalkan peminjaman', 'error');
        }
    }
};
