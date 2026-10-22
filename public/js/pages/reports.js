// Reports Page (Matching Figma Reports.tsx) - Accessible by Admin & Pimpinan
const ReportsPage = {
    chartInstances: {},
    books: [],
    bookings: [],

    async render() {
        const user = Auth.getUser();
        if (user.role !== 'admin' && user.role !== 'pimpinan') {
            window.location.hash = '#dashboard';
            return;
        }

        const currentYear = new Date().getFullYear();
        const yearsOptions = [currentYear, currentYear - 1, currentYear - 2].map(y => `<option value="${y}">${y}</option>`).join('');

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="app-container">
                ${Components.renderNavbar('laporan')}
                <main class="main-content">
                    <div class="page-header">
                        <div>
                            <h1 class="page-title">Laporan Perpustakaan</h1>
                            <p class="page-subtitle">Statistik komprehensif inventaris, kondisi buku, dan aktivitas sirkulasi</p>
                        </div>
                        <div style="display: flex; gap: 0.5rem;" class="no-print">
                            <button class="btn btn-outline" onclick="ReportsPage.exportCSV()">
                                <i class="fa-solid fa-file-csv"></i>
                                <span>Export CSV</span>
                            </button>
                            <button class="btn btn-blue" onclick="window.print()">
                                <i class="fa-solid fa-print"></i>
                                <span>Cetak Laporan</span>
                            </button>
                        </div>
                    </div>

                    <!-- Filter Toolbar -->
                    <div class="card no-print">
                        <div class="card-content" style="padding: 1rem 1.25rem;">
                            <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <label class="form-label" style="margin-bottom: 0;">Periode:</label>
                                    <select id="rep-period" class="form-select" style="width: auto;">
                                        <option value="all">Semua Data</option>
                                        <option value="year">Tahunan</option>
                                        <option value="month">Bulanan</option>
                                    </select>
                                </div>

                                <div id="rep-year-wrap" style="display: none; align-items: center; gap: 0.5rem;">
                                    <label class="form-label" style="margin-bottom: 0;">Tahun:</label>
                                    <select id="rep-year" class="form-select" style="width: auto;">
                                        ${yearsOptions}
                                    </select>
                                </div>

                                <div id="rep-month-wrap" style="display: none; align-items: center; gap: 0.5rem;">
                                    <label class="form-label" style="margin-bottom: 0;">Bulan:</label>
                                    <select id="rep-month" class="form-select" style="width: auto;">
                                        <option value="1">Januari</option>
                                        <option value="2">Februari</option>
                                        <option value="3">Maret</option>
                                        <option value="4">April</option>
                                        <option value="5">Mei</option>
                                        <option value="6">Juni</option>
                                        <option value="7">Juli</option>
                                        <option value="8">Agustus</option>
                                        <option value="9">September</option>
                                        <option value="10">Oktober</option>
                                        <option value="11">November</option>
                                        <option value="12">Desember</option>
                                    </select>
                                </div>

                                <button class="btn btn-primary btn-sm" onclick="ReportsPage.loadReportData()">
                                    <i class="fa-solid fa-filter"></i> Terapkan Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Print Title (Only shows in print) -->
                    <div class="print-header" style="display: none;">
                        <h2>LAPORAN SISTEM PERPUSTAKAAN</h2>
                        <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID')} | Petugas: ${user.nama} (${user.role})</p>
                    </div>

                    <!-- Summary KPI Cards -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-info">
                                <div class="stat-label">Total Koleksi</div>
                                <div class="stat-value" id="rep-total-books">0</div>
                                <div class="stat-desc">Judul buku terdaftar</div>
                            </div>
                            <div class="stat-icon icon-blue"><i class="fa-solid fa-book-open"></i></div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-info">
                                <div class="stat-label">Buku Tersedia</div>
                                <div class="stat-value" style="color: #16a34a;" id="rep-avail-books">0</div>
                                <div class="stat-desc">Dapat dipinjam</div>
                            </div>
                            <div class="stat-icon icon-green"><i class="fa-solid fa-check"></i></div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-info">
                                <div class="stat-label">Buku Dipinjam</div>
                                <div class="stat-value" style="color: #7c3aed;" id="rep-borrowed-books">0</div>
                                <div class="stat-desc">Buku di tangan anggota</div>
                            </div>
                            <div class="stat-icon icon-purple"><i class="fa-solid fa-book-bookmark"></i></div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-info">
                                <div class="stat-label">Total Rusak & Hilang</div>
                                <div class="stat-value" style="color: #dc2626;" id="rep-damaged-books">0</div>
                                <div class="stat-desc">Perlu pemeliharaan</div>
                            </div>
                            <div class="stat-icon icon-red"><i class="fa-solid fa-triangle-exclamation"></i></div>
                        </div>
                    </div>

                    <!-- Charts Grid -->
                    <div class="charts-grid">
                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title">Distribusi Kategori Buku</h2>
                            </div>
                            <div class="card-content">
                                <div class="chart-wrapper">
                                    <canvas id="repCategoryChart"></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title">Kondisi Fisik Koleksi</h2>
                            </div>
                            <div class="card-content">
                                <div class="chart-wrapper">
                                    <canvas id="repConditionChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Data Tables -->
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">Data Rekapitulasi Koleksi Buku</h2>
                        </div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Kode</th>
                                        <th>Judul Buku</th>
                                        <th>Pengarang</th>
                                        <th>Kategori</th>
                                        <th>Stok</th>
                                        <th>Kondisi</th>
                                        <th>Status</th>
                                        <th>Rak</th>
                                    </tr>
                                </thead>
                                <tbody id="rep-books-tbody">
                                    <tr><td colspan="8" style="text-align: center; padding: 2rem;">Memuat data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title">Riwayat Sirkulasi Peminjaman</h2>
                        </div>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Peminjam</th>
                                        <th>Judul Buku</th>
                                        <th>Tgl Ambil</th>
                                        <th>Rencana Kembali</th>
                                        <th>Status</th>
                                        <th>Denda</th>
                                    </tr>
                                </thead>
                                <tbody id="rep-bookings-tbody">
                                    <tr><td colspan="6" style="text-align: center; padding: 2rem;">Memuat data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        `;

        this.setupPeriodFilters();
        await this.loadReportData();
    },

    setupPeriodFilters() {
        const periodSelect = document.getElementById('rep-period');
        const yearWrap = document.getElementById('rep-year-wrap');
        const monthWrap = document.getElementById('rep-month-wrap');

        periodSelect.addEventListener('change', () => {
            const val = periodSelect.value;
            if (val === 'year') {
                yearWrap.style.display = 'flex';
                monthWrap.style.display = 'none';
            } else if (val === 'month') {
                yearWrap.style.display = 'flex';
                monthWrap.style.display = 'flex';
            } else {
                yearWrap.style.display = 'none';
                monthWrap.style.display = 'none';
            }
        });
    },

    async loadReportData() {
        const period = document.getElementById('rep-period')?.value || 'all';
        const year = document.getElementById('rep-year')?.value || '';
        const month = document.getElementById('rep-month')?.value || '';

        try {
            const res = await API.get(`/reports/full?period=${period}&year=${year}&month=${month}`);
            const data = res.data || {};
            this.books = data.books || [];
            this.bookings = data.bookings || [];

            this.updateSummary();
            this.renderCharts();
            this.renderTables();
        } catch (error) {
            console.error('Load report error:', error);
            Components.showToast('Gagal memuat data laporan', 'error');
        }
    },

    updateSummary() {
        const total = this.books.length;
        const available = this.books.filter(b => (b.stok > 0) && (b.status === 'Tersedia')).length;
        const borrowed = this.bookings.filter(b => b.status === 'diambil' || b.status === 'disetujui').length;
        const damaged = this.books.filter(b => b.condition === 'Rusak Ringan' || b.condition === 'Rusak Berat' || b.condition === 'Hilang').length;

        document.getElementById('rep-total-books').textContent = total;
        document.getElementById('rep-avail-books').textContent = available;
        document.getElementById('rep-borrowed-books').textContent = borrowed;
        document.getElementById('rep-damaged-books').textContent = damaged;
    },

    renderCharts() {
        // Category distribution
        const catMap = {};
        this.books.forEach(b => {
            const g = b.genre || 'Lainnya';
            catMap[g] = (catMap[g] || 0) + 1;
        });

        const catLabels = Object.keys(catMap);
        const catValues = Object.values(catMap);

        const ctxCat = document.getElementById('repCategoryChart');
        if (ctxCat) {
            if (this.chartInstances.category) this.chartInstances.category.destroy();
            this.chartInstances.category = new Chart(ctxCat, {
                type: 'bar',
                data: {
                    labels: catLabels,
                    datasets: [{
                        label: 'Jumlah Koleksi',
                        data: catValues,
                        backgroundColor: '#3b82f6',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

        // Condition distribution
        let baik = 0, ringan = 0, berat = 0, hilang = 0;
        this.books.forEach(b => {
            const c = b.condition || 'Baik';
            if (c === 'Baik') baik++;
            else if (c === 'Rusak Ringan') ringan++;
            else if (c === 'Rusak Berat') berat++;
            else if (c === 'Hilang') hilang++;
        });

        const ctxCond = document.getElementById('repConditionChart');
        if (ctxCond) {
            if (this.chartInstances.condition) this.chartInstances.condition.destroy();
            this.chartInstances.condition = new Chart(ctxCond, {
                type: 'doughnut',
                data: {
                    labels: ['Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang'],
                    datasets: [{
                        data: [baik, ringan, berat, hilang],
                        backgroundColor: ['#22c55e', '#eab308', '#f97316', '#ef4444'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    },
                    cutout: '65%'
                }
            });
        }
    },

    renderTables() {
        const tbodyBooks = document.getElementById('rep-books-tbody');
        if (tbodyBooks) {
            if (this.books.length === 0) {
                tbodyBooks.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem;">Tidak ada buku.</td></tr>`;
            } else {
                tbodyBooks.innerHTML = this.books.map(b => `
                    <tr>
                        <td><code>${b.kode_buku || ('BK-' + b.id)}</code></td>
                        <td><strong>${b.judul}</strong></td>
                        <td>${b.pengarang}</td>
                        <td>${b.genre}</td>
                        <td>${b.stok}</td>
                        <td>${Components.renderConditionBadge(b.condition || 'Baik')}</td>
                        <td>${Components.renderStatusBadge(b.status || 'Tersedia')}</td>
                        <td>${b.lokasi_rak || '-'}</td>
                    </tr>
                `).join('');
            }
        }

        const tbodyBookings = document.getElementById('rep-bookings-tbody');
        if (tbodyBookings) {
            if (this.bookings.length === 0) {
                tbodyBookings.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Tidak ada riwayat peminjaman.</td></tr>`;
            } else {
                tbodyBookings.innerHTML = this.bookings.map(item => `
                    <tr>
                        <td><strong>${item.user?.nama || item.user?.username || 'Siswa'}</strong></td>
                        <td>${item.book?.judul || '-'}</td>
                        <td>${Components.formatDate(item.tgl_ambil)}</td>
                        <td>${Components.formatDate(item.tgl_kembali_rencana)}</td>
                        <td>${Components.renderStatusBadge(item.status)}</td>
                        <td>${item.return?.denda ? 'Rp ' + Number(item.return.denda).toLocaleString('id-ID') : '-'}</td>
                    </tr>
                `).join('');
            }
        }
    },

    exportCSV() {
        if (this.books.length === 0) {
            Components.showToast('Tidak ada data untuk diekspor', 'info');
            return;
        }

        let csv = 'Kode,Judul,Pengarang,Penerbit,Kategori,Stok,Kondisi,Status,Lokasi Rak\n';
        this.books.forEach(b => {
            const row = [
                b.kode_buku || ('BK-' + b.id),
                `"${(b.judul || '').replace(/"/g, '""')}"`,
                `"${(b.pengarang || '').replace(/"/g, '""')}"`,
                `"${(b.penerbit || '').replace(/"/g, '""')}"`,
                b.genre || '',
                b.stok || 0,
                b.condition || 'Baik',
                b.status || 'Tersedia',
                b.lokasi_rak || ''
            ];
            csv += row.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `laporan_koleksi_perpustakaan_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Components.showToast('File CSV berhasil diunduh', 'success');
    }
};
