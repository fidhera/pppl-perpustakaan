// Admin Bookings & Circulation Management Page
async function renderAdminBookingsPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        ${Components.header()}
        <main class="main-content">
            <div class="container">
                <div class="page-header">
                    <div>
                        <h1 class="page-title"><i class="fas fa-tasks"></i> Sirkulasi & Kelola Booking</h1>
                        <p class="page-subtitle">Persetujuan reservasi, konfirmasi pengambilan, dan proses pengembalian buku</p>
                    </div>
                </div>

                <div class="tabs-container mb-4">
                    <button class="tab-btn active" data-status="pending">Booking Masuk (Pending)</button>
                    <button class="tab-btn" data-status="disetujui">Siap Diambil (Disetujui)</button>
                    <button class="tab-btn" data-status="diambil">Sedang Dipinjam</button>
                    <button class="tab-btn" data-status="all">Semua Riwayat</button>
                </div>

                <div id="admin-bookings-table">
                    ${Components.loadingSpinner()}
                </div>
            </div>
        </main>
        ${Components.footer()}
    `;

    Components.initHeaderEvents();

    let currentStatus = 'pending';

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatus = btn.dataset.status;
            loadBookings();
        });
    });

    async function loadBookings() {
        const tableContainer = document.getElementById('admin-bookings-table');
        tableContainer.innerHTML = Components.loadingSpinner();

        try {
            const url = currentStatus === 'all' ? '/bookings' : `/bookings?status=${currentStatus}`;
            const res = await api.get(url);

            if (!res.success || !res.data || res.data.length === 0) {
                tableContainer.innerHTML = Components.emptyState(
                    'fas fa-inbox',
                    'Tidak Ada Data',
                    'Belum ada data peminjaman untuk status ini.'
                );
                return;
            }

            const bookings = res.data;

            tableContainer.innerHTML = `
                <div class="table-responsive card">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Siswa</th>
                                <th>Buku</th>
                                <th>Status</th>
                                <th>Tgl Booking / Ambil</th>
                                <th>Jatuh Tempo</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bookings.map(b => {
                                const user = b.user || b.User || {};
                                const book = b.book || b.Book || {};
                                const tglBooking = b.tgl_booking || b.tanggal_booking || b.created_at;
                                const tglAmbil = b.tgl_ambil || b.tanggal_rencana_ambil;
                                const tglTempo = b.tgl_kembali_rencana || b.tanggal_jatuh_tempo;

                                return `
                                    <tr>
                                        <td>
                                            <strong>${user.nama || '-'}</strong>
                                            <div class="text-muted small">NIS: ${user.nis || '-'} (${user.kelas || '-'})</div>
                                        </td>
                                        <td>
                                            <strong>${book.judul || '-'}</strong>
                                            <div class="text-muted small">Rak: ${book.lokasi_rak || book.rak || '-'}</div>
                                        </td>
                                        <td>${Components.statusBadge(b.status)}</td>
                                        <td>
                                            <div>Req: ${Components.formatDate(tglAmbil)}</div>
                                            <small class="text-muted">Booked: ${Components.formatDate(tglBooking)}</small>
                                        </td>
                                        <td>${tglTempo ? Components.formatDate(tglTempo) : '-'}</td>
                                        <td>
                                            ${renderActionButtons(b)}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            attachActionListeners();

        } catch (error) {
            tableContainer.innerHTML = Components.emptyState('fas fa-exclamation-triangle', 'Error', error.message);
        }
    }

    function renderActionButtons(b) {
        if (b.status === 'pending') {
            return `
                <button class="btn btn-success btn-sm approve-btn" data-id="${b.id}">
                    <i class="fas fa-check"></i> Setujui
                </button>
                <button class="btn btn-danger btn-sm reject-btn" data-id="${b.id}">
                    <i class="fas fa-times"></i> Tolak
                </button>
            `;
        } else if (b.status === 'disetujui') {
            return `
                <button class="btn btn-primary btn-sm pickup-btn" data-id="${b.id}">
                    <i class="fas fa-hand-holding"></i> Konfirmasi Ambil
                </button>
            `;
        } else if (b.status === 'diambil') {
            return `
                <button class="btn btn-warning btn-sm return-btn" data-id="${b.id}">
                    <i class="fas fa-undo"></i> Kembalikan Buku
                </button>
            `;
        } else {
            return `<span class="text-muted small">-</span>`;
        }
    }

    function attachActionListeners() {
        // Approve
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    await api.put(`/bookings/${btn.dataset.id}/status`, { status: 'disetujui' });
                    Components.toast('Booking disetujui', 'success');
                    loadBookings();
                } catch (e) {
                    Components.toast(e.message || 'Gagal', 'error');
                }
            });
        });

        // Reject
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const alasan = prompt('Masukkan alasan penolakan:');
                if (alasan) {
                    api.put(`/bookings/${btn.dataset.id}/status`, { status: 'ditolak', catatan_admin: alasan })
                        .then(() => {
                            Components.toast('Booking ditolak', 'info');
                            loadBookings();
                        })
                        .catch(e => Components.toast(e.message, 'error'));
                }
            });
        });

        // Pickup
        document.querySelectorAll('.pickup-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Konfirmasi bahwa buku telah diambil oleh siswa? Jatuh tempo akan diset 7 hari dari sekarang.')) {
                    try {
                        await api.put(`/bookings/${btn.dataset.id}/status`, { status: 'diambil' });
                        Components.toast('Pengambilan buku berhasil dikonfirmasi', 'success');
                        loadBookings();
                    } catch (e) {
                        Components.toast(e.message, 'error');
                    }
                }
            });
        });

        // Return
        document.querySelectorAll('.return-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                openReturnModal(btn.dataset.id);
            });
        });
    }

    function openReturnModal(bookingId) {
        Components.modal({
            title: 'Konfirmasi Pengembalian Buku',
            content: `
                <form id="return-form">
                    <div class="form-group">
                        <label class="form-label">Kondisi Buku Saat Dikembalikan</label>
                        <select id="ret-kondisi" class="form-input">
                            <option value="baik">Baik / Normal</option>
                            <option value="rusak_ringan">Rusak Ringan (Denda Rp 10.000)</option>
                            <option value="rusak_berat">Rusak Berat (Denda Rp 25.000)</option>
                            <option value="hilang">Buku Hilang (Ganti Buku / Denda Rp 50.000)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Catatan Tambahan</label>
                        <textarea id="ret-catatan" class="form-input" rows="2" placeholder="Catatan kondisi atau keterangan..."></textarea>
                    </div>
                    <p class="text-muted small">Sistem akan secara otomatis menghitung denda keterlambatan (Rp 1.000/hari) jika melewati batas waktu jatuh tempo.</p>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
                        <button type="submit" class="btn btn-primary" id="btn-submit-return">
                            <i class="fas fa-check"></i> Proses Pengembalian
                        </button>
                    </div>
                </form>
            `
        });

        document.getElementById('return-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-submit-return');
            btn.disabled = true;

            try {
                const res = await api.post(`/bookings/${bookingId}/return`, {
                    kondisi_buku: document.getElementById('ret-kondisi').value,
                    catatan: document.getElementById('ret-catatan').value
                });

                if (res.success) {
                    Components.closeModal();
                    Components.toast('Buku berhasil dikembalikan!', 'success');
                    loadBookings();
                }
            } catch (err) {
                Components.toast(err.message || 'Gagal memproses pengembalian', 'error');
                btn.disabled = false;
            }
        });
    }

    loadBookings();
}
