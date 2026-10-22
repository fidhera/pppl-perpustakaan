// Admin Dashboard Page
async function renderAdminDashboardPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
        ${Components.header()}
        <main class="main-content">
            <div class="container">
                <div class="page-header">
                    <div>
                        <h1 class="page-title"><i class="fas fa-chart-line"></i> Dashboard Admin</h1>
                        <p class="page-subtitle">Ringkasan statistik peminjaman dan aktivitas perpustakaan</p>
                    </div>
                </div>

                <div id="dashboard-content">
                    ${Components.loadingSpinner()}
                </div>
            </div>
        </main>
        ${Components.footer()}
    `;

    Components.initHeaderEvents();

    const container = document.getElementById('dashboard-content');

    try {
        const res = await api.get('/reports/dashboard');
        if (!res.success) {
            container.innerHTML = Components.emptyState('fas fa-exclamation-triangle', 'Gagal Memuat Dashboard');
            return;
        }

        const stats = res.data;

        container.innerHTML = `
            <div class="dashboard-stats-grid">
                <div class="stat-card">
                    <div class="stat-icon bg-primary-light text-primary">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="stat-data">
                        <h3>${stats.totalBooks || 0}</h3>
                        <p>Total Judul Buku</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon bg-success-light text-success">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-data">
                        <h3>${stats.totalStudents || 0}</h3>
                        <p>Total Siswa Terdaftar</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon bg-warning-light text-warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-data">
                        <h3>${stats.pendingBookings || 0}</h3>
                        <p>Booking Menunggu Persetujuan</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon bg-info-light text-info">
                        <i class="fas fa-hand-holding"></i>
                    </div>
                    <div class="stat-data">
                        <h3>${stats.activeLoans || 0}</h3>
                        <p>Buku Sedang Dipinjam</p>
                    </div>
                </div>
            </div>

            <!-- Quick Access Nav -->
            <div class="card p-4 mt-4">
                <h3 class="card-title mb-3"><i class="fas fa-bolt"></i> Menu Cepat Pengelolaan</h3>
                <div class="quick-nav-grid">
                    <a href="#/admin/bookings" class="quick-nav-item">
                        <i class="fas fa-tasks"></i>
                        <span>Kelola Booking Masuk</span>
                    </a>
                    <a href="#/admin/books" class="quick-nav-item">
                        <i class="fas fa-book-medical"></i>
                        <span>Kelola & Tambah Buku</span>
                    </a>
                    <a href="#/admin/users" class="quick-nav-item">
                        <i class="fas fa-user-graduate"></i>
                        <span>Manajemen Siswa</span>
                    </a>
                    <a href="#/admin/reports" class="quick-nav-item">
                        <i class="fas fa-file-invoice"></i>
                        <span>Laporan & Denda</span>
                    </a>
                </div>
            </div>
        `;
    } catch (e) {
        container.innerHTML = Components.emptyState('fas fa-exclamation-triangle', 'Error', e.message);
    }
}
