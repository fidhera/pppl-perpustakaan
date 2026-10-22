// Circulation (Peminjaman & Pengembalian) Page for Admin
const CirculationPage = {
    bookings: [],
    filterStatus: 'all',

    async render() {
        const user = Auth.getUser();
        if (user.role !== 'admin') {
            window.location.hash = '#dashboard';
            return;
        }

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="app-container">
                ${Components.renderNavbar('peminjaman')}
                <main class="main-content">
                    <div class="page-header">
                        <div>
                            <h1 class="page-title">Sirkulasi & Peminjaman Buku</h1>
                            <p class="page-subtitle">Kelola permohonan peminjaman, pengambilan, dan proses pengembalian buku</p>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <button class="btn btn-primary btn-sm circ-tab-btn" data-status="all">Semua Transaksi</button>
                                <button class="btn btn-outline btn-sm circ-tab-btn" data-status="pending">Menunggu Persetujuan</button>
                                <button class="btn btn-outline btn-sm circ-tab-btn" data-status="disetujui">Disetujui</button>
                                <button class="btn btn-outline btn-sm circ-tab-btn" data-status="diambil">Sedang Dipinjam</button>
                                <button class="btn btn-outline btn-sm circ-tab-btn" data-status="dikembalikan">Selesai</button>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Nama Peminjam</th>
                                        <th>Buku</th>
                                        <th>Tgl Booking</th>
                                        <th>Jadwal Ambil</th>
                                        <th>Rencana Kembali</th>
                                        <th>Status</th>
                                        <th>Denda</th>
                                        <th style="text-align: right;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="circ-table-tbody">
                                    <tr><td colspan="8" style="text-align: center; padding: 3rem; color: #94a3b8;">Memuat data transaksi...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        `;

        this.setupFilterButtons();
        await this.loadBookings();
    },

    setupFilterButtons() {
        document.querySelectorAll('.circ-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.circ-tab-btn').forEach(b => {
                    b.className = 'btn btn-outline btn-sm circ-tab-btn';
                });
                e.currentTarget.className = 'btn btn-primary btn-sm circ-tab-btn';
                this.filterStatus = e.currentTarget.getAttribute('data-status');
                this.renderTable();
            });
        });
    },

    async loadBookings() {
        try {
            const res = await API.get('/bookings?limit=100');
            this.bookings = res.data || [];
            this.renderTable();
        } catch (error) {
            console.error('Load bookings error:', error);
            Components.showToast('Gagal memuat transaksi peminjaman', 'error');
        }
    },

    renderTable() {
        const tbody = document.getElementById('circ-table-tbody');
        if (!tbody) return;

        const filtered = this.bookings.filter(b => {
            if (this.filterStatus === 'all') return true;
            return b.status === this.filterStatus;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 3rem; color: #94a3b8;">Tidak ada data peminjaman untuk status ini.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(item => {
            const user = item.user || {};
            const book = item.book || {};
            const ret = item.return || {};

            let actionButtons = '';
            if (item.status === 'pending') {
                actionButtons = `
                    <button class="btn btn-blue btn-sm" onclick="CirculationPage.approveBooking(${item.id})">Setujui</button>
                    <button class="btn btn-outline btn-sm" style="color: #dc2626;" onclick="CirculationPage.rejectBooking(${item.id})">Tolak</button>
                `;
            } else if (item.status === 'disetujui') {
                actionButtons = `
                    <button class="btn btn-primary btn-sm" onclick="CirculationPage.markAsTaken(${item.id})">Catat Diambil</button>
                `;
            } else if (item.status === 'diambil' || item.status === 'terlambat') {
                actionButtons = `
                    <button class="btn btn-outline btn-sm" style="color: #16a34a; border-color: #bbf7d0;" onclick="CirculationPage.openReturnModal(${item.id}, '${(book.judul || '').replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-arrow-rotate-left"></i> Pengembalian
                    </button>
                `;
            } else {
                actionButtons = `<span style="font-size: 0.8rem; color: #94a3b8;">Selesai</span>`;
            }

            return `
                <tr>
                    <td>
                        <div style="font-weight: 600; color: #0f172a;">${user.nama || user.username || 'Siswa'}</div>
                        <div style="font-size: 0.775rem; color: #64748b;">${user.nis || '-'} • Kelas: ${user.kelas || '-'}</div>
                    </td>
                    <td>
                        <div style="font-weight: 500; color: #0f172a;">${book.judul || '-'}</div>
                        <div style="font-size: 0.775rem; color: #64748b;">Rak: ${book.lokasi_rak || '-'}</div>
                    </td>
                    <td><span style="font-size: 0.85rem;">${Components.formatDate(item.tgl_booking)}</span></td>
                    <td><span style="font-size: 0.85rem;">${Components.formatDate(item.tgl_ambil)}</span></td>
                    <td><span style="font-size: 0.85rem; color: ${item.status === 'terlambat' ? '#dc2626; font-weight:600;' : ''}">${Components.formatDate(item.tgl_kembali_rencana)}</span></td>
                    <td>${Components.renderStatusBadge(item.status)}</td>
                    <td>
                        <span style="font-weight: 600; font-size: 0.85rem; color: ${ret.denda > 0 ? '#dc2626;' : '#16a34a;'}">
                            ${ret.denda ? 'Rp ' + Number(ret.denda).toLocaleString('id-ID') : '-'}
                        </span>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                        ${actionButtons}
                    </td>
                </tr>
            `;
        }).join('');
    },

    async approveBooking(id) {
        try {
            await API.put(`/bookings/${id}/status`, { status: 'disetujui' });
            Components.showToast('Peminjaman disetujui', 'success');
            await this.loadBookings();
        } catch (err) {
            Components.showToast(err.message || 'Gagal menyetujui peminjaman', 'error');
        }
    },

    async rejectBooking(id) {
        const reason = prompt('Masukkan alasan penolakan:');
        if (reason === null) return;

        try {
            await API.put(`/bookings/${id}/status`, { status: 'ditolak', alasan_tolak: reason });
            Components.showToast('Peminjaman ditolak', 'info');
            await this.loadBookings();
        } catch (err) {
            Components.showToast(err.message || 'Gagal menolak peminjaman', 'error');
        }
    },

    async markAsTaken(id) {
        try {
            await API.put(`/bookings/${id}/status`, { status: 'diambil' });
            Components.showToast('Status berhasil diubah menjadi diambil', 'success');
            await this.loadBookings();
        } catch (err) {
            Components.showToast(err.message || 'Gagal memproses pengambilan', 'error');
        }
    },

    openReturnModal(bookingId, bookTitle) {
        const body = `
            <form id="return-form">
                <p style="margin-bottom: 1rem; color: #475569;">Proses pengembalian buku <strong>"${bookTitle}"</strong>.</p>
                
                <div class="form-group">
                    <label class="form-label">Kondisi Buku Saat Dikembalikan *</label>
                    <select id="ret-kondisi" class="form-select" required>
                        <option value="baik">Baik (Tanpa Denda Kerusakan)</option>
                        <option value="rusak_ringan">Rusak Ringan (Denda Rp 10.000)</option>
                        <option value="rusak_berat">Rusak Berat (Denda Rp 25.000)</option>
                        <option value="hilang">Hilang (Denda Penggantian Rp 50.000)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Denda Tambahan / Penyesuaian (Rp)</label>
                    <input type="number" id="ret-denda" class="form-input" min="0" value="0">
                </div>

                <div class="form-group">
                    <label class="form-label">Catatan Pengembalian</label>
                    <textarea id="ret-catatan" class="form-textarea" rows="2" placeholder="Catatan kondisi atau status pembayaran denda"></textarea>
                </div>
            </form>
        `;

        Components.showModal({
            title: 'Proses Pengembalian Buku',
            body: body,
            saveText: 'Simpan Pengembalian',
            onSave: async () => {
                const kondisi = document.getElementById('ret-kondisi').value;
                const denda = document.getElementById('ret-denda').value;
                const catatan = document.getElementById('ret-catatan').value.trim();

                try {
                    await API.post(`/bookings/${bookingId}/return`, {
                        kondisi,
                        denda: parseFloat(denda) || 0,
                        catatan
                    });

                    Components.closeModal();
                    Components.showToast('Pengembalian buku berhasil diproses!', 'success');
                    await this.loadBookings();
                } catch (err) {
                    Components.showToast(err.message || 'Gagal memproses pengembalian', 'error');
                }
            }
        });
    }
};
