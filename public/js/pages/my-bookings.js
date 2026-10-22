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
                    <div class="page-header" style="flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h1 class="page-title">Peminjaman Saya</h1>
                            <p class="page-subtitle">Daftar buku yang diajukan, telah di-ACC pihak perpustakaan, sedang dipinjam, serta riwayat pengembalian.</p>
                        </div>
                        <a href="#katalog" class="btn btn-blue">
                            <i class="fa-solid fa-plus"></i>
                            <span>Pinjam Buku Lain</span>
                        </a>
                    </div>

                    <div class="card">
                        <div class="card-header" style="border-bottom: 1px solid var(--border); padding: 1rem 1.25rem;">
                            <!-- Filter Tabs -->
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
                                <button class="btn btn-primary btn-sm my-tab-btn" data-tab="all" onclick="MyBookingsPage.switchTab('all')">
                                    Semua Permohonan (<span id="count-all">0</span>)
                                </button>
                                <button class="btn btn-outline btn-sm my-tab-btn" data-tab="disetujui" onclick="MyBookingsPage.switchTab('disetujui')" style="border-color: #bbf7d0; color: #166534;">
                                    <i class="fa-solid fa-circle-check"></i> Sudah di-ACC (<span id="count-disetujui">0</span>)
                                </button>
                                <button class="btn btn-outline btn-sm my-tab-btn" data-tab="diambil" onclick="MyBookingsPage.switchTab('diambil')" style="border-color: #ddd6fe; color: #6d28d9;">
                                    <i class="fa-solid fa-book-bookmark"></i> Sedang Dipinjam (<span id="count-diambil">0</span>)
                                </button>
                                <button class="btn btn-outline btn-sm my-tab-btn" data-tab="pending" onclick="MyBookingsPage.switchTab('pending')" style="border-color: #fef08a; color: #a16207;">
                                    <i class="fa-solid fa-clock"></i> Menunggu (<span id="count-pending">0</span>)
                                </button>
                                <button class="btn btn-outline btn-sm my-tab-btn" data-tab="history" onclick="MyBookingsPage.switchTab('history')">
                                    Riwayat Selesai (<span id="count-history">0</span>)
                                </button>
                            </div>

                            <!-- Search Filter -->
                            <div class="filter-toolbar" style="margin-bottom: 0;">
                                <div class="search-box" style="flex: 1; min-width: 200px;">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" id="my-search" class="form-input" placeholder="Cari judul buku, pengarang..." oninput="MyBookingsPage.renderTable()">
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th style="min-width: 240px;">Buku</th>
                                        <th style="min-width: 110px;">Tgl Pengajuan</th>
                                        <th style="min-width: 120px;">Jadwal Ambil</th>
                                        <th style="min-width: 130px;">Batas Pengembalian</th>
                                        <th style="min-width: 140px;">Status Permohonan</th>
                                        <th style="min-width: 220px;">Keterangan / Denda</th>
                                        <th style="text-align: right; min-width: 110px;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="my-bookings-tbody">
                                    <tr><td colspan="7" style="text-align: center; padding: 3rem; color: #94a3b8;">Memuat data peminjaman...</td></tr>
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
            Components.showToast('Gagal memuat peminjaman Anda', 'error');
        }
    },

    updateTabCounters() {
        const cAll = this.bookings.length;
        const cDisetujui = this.bookings.filter(b => b.status === 'disetujui').length;
        const cDiambil = this.bookings.filter(b => ['diambil', 'terlambat'].includes(b.status)).length;
        const cPending = this.bookings.filter(b => b.status === 'pending').length;
        const cHistory = this.bookings.filter(b => ['dikembalikan', 'ditolak'].includes(b.status)).length;

        const elAll = document.getElementById('count-all');
        const elDisetujui = document.getElementById('count-disetujui');
        const elDiambil = document.getElementById('count-diambil');
        const elPending = document.getElementById('count-pending');
        const elHistory = document.getElementById('count-history');

        if (elAll) elAll.textContent = cAll;
        if (elDisetujui) elDisetujui.textContent = cDisetujui;
        if (elDiambil) elDiambil.textContent = cDiambil;
        if (elPending) elPending.textContent = cPending;
        if (elHistory) elHistory.textContent = cHistory;
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

        // Filter based on active tab
        let filtered = this.bookings.filter(item => {
            if (this.currentTab === 'disetujui') return item.status === 'disetujui';
            if (this.currentTab === 'diambil') return ['diambil', 'terlambat'].includes(item.status);
            if (this.currentTab === 'pending') return item.status === 'pending';
            if (this.currentTab === 'history') return ['dikembalikan', 'ditolak'].includes(item.status);
            return true;
        });

        // Filter search query
        if (searchQuery) {
            filtered = filtered.filter(item => {
                const book = item.book || {};
                return (book.judul && book.judul.toLowerCase().includes(searchQuery)) ||
                       (book.pengarang && book.pengarang.toLowerCase().includes(searchQuery));
            });
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 4rem 1rem;">
                        <i class="fa-solid fa-book-open" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 1rem; display: block;"></i>
                        <p style="color: #64748b; font-weight: 500;">
                            ${searchQuery ? 'Tidak ada peminjaman yang cocok dengan pencarian.' : 'Belum ada data peminjaman untuk kategori ini.'}
                        </p>
                        <a href="#katalog" class="btn btn-blue btn-sm" style="margin-top: 0.75rem;">Mulai Cari Buku</a>
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

            let actionHtml = '';
            if (item.status === 'pending') {
                actionHtml = `
                    <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                        <button class="btn btn-outline btn-sm" style="color: #dc2626; padding: 0.3rem 0.6rem;" onclick="MyBookingsPage.cancelBooking(${item.id})" title="Batalkan Permohonan">
                            Batalkan
                        </button>
                    </div>
                `;
            } else if (isApproved) {
                actionHtml = `
                    <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                        <button class="btn btn-blue btn-sm" style="padding: 0.3rem 0.65rem;" onclick="MyBookingsPage.openDetailModal(${item.id})">
                            <i class="fa-solid fa-file-invoice"></i> Bukti ACC
                        </button>
                    </div>
                `;
            } else {
                actionHtml = `
                    <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                        <button class="btn btn-outline btn-sm" style="padding: 0.3rem 0.65rem;" onclick="MyBookingsPage.openDetailModal(${item.id})">
                            <i class="fa-solid fa-circle-info"></i> Detail
                        </button>
                    </div>
                `;
            }

            let infoDenda = '-';
            if (ret.denda > 0) {
                infoDenda = `
                    <div style="color: #dc2626; font-weight: 700; font-size: 0.85rem;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Denda: Rp ${Number(ret.denda).toLocaleString('id-ID')}
                    </div>
                    <div style="font-size: 0.75rem; color: #64748b;">Kondisi: ${ret.kondisi || 'rusak'} ${ret.catatan ? `(${ret.catatan})` : ''}</div>
                `;
            } else if (item.status === 'ditolak') {
                infoDenda = `
                    <span style="color: #dc2626; font-size: 0.825rem; font-weight: 500;">
                        <i class="fa-solid fa-circle-xmark"></i> Ditolak: ${item.alasan_tolak || 'Alasan tidak disebutkan oleh admin.'}
                    </span>
                `;
            } else if (isApproved) {
                infoDenda = `
                    <div style="color: #166534; font-size: 0.825rem; font-weight: 600;">
                        <i class="fa-solid fa-circle-check"></i> Disetujui pihak perpustakaan!
                    </div>
                    <div style="font-size: 0.775rem; color: #15803d;">
                        Ambil buku di <strong>Rak ${book.lokasi_rak || 'Umum'}</strong> pada ${Components.formatDate(item.tgl_ambil)}.
                    </div>
                `;
            } else if (item.status === 'pending') {
                infoDenda = `
                    <span style="color: #a16207; font-size: 0.825rem;">
                        <i class="fa-solid fa-hourglass-start"></i> Menunggu persetujuan admin perpustakaan.
                    </span>
                `;
            } else if (item.status === 'diambil') {
                infoDenda = `
                    <span style="color: #4338ca; font-size: 0.825rem;">
                        <i class="fa-solid fa-book-open-reader"></i> Buku sedang Anda pinjam. Harap kembalikan tepat waktu.
                    </span>
                `;
            } else if (isLate) {
                infoDenda = `
                    <span style="color: #dc2626; font-size: 0.825rem; font-weight: 700;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Terlambat! Segera kembalikan ke meja sirkulasi.
                    </span>
                `;
            } else if (item.status === 'dikembalikan') {
                infoDenda = `
                    <span style="color: #16a34a; font-size: 0.825rem;">
                        <i class="fa-solid fa-check-double"></i> Buku telah dikembalikan dengan aman.
                    </span>
                `;
            }

            return `
                <tr class="${isApproved ? 'row-approved-highlight' : ''}" style="${isApproved ? 'background-color: #f0fdf4;' : ''}">
                    <td>
                        <div style="display: flex; gap: 0.75rem; align-items: center;">
                            <div style="width: 42px; height: 56px; flex-shrink: 0; border-radius: 4px; overflow: hidden; background: #e2e8f0; display: flex; align-items: center; justify-content: center;">
                                ${book.cover ? `<img src="${book.cover}" alt="${book.judul}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fa-solid fa-book" style="color: #94a3b8; font-size: 1.15rem;"></i>`}
                            </div>
                            <div>
                                <div style="font-weight: 700; color: #0f172a; font-size: 0.925rem;">${book.judul || '-'}</div>
                                <div style="font-size: 0.775rem; color: #64748b;">
                                    ${book.pengarang || '-'} · Rak: <strong>${book.lokasi_rak || '-'}</strong>
                                </div>
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
                        ${isApproved ? `<div style="font-size: 0.725rem; color: #15803d; font-weight: 500;"><i class="fa-solid fa-check"></i> Siap Diambil</div>` : ''}
                    </td>
                    <td>
                        <div style="font-size: 0.85rem; font-weight: 600; color: ${isLate ? '#dc2626' : '#334155'};">
                            ${Components.formatDate(item.tgl_kembali_rencana)}
                        </div>
                        ${isLate ? `<div style="font-size: 0.725rem; color: #dc2626; font-weight: 700;"><i class="fa-solid fa-triangle-exclamation"></i> Lewat Tempo</div>` : ''}
                    </td>
                    <td>
                        ${Components.renderStatusBadge(item.status)}
                    </td>
                    <td>
                        ${infoDenda}
                    </td>
                    <td style="text-align: right;">
                        ${actionHtml}
                    </td>
                </tr>
            `;
        }).join('');
    },

    openDetailModal(id) {
        const item = this.bookings.find(b => b.id == id);
        if (!item) return;

        const book = item.book || {};
        const isApproved = item.status === 'disetujui';

        const body = `
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem; border-radius: var(--radius); background: ${isApproved ? '#f0fdf4' : '#f8fafc'}; border: 1px solid ${isApproved ? '#bbf7d0' : 'var(--border)'};">
                    <div style="width: 72px; height: 96px; flex-shrink: 0; border-radius: var(--radius-sm); overflow: hidden; background: #e2e8f0; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);">
                        ${book.cover ? `<img src="${book.cover}" alt="${book.judul}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fa-solid fa-book" style="color: #94a3b8; font-size: 2rem;"></i>`}
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.35rem;">
                            <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0;">${book.judul || '-'}</h3>
                            ${Components.renderStatusBadge(item.status)}
                        </div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.35rem;">Karya: <strong>${book.pengarang || '-'}</strong> · Penerbit: ${book.penerbit || '-'}</div>
                        <div style="font-size: 0.825rem; color: #475569;">Genre: <span class="badge" style="background: #e2e8f0;">${book.genre || '-'}</span> · Lokasi Rak: <strong>${book.lokasi_rak || 'Rak Umum'}</strong></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; font-size: 0.85rem;">
                    <div style="padding: 0.75rem; background: #f8fafc; border-radius: var(--radius); border: 1px solid var(--border);">
                        <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Nomor Peminjaman</div>
                        <div style="font-weight: 700; color: #0f172a; font-family: monospace;">#BK-${String(item.id).padStart(5, '0')}</div>
                    </div>
                    <div style="padding: 0.75rem; background: #f8fafc; border-radius: var(--radius); border: 1px solid var(--border);">
                        <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Tanggal Pengajuan</div>
                        <div style="font-weight: 600; color: #0f172a;">${Components.formatDate(item.tgl_booking)}</div>
                    </div>
                    <div style="padding: 0.75rem; background: #f8fafc; border-radius: var(--radius); border: 1px solid var(--border);">
                        <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Jadwal Pengambilan Buku</div>
                        <div style="font-weight: 700; color: ${isApproved ? '#166534' : '#0f172a'};">${Components.formatDate(item.tgl_ambil)}</div>
                    </div>
                    <div style="padding: 0.75rem; background: #f8fafc; border-radius: var(--radius); border: 1px solid var(--border);">
                        <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">Batas Waktu Pengembalian</div>
                        <div style="font-weight: 700; color: ${item.status === 'terlambat' ? '#dc2626' : '#0f172a'};">${Components.formatDate(item.tgl_kembali_rencana)}</div>
                    </div>
                </div>

                ${isApproved ? `
                    <div style="padding: 1rem; border-radius: var(--radius); background: #f0fdf4; border: 1px solid #bbf7d0;">
                        <h4 style="color: #14532d; font-size: 0.925rem; font-weight: 700; margin: 0 0 0.35rem 0;">
                            <i class="fa-solid fa-circle-check"></i> Permohonan Disetujui (ACC)
                        </h4>
                        <p style="font-size: 0.825rem; color: #166534; margin: 0; line-height: 1.5;">
                            Permohonan Anda telah disetujui oleh pihak perpustakaan. Tunjukkan bukti ACC ini atau sebutkan NISN Anda kepada petugas perpustakaan di rak <strong>${book.lokasi_rak || 'Umum'}</strong> pada tanggal <strong>${Components.formatDate(item.tgl_ambil)}</strong> untuk mengambil buku fisik.
                        </p>
                    </div>
                ` : ''}

                ${item.status === 'ditolak' ? `
                    <div style="padding: 1rem; border-radius: var(--radius); background: #fef2f2; border: 1px solid #fecaca;">
                        <h4 style="color: #991b1b; font-size: 0.925rem; font-weight: 700; margin: 0 0 0.35rem 0;">
                            <i class="fa-solid fa-circle-xmark"></i> Alasan Penolakan Permohonan
                        </h4>
                        <p style="font-size: 0.825rem; color: #b91c1c; margin: 0;">
                            ${item.alasan_tolak || 'Buku tidak dapat dipinjam saat ini karena stok fisik sedang dalam masa perbaikan/inventarisasi.'}
                        </p>
                    </div>
                ` : ''}

                ${item.catatan ? `
                    <div style="font-size: 0.825rem; color: #64748b;">
                        <strong>Catatan Siswa:</strong> <em>"${item.catatan}"</em>
                    </div>
                ` : ''}
            </div>
        `;

        Components.showModal({
            title: isApproved ? 'Bukti ACC Peminjaman Buku' : 'Detail Permohonan Peminjaman',
            body: body,
            cancelText: 'Tutup',
            saveText: null,
            maxWidth: '600px'
        });
    },

    async cancelBooking(id) {
        if (!confirm('Apakah Anda yakin ingin membatalkan permohonan peminjaman ini?')) return;

        try {
            await API.delete(`/bookings/${id}`);
            Components.showToast('Permohonan peminjaman berhasil dibatalkan', 'info');
            await this.loadMyBookings();
        } catch (err) {
            Components.showToast(err.message || 'Gagal membatalkan peminjaman', 'error');
        }
    }
};
