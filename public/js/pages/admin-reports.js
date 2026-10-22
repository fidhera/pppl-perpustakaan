// Admin Reports & Fines Page
async function renderAdminReportsPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        ${Components.header()}
        <main class="main-content">
            <div class="container">
                <div class="page-header">
                    <div>
                        <h1 class="page-title"><i class="fas fa-file-invoice-dollar"></i> Laporan & Denda Keterlambatan</h1>
                        <p class="page-subtitle">Daftar denda siswa, status pembayaran denda, dan ringkasan sirkulasi</p>
                    </div>
                </div>

                <div class="card p-4 mb-4">
                    <h3 class="card-title mb-3"><i class="fas fa-money-bill-wave"></i> Rekapitulasi Denda</h3>
                    <div id="fines-stats-summary" class="dashboard-stats-grid">
                        ${Components.loadingSpinner()}
                    </div>
                </div>

                <div id="admin-fines-table">
                    ${Components.loadingSpinner()}
                </div>
            </div>
        </main>
        ${Components.footer()}
    `;

    Components.initHeaderEvents();

    async function loadFines() {
        const statsSummary = document.getElementById('fines-stats-summary');
        const tableContainer = document.getElementById('admin-fines-table');

        try {
            const res = await api.get('/reports/fines');
            if (!res.success) {
                tableContainer.innerHTML = Components.emptyState('fas fa-exclamation-triangle', 'Gagal Memuat Laporan');
                return;
            }

            const fines = res.data || [];
            let totalDenda = 0;
            let totalLunas = 0;
            let totalBelumLunas = 0;

            fines.forEach(f => {
                const nominal = Number(f.nominal) || 0;
                totalDenda += nominal;
                if (f.status === 'lunas') totalLunas += nominal;
                else totalBelumLunas += nominal;
            });

            statsSummary.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon bg-primary-light text-primary"><i class="fas fa-coins"></i></div>
                    <div class="stat-data">
                        <h3>${Components.formatRupiah(totalDenda)}</h3>
                        <p>Total Seluruh Denda</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-success-light text-success"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-data">
                        <h3>${Components.formatRupiah(totalLunas)}</h3>
                        <p>Total Denda Terbayar</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-danger-light text-danger"><i class="fas fa-exclamation-circle"></i></div>
                    <div class="stat-data">
                        <h3>${Components.formatRupiah(totalBelumLunas)}</h3>
                        <p>Denda Belum Dibayar</p>
                    </div>
                </div>
            `;

            if (fines.length === 0) {
                tableContainer.innerHTML = Components.emptyState('fas fa-smile', 'Tidak Ada Denda', 'Tidak ada catatan denda yang belum atau sudah dibayar.');
                return;
            }

            tableContainer.innerHTML = `
                <div class="table-responsive card">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Siswa</th>
                                <th>Buku & Keterangan</th>
                                <th>Nominal</th>
                                <th>Status</th>
                                <th>Tanggal Denda</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fines.map(f => {
                                const ret = f.Return || {};
                                const booking = ret.Booking || {};
                                const user = booking.User || {};
                                const book = booking.Book || {};

                                return `
                                    <tr>
                                        <td>
                                            <strong>${user.nama || '-'}</strong>
                                            <div class="text-muted small">NIS: ${user.nis || '-'}</div>
                                        </td>
                                        <td>
                                            <strong>${book.judul || '-'}</strong>
                                            <div class="text-muted small">${f.keterangan || 'Keterlambatan/kondisi'}</div>
                                        </td>
                                        <td><strong>${Components.formatRupiah(f.nominal)}</strong></td>
                                        <td>
                                            <span class="badge ${f.status === 'lunas' ? 'badge-success' : 'badge-danger'}">
                                                ${f.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                                            </span>
                                        </td>
                                        <td>${Components.formatDate(f.createdAt)}</td>
                                        <td>
                                            ${f.status !== 'lunas' ? `
                                                <button class="btn btn-success btn-sm pay-fine-btn" data-id="${f.id}">
                                                    <i class="fas fa-money-bill"></i> Bayar
                                                </button>
                                            ` : `<span class="text-success small"><i class="fas fa-check"></i> Selesai</span>`}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            tableContainer.querySelectorAll('.pay-fine-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (confirm('Konfirmasi pembayaran denda ini telah diterima lunas?')) {
                        try {
                            await api.put(`/reports/fines/${btn.dataset.id}/pay`);
                            Components.toast('Denda berhasil ditandai lunas', 'success');
                            loadFines();
                        } catch (err) {
                            Components.toast(err.message || 'Gagal mengubah status', 'error');
                        }
                    }
                });
            });

        } catch (error) {
            console.error('Error loading fines:', error);
            statsSummary.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon bg-primary-light text-primary"><i class="fas fa-coins"></i></div>
                    <div class="stat-data">
                        <h3>Rp 0</h3>
                        <p>Total Seluruh Denda</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-success-light text-success"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-data">
                        <h3>Rp 0</h3>
                        <p>Total Denda Terbayar</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon bg-danger-light text-danger"><i class="fas fa-exclamation-circle"></i></div>
                    <div class="stat-data">
                        <h3>Rp 0</h3>
                        <p>Denda Belum Dibayar</p>
                    </div>
                </div>
            `;
            tableContainer.innerHTML = Components.emptyState('fas fa-info-circle', 'Belum Ada Denda', 'Tidak ada data denda keterlambatan saat ini.');
        }
    }

    loadFines();
}
