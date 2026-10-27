// Dashboard Page (Matching Figma Dashboard.tsx)
const DashboardPage = {
    chartInstances: {},

    async render() {
        const user = Auth.getUser();
        const app = document.getElementById('app');

        if (user?.role === 'siswa') {
            const safeNama = escapeHtml(user.nama || user.username);
            const safeNis = escapeHtml(user.nis || '-');
            const safeKelas = escapeHtml(user.kelas || 'Siswa SMP');

            app.innerHTML = `
                <div class="app-container student-dashboard">
                    ${Components.renderNavbar('dashboard')}
                    <main class="main-content">
                        <!-- Welcome Header -->
                        <div class="page-header" style="flex-wrap: wrap; gap: 1rem; align-items: flex-start;">
                            <div>
                                <h1 class="page-title">Halo, ${safeNama}</h1>
                                <p class="page-subtitle">NISN: <strong>${safeNis}</strong> · Kelas: <strong>${safeKelas}</strong> — Pantau jadwal peminjaman buku, bukti ACC, dan tenggat pengembalian.</p>
                            </div>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <a href="#katalog" class="btn btn-blue">
                                    <i class="fa-solid fa-book-open"></i>
                                    <span>Cari & Pinjam Buku</span>
                                </a>
                                <a href="#peminjaman-saya" class="btn btn-outline">
                                    <i class="fa-regular fa-calendar-check"></i>
                                    <span>Peminjaman Saya</span>
                                </a>
                            </div>
                        </div>

                        <!-- 3 Stat Summary Cards -->
                        <div class="student-summary-grid">
                            <article class="student-summary-item" onclick="window.location.hash='#peminjaman-saya'" style="cursor: pointer;">
                                <div class="student-summary-icon icon-purple"><i class="fa-solid fa-book-bookmark"></i></div>
                                <div>
                                    <div class="student-summary-label">Sedang Dipinjam</div>
                                    <strong class="student-summary-value" id="student-active-count">0</strong>
                                    <span class="student-summary-note">Buku fisik yang sedang aktif Anda bawa</span>
                                </div>
                            </article>
                            <article class="student-summary-item" onclick="window.location.hash='#peminjaman-saya'" style="cursor: pointer;">
                                <div class="student-summary-icon icon-green"><i class="fa-solid fa-circle-check"></i></div>
                                <div>
                                    <div class="student-summary-label">Siap Diambil (ACC)</div>
                                    <strong class="student-summary-value" id="student-ready-count" style="color: #16a34a;">0</strong>
                                    <span class="student-summary-note">Disetujui petugas perpustakaan</span>
                                </div>
                            </article>
                            <article class="student-summary-item" onclick="window.location.hash='#peminjaman-saya'" style="cursor: pointer;">
                                <div class="student-summary-icon icon-yellow"><i class="fa-solid fa-hourglass-start"></i></div>
                                <div>
                                    <div class="student-summary-label">Menunggu Persetujuan</div>
                                    <strong class="student-summary-value" id="student-pending-count" style="color: #d97706;">0</strong>
                                    <span class="student-summary-note">Permohonan dalam antrean verifikasi</span>
                                </div>
                            </article>
                        </div>

                        <!-- Main 2-Column Content -->
                        <div class="student-dashboard-split-grid">
                            <!-- Left: Borrowed Books & Deadlines -->
                            <div class="card student-panel-card">
                                <div class="card-header">
                                    <h2 class="card-title">
                                        <i class="fa-regular fa-calendar-check" style="color: #2563eb;"></i>
                                        <span>Tenggat & Buku yang Sedang Dipinjam</span>
                                    </h2>
                                    <a href="#peminjaman-saya" class="btn btn-outline btn-sm">Lihat Semua</a>
                                </div>
                                <div class="card-content" id="student-deadline-container">
                                    <p style="color: #94a3b8; text-align: center; padding: 2rem;">
                                        <i class="fa-solid fa-circle-notch fa-spin"></i> Memuat data tenggat...
                                    </p>
                                </div>
                            </div>

                            <!-- Right: Notifications & Decisions -->
                            <div class="card student-panel-card">
                                <div class="card-header">
                                    <h2 class="card-title">
                                        <i class="fa-solid fa-bell" style="color: #7c3aed;"></i>
                                        <span>Pemberitahuan & Keputusan Permohonan</span>
                                    </h2>
                                    <span class="badge" style="background: #f1f5f9; color: #475569;" id="student-notif-badge">0 Baru</span>
                                </div>
                                <div class="card-content" id="student-decision-container">
                                    <p style="color: #94a3b8; text-align: center; padding: 2rem;">
                                        <i class="fa-solid fa-circle-notch fa-spin"></i> Memuat pemberitahuan...
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Recommendations Section -->
                        <div class="card student-recommend-card" style="margin-top: 1.5rem;">
                            <div class="card-header">
                                <h2 class="card-title">
                                    <i class="fa-solid fa-fire" style="color: #ea580c;"></i>
                                    <span>Rekomendasi Koleksi Buku Populer</span>
                                </h2>
                                <a href="#katalog" class="btn btn-outline btn-sm">Lihat Seluruh Katalog</a>
                            </div>
                            <div class="card-content" style="padding: 1.25rem;">
                                <div id="student-recommended-grid" class="student-recommended-grid">
                                    <p style="color: #94a3b8; text-align: center; padding: 2rem; grid-column: 1 / -1;">
                                        <i class="fa-solid fa-circle-notch fa-spin"></i> Memuat rekomendasi...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            `;
            await this.loadStudentDashboard();
            return;
        }

        app.innerHTML = `
            <div class="app-container">
                ${Components.renderNavbar('dashboard')}
                <main class="main-content">
                    <div class="page-header">
                        <div>
                            <h1 class="page-title">Dashboard Perpustakaan</h1>
                            <p class="page-subtitle">Selamat datang, ${user?.nama || user?.username}! Ringkasan cepat aktivitas perpustakaan</p>
                        </div>
                        <div>
                            ${Components.renderRoleBadge(user?.role)}
                        </div>
                    </div>

                    <!-- Stats Grid -->
                    <div class="stats-grid" id="dashboard-stats-grid">
                        <div class="stat-card">
                            <div class="stat-info">
                                <div class="stat-label">Total Buku</div>
                                <div class="stat-value" id="stat-total-books">-</div>
                                <div class="stat-desc">Seluruh koleksi buku</div>
                            </div>
                            <div class="stat-icon icon-blue"><i class="fa-solid fa-book-open"></i></div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-info">
                                <div class="stat-label">Buku Baru</div>
                                <div class="stat-value" style="color: #16a34a;" id="stat-new-books">-</div>
                                <div class="stat-desc">Bulan ini</div>
                            </div>
                            <div class="stat-icon icon-green"><i class="fa-solid fa-plus"></i></div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-info">
                                <div class="stat-label">Buku Rusak</div>
                                <div class="stat-value" style="color: #ea580c;" id="stat-damaged-books">-</div>
                                <div class="stat-desc">Perlu perbaikan</div>
                            </div>
                            <div class="stat-icon icon-orange"><i class="fa-solid fa-triangle-exclamation"></i></div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-info">
                                <div class="stat-label">Buku Hilang</div>
                                <div class="stat-value" style="color: #dc2626;" id="stat-lost-books">-</div>
                                <div class="stat-desc">Buku tidak ditemukan</div>
                            </div>
                            <div class="stat-icon icon-red"><i class="fa-solid fa-trash-can"></i></div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-info">
                                <div class="stat-label">Peminjaman Aktif</div>
                                <div class="stat-value" style="color: #7c3aed;" id="stat-active-loans">-</div>
                                <div class="stat-desc">Sedang dipinjam</div>
                            </div>
                            <div class="stat-icon icon-purple"><i class="fa-solid fa-book-bookmark"></i></div>
                        </div>
                    </div>

                    <!-- Charts Grid -->
                    <div class="charts-grid">
                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <h2 class="card-title">Kondisi Fisik Buku</h2>
                                    <p class="card-description">Distribusi kondisi fisik seluruh koleksi</p>
                                </div>
                            </div>
                            <div class="card-content">
                                <div class="chart-wrapper">
                                    <canvas id="conditionChart"></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <div>
                                    <h2 class="card-title">Pertumbuhan Koleksi Buku</h2>
                                    <p class="card-description">Tren penambahan buku per bulan</p>
                                </div>
                            </div>
                            <div class="card-content">
                                <div class="chart-wrapper">
                                    <canvas id="collectionChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Content Split -->
                    <div class="charts-grid">
                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title">Distribusi Kategori</h2>
                                <a href="#kategori" class="btn btn-outline btn-sm">Kelola</a>
                            </div>
                            <div class="card-content" id="category-stats-list">
                                <div style="color: #94a3b8; text-align: center; padding: 2rem;">Memuat data kategori...</div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <h2 class="card-title">Buku Terbaru</h2>
                                <a href="#kelola-buku" class="btn btn-outline btn-sm">Lihat Semua</a>
                            </div>
                            <div class="card-content" style="padding: 0;">
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Judul Buku</th>
                                                <th>Kategori</th>
                                                <th>Kondisi</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody id="recent-books-tbody">
                                            <tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 2rem;">Memuat buku...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;

        await this.loadDashboardData();
    },

    async loadStudentDashboard() {
        try {
            const [bookingResponse, notificationResponse, booksResponse] = await Promise.all([
                API.get('/bookings/my?limit=100'),
                API.get('/notifications?limit=20'),
                API.get('/books?limit=4')
            ]);

            const bookings = bookingResponse.data?.bookings || [];
            const notifications = notificationResponse.data?.notifications || [];
            const recommendedBooks = booksResponse.data || [];

            // 1. Metric Counts
            const borrowedOnly = bookings.filter(item => ['diambil', 'terlambat'].includes(item.status));
            const approvedOnly = bookings.filter(item => item.status === 'disetujui');
            const pendingOnly = bookings.filter(item => item.status === 'pending');

            const activeCountEl = document.getElementById('student-active-count');
            const readyCountEl = document.getElementById('student-ready-count');
            const pendingCountEl = document.getElementById('student-pending-count');

            if (activeCountEl) activeCountEl.textContent = borrowedOnly.length;
            if (readyCountEl) readyCountEl.textContent = approvedOnly.length;
            if (pendingCountEl) pendingCountEl.textContent = pendingOnly.length;

            // 2. Deadlines & Active Loans
            const deadlineContainer = document.getElementById('student-deadline-container');
            if (deadlineContainer) {
                if (borrowedOnly.length === 0 && approvedOnly.length === 0) {
                    deadlineContainer.innerHTML = `
                        <div class="empty-state-box" style="text-align: center; padding: 2.25rem 1rem;">
                            <div style="width: 3.5rem; height: 3.5rem; border-radius: 50%; background: #eff6ff; color: #2563eb; display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 0.75rem;">
                                <i class="fa-solid fa-book-open"></i>
                            </div>
                            <h4 style="font-weight: 700; color: #0f172a; margin-bottom: 0.35rem; font-size: 1rem;">Tidak Ada Tanggungan Pinjaman</h4>
                            <p style="color: #64748b; font-size: 0.85rem; max-width: 380px; margin: 0 auto 1.25rem;">
                                Anda tidak memiliki buku yang sedang dipinjam saat ini. Rekam jejak peminjaman Anda sangat tertib!
                            </p>
                            <a href="#katalog" class="btn btn-blue btn-sm" style="display: inline-flex;">
                                <i class="fa-solid fa-magnifying-glass"></i> Jelajahi Buku di Katalog
                            </a>
                        </div>
                    `;
                } else {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Show approved books first (with pickup notice), then borrowed books with deadline countdown
                    let itemsHtml = '';

                    // Approved books ready for pickup
                    approvedOnly.forEach(item => {
                        const book = item.book || {};
                        const kode = item.kode_booking || `BK-${item.id}`;
                        itemsHtml += `
                            <div class="student-deadline-item deadline-approved">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.35rem;">
                                    <div style="font-weight: 700; font-size: 0.95rem; color: #0f172a;">${escapeHtml(book.judul || 'Buku')}</div>
                                    <span class="badge" style="background: #dcfce7; color: #166534;"><i class="fa-solid fa-check"></i> Siap Diambil</span>
                                </div>
                                <div style="font-size: 0.8rem; color: #475569; margin-bottom: 0.4rem;">
                                    Rak: <strong>${escapeHtml(book.lokasi_rak || 'Umum')}</strong> · Kode: <strong>${escapeHtml(kode)}</strong>
                                </div>
                                <div style="font-size: 0.825rem; color: #166534; font-weight: 600;">
                                    <i class="fa-solid fa-store"></i> Jadwal ambil: <strong>${Components.formatDate(item.tgl_ambil)}</strong>. Ambil buku di perpustakaan.
                                </div>
                            </div>
                        `;
                    });

                    // Borrowed books with countdown
                    borrowedOnly.forEach(item => {
                        const book = item.book || {};
                        const deadlineDate = new Date(item.tgl_kembali_rencana);
                        deadlineDate.setHours(0, 0, 0, 0);

                        const diffTime = deadlineDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const isOverdue = diffDays < 0 || item.status === 'terlambat';
                        const isUrgent = diffDays >= 0 && diffDays <= 2;

                        let itemClass = 'deadline-safe';
                        let badgeHtml = `<span class="badge" style="background: #dbeafe; color: #1e40af;"><i class="fa-regular fa-clock"></i> Sisa ${diffDays} Hari</span>`;
                        let messageColor = '#1d4ed8';

                        if (isOverdue) {
                            itemClass = 'deadline-late';
                            badgeHtml = `<span class="badge badge-terlambat"><i class="fa-solid fa-triangle-exclamation"></i> Terlambat ${Math.abs(diffDays)} Hari</span>`;
                            messageColor = '#b91c1c';
                        } else if (isUrgent) {
                            itemClass = 'deadline-soon';
                            badgeHtml = `<span class="badge" style="background: #fef08a; color: #854d0e;"><i class="fa-solid fa-hourglass-half"></i> Sisa ${diffDays} Hari Lagi</span>`;
                            messageColor = '#a16207';
                        }

                        itemsHtml += `
                            <div class="student-deadline-item ${itemClass}">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.35rem;">
                                    <div style="font-weight: 700; font-size: 0.95rem; color: #0f172a;">${escapeHtml(book.judul || 'Buku')}</div>
                                    ${badgeHtml}
                                </div>
                                <div style="font-size: 0.8rem; color: #475569; margin-bottom: 0.4rem;">
                                    Rak: <strong>${escapeHtml(book.lokasi_rak || 'Umum')}</strong> · Pengarang: ${escapeHtml(book.pengarang || '-')}
                                </div>
                                <div style="font-size: 0.825rem; color: ${messageColor}; font-weight: 500;">
                                    ${isOverdue 
                                        ? `<i class="fa-solid fa-triangle-exclamation"></i> Batas kembali terlewati pada <strong>${Components.formatDate(item.tgl_kembali_rencana)}</strong>. Segera kembalikan ke meja sirkulasi!`
                                        : `<i class="fa-regular fa-calendar-check"></i> Batas akhir pengembalian: <strong>${Components.formatDate(item.tgl_kembali_rencana)}</strong>.`
                                    }
                                </div>
                            </div>
                        `;
                    });

                    deadlineContainer.innerHTML = `
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${itemsHtml}
                        </div>
                    `;
                }
            }

            // 3. Decision Notifications
            const decisionBookings = bookings.filter(item => ['disetujui', 'ditolak'].includes(item.status));
            const decisionNotifs = notifications.filter(item => /disetujui|ditolak|approval|warning|booking/i.test(`${item.tipe} ${item.judul}`));

            const totalNotifs = Math.max(decisionBookings.length, decisionNotifs.length);
            const notifBadge = document.getElementById('student-notif-badge');
            if (notifBadge) notifBadge.textContent = `${totalNotifs} Pemberitahuan`;

            const decisionContainer = document.getElementById('student-decision-container');
            if (decisionContainer) {
                if (decisionBookings.length === 0 && decisionNotifs.length === 0) {
                    decisionContainer.innerHTML = `
                        <div style="text-align: center; color: #64748b; padding: 2.25rem 1rem;">
                            <i class="fa-solid fa-bell-slash" style="font-size: 2rem; color: #cbd5e1; margin-bottom: 0.75rem; display: block;"></i>
                            <h4 style="font-weight: 700; color: #0f172a; margin-bottom: 0.35rem; font-size: 1rem;">Belum Ada Pemberitahuan</h4>
                            <p style="font-size: 0.85rem; max-width: 380px; margin: 0 auto;">Pemberitahuan persetujuan atau keputusan peminjaman buku akan muncul di sini secara otomatis.</p>
                        </div>
                    `;
                } else {
                    const decisionListHtml = decisionBookings.slice(0, 4).map(item => {
                        const isApproved = item.status === 'disetujui';
                        const book = item.book || {};
                        const kode = item.kode_booking || `BK-${item.id}`;

                        return `
                            <div class="decision-alert-item ${isApproved ? 'decision-approved' : 'decision-rejected'}">
                                <div class="decision-icon ${isApproved ? 'icon-green' : 'icon-red'}">
                                    <i class="fa-solid ${isApproved ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
                                </div>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.2rem;">
                                        <strong style="color: ${isApproved ? '#14532d' : '#7f1d1d'}; font-size: 0.9rem;">
                                            ${isApproved ? 'Permohonan Peminjaman Disetujui (ACC)' : 'Permohonan Peminjaman Ditolak'}
                                        </strong>
                                        <span style="font-size: 0.75rem; color: #64748b; white-space: nowrap;">${Components.formatDate(item.updated_at || item.created_at)}</span>
                                    </div>
                                    <p style="font-size: 0.825rem; color: #334155; margin: 0 0 0.35rem 0;">
                                        Buku: <strong>${escapeHtml(book.judul || 'Buku')}</strong> · Kode: <code>${escapeHtml(kode)}</code>
                                    </p>
                                    <p style="font-size: 0.8rem; color: ${isApproved ? '#166534' : '#991b1b'}; margin: 0;">
                                        ${isApproved 
                                            ? `Jadwal ambil: <strong>${Components.formatDate(item.tgl_ambil)}</strong> di Rak <strong>${escapeHtml(book.lokasi_rak || 'Umum')}</strong>.`
                                            : `Alasan penolakan: <em>${escapeHtml(item.alasan_tolak || 'Stok tidak mencukupi atau dalam pemeliharaan.')}</em>`
                                        }
                                    </p>
                                </div>
                            </div>
                        `;
                    }).join('');

                    decisionContainer.innerHTML = `
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${decisionListHtml}
                        </div>
                    `;
                }
            }

            // 4. Book Recommendations
            const recommendedContainer = document.getElementById('student-recommended-grid');
            if (recommendedContainer) {
                if (recommendedBooks.length === 0) {
                    recommendedContainer.innerHTML = '<p style="color: #94a3b8; text-align: center; grid-column: 1 / -1;">Belum ada buku tersedia.</p>';
                } else {
                    recommendedContainer.innerHTML = recommendedBooks.map(b => {
                        const isAvailable = Number(b.stok) > 0;
                        const safeTitle = escapeHtml(b.judul || 'Buku');
                        const safeAuthor = escapeHtml(b.pengarang || '-');
                        const coverSrc = b.cover ? escapeHtml(b.cover) : null;

                        return `
                            <div class="student-rec-card">
                                <div class="student-rec-thumb">
                                    ${coverSrc ? `
                                        <img src="${coverSrc}" alt="Cover" onerror="this.parentElement.innerHTML = '<i class=\\'fa-solid fa-book\\'></i>';">
                                    ` : `
                                        <i class="fa-solid fa-book"></i>
                                    `}
                                </div>
                                <div class="student-rec-info">
                                    <span class="badge" style="background: #f1f5f9; color: #475569; font-size: 0.7rem; margin-bottom: 0.25rem; display: inline-block;">${escapeHtml(b.genre || 'Umum')}</span>
                                    <h4 class="student-rec-title" title="${safeTitle}">${safeTitle}</h4>
                                    <p class="student-rec-author">Karya: ${safeAuthor}</p>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                                        <span class="stock-pill ${isAvailable ? 'stock-available' : 'stock-empty'}" style="font-size: 0.725rem; padding: 0.15rem 0.45rem;">
                                            ${isAvailable ? `Tersedia ${b.stok}` : 'Habis'}
                                        </span>
                                        <a href="#katalog" class="btn btn-blue btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
                                            Pinjam
                                        </a>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

        } catch (error) {
            console.error('Load student dashboard error:', error);
            Components.showToast('Gagal memuat ringkasan peminjaman siswa.', 'error');
        }
    },

    async loadDashboardData() {
        try {
            const res = await API.get('/reports/dashboard');
            const data = res.data;
            const stats = data.stats;

            // Populate counters
            document.getElementById('stat-total-books').textContent = stats.totalBooks || 0;
            document.getElementById('stat-new-books').textContent = stats.newBooksThisMonth || 0;
            const damagedCount = (stats.bookConditions?.rusakRingan || 0) + (stats.bookConditions?.rusakBerat || 0);
            document.getElementById('stat-damaged-books').textContent = damagedCount;
            document.getElementById('stat-lost-books').textContent = stats.bookConditions?.hilang || 0;
            document.getElementById('stat-active-loans').textContent = stats.activeBookings || 0;

            // Render Charts
            this.renderConditionChart(data.conditionChartData || []);
            this.renderCollectionChart(data.monthlyCollectionData || []);

            // Render Category list
            this.renderCategoryList(data.categoryStats || [], stats.totalBooks || 1);

            // Render Recent Books table
            this.renderRecentBooks(data.recentBooks || []);
        } catch (error) {
            console.error('Load dashboard error:', error);
            Components.showToast('Gagal memuat beberapa data dashboard', 'error');
        }
    },

    renderConditionChart(chartData) {
        const ctx = document.getElementById('conditionChart');
        if (!ctx) return;

        if (this.chartInstances.condition) {
            this.chartInstances.condition.destroy();
        }

        const labels = chartData.map(d => d.name);
        const values = chartData.map(d => d.value);
        const colors = chartData.map(d => d.color);

        this.chartInstances.condition = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: { family: 'Plus Jakarta Sans', size: 12 }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    },

    renderCollectionChart(monthlyData) {
        const ctx = document.getElementById('collectionChart');
        if (!ctx) return;

        if (this.chartInstances.collection) {
            this.chartInstances.collection.destroy();
        }

        const labels = monthlyData.map(d => d.month);
        const koleksiData = monthlyData.map(d => d.koleksi);
        const tambahData = monthlyData.map(d => d.tambah);

        this.chartInstances.collection = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Koleksi',
                        data: koleksiData,
                        backgroundColor: '#3b82f6',
                        borderRadius: 6
                    },
                    {
                        label: 'Penambahan Buku',
                        data: tambahData,
                        backgroundColor: '#10b981',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans' } }
                    }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    renderCategoryList(categories, totalBooks) {
        const container = document.getElementById('category-stats-list');
        if (!container) return;

        if (categories.length === 0) {
            container.innerHTML = '<p style="color: #94a3b8; text-align: center;">Belum ada data kategori.</p>';
            return;
        }

        container.innerHTML = categories.slice(0, 6).map(cat => {
            const percentage = Math.round((cat.count / (totalBooks || 1)) * 100);
            return `
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.35rem;">
                        <span>${cat.name}</span>
                        <span style="color: #64748b;">${cat.count} buku (${percentage}%)</span>
                    </div>
                    <div style="height: 8px; background: #e2e8f0; border-radius: var(--radius-full); overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: #2563eb; border-radius: var(--radius-full);"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderRecentBooks(books) {
        const tbody = document.getElementById('recent-books-tbody');
        if (!tbody) return;

        if (books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 2rem;">Belum ada buku.</td></tr>';
            return;
        }

        tbody.innerHTML = books.map(book => `
            <tr>
                <td>
                    <div style="font-weight: 600; color: #0f172a;">${book.judul}</div>
                    <div style="font-size: 0.775rem; color: #64748b;">${book.pengarang}</div>
                </td>
                <td><span style="font-size: 0.85rem; color: #475569;">${book.genre || '-'}</span></td>
                <td>${Components.renderConditionBadge(book.condition || 'Baik')}</td>
                <td>${Components.renderStatusBadge(book.status || 'Tersedia')}</td>
            </tr>
        `).join('');
    }
};
