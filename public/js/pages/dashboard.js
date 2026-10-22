// Dashboard Page (Matching Figma Dashboard.tsx)
const DashboardPage = {
    chartInstances: {},

    async render() {
        const user = Auth.getUser();
        const app = document.getElementById('app');

        if (user?.role === 'siswa') {
            app.innerHTML = `
                <div class="app-container student-dashboard">
                    ${Components.renderNavbar('dashboard')}
                    <main class="main-content">
                        <div class="page-header">
                            <div>
                                <p class="eyebrow">RUANG SISWA</p>
                                <h1 class="page-title">Halo, ${user.nama || user.username}</h1>
                                <p class="page-subtitle">Pantau buku, keputusan permohonan, dan jadwal pengembalian Anda.</p>
                            </div>
                            <a href="#katalog" class="btn btn-blue"><i class="fa-solid fa-magnifying-glass"></i><span>Cari buku</span></a>
                        </div>
                        <section class="student-summary-grid" aria-label="Ringkasan peminjaman">
                            <article class="student-summary-item">
                                <span class="student-summary-icon"><i class="fa-solid fa-book-open-reader"></i></span>
                                <div><span class="student-summary-label">Sedang dipinjam</span><strong id="student-active-count">0</strong><span class="student-summary-note">buku yang sudah diambil</span></div>
                            </article>
                            <article class="student-summary-item">
                                <span class="student-summary-icon student-summary-icon-alert"><i class="fa-solid fa-bell"></i></span>
                                <div><span class="student-summary-label">Keputusan permohonan</span><strong id="student-decision-count">0</strong><span class="student-summary-note">diterima atau ditolak</span></div>
                            </article>
                            <article class="student-summary-item">
                                <span class="student-summary-icon student-summary-icon-date"><i class="fa-regular fa-calendar-check"></i></span>
                                <div><span class="student-summary-label">Tenggat terdekat</span><strong id="student-deadline-date">-</strong><span class="student-summary-note" id="student-deadline-book">Tidak ada buku yang perlu dikembalikan</span></div>
                            </article>
                        </section>
                        <section class="student-dashboard-columns">
                            <div class="student-dashboard-section">
                                <div class="student-section-heading"><div><p class="eyebrow">SIRKULASI</p><h2>Buku yang sedang dipinjam</h2></div><a href="#peminjaman-saya">Lihat semua <i class="fa-solid fa-arrow-right"></i></a></div>
                                <div id="student-active-books" class="student-list"><p class="muted-placeholder">Memuat data pinjaman...</p></div>
                            </div>
                            <div class="student-dashboard-section">
                                <div class="student-section-heading"><div><p class="eyebrow">PEMBARUAN</p><h2>Notifikasi perpustakaan</h2></div></div>
                                <div id="student-notifications" class="student-list"><p class="muted-placeholder">Memuat notifikasi...</p></div>
                            </div>
                        </section>
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
            const [bookingResponse, notificationResponse] = await Promise.all([
                API.get('/bookings/my?limit=100'),
                API.get('/notifications?limit=20')
            ]);
            const bookings = bookingResponse.data?.bookings || [];
            const notifications = notificationResponse.data?.notifications || [];

            // 1. Active Borrowed or Approved books
            const activeBooks = bookings.filter(item => ['disetujui', 'diambil', 'terlambat'].includes(item.status));
            const borrowedBadge = document.getElementById('student-borrowed-badge');
            if (borrowedBadge) borrowedBadge.textContent = `${activeBooks.length} Buku Aktif`;

            const borrowedContainer = document.getElementById('student-borrowed-container');
            if (borrowedContainer) {
                if (activeBooks.length === 0) {
                    borrowedContainer.innerHTML = `
                        <div class="empty-state-box" style="text-align: center; padding: 2.5rem 1rem;">
                            <div style="width: 3.5rem; height: 3.5rem; border-radius: 50%; background: #eff6ff; color: #2563eb; display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 0.75rem;">
                                <i class="fa-solid fa-book-open"></i>
                            </div>
                            <h4 style="font-weight: 700; color: #0f172a; margin-bottom: 0.35rem;">Tidak Ada Buku yang Sedang Dipinjam</h4>
                            <p style="color: #64748b; font-size: 0.875rem; max-width: 420px; margin: 0 auto 1.25rem;">Anda belum memiliki buku yang sedang dipinjam atau disetujui. Silakan cari buku bacaan menarik di katalog perpustakaan.</p>
                            <a href="#katalog" class="btn btn-blue btn-sm" style="display: inline-flex;">
                                <i class="fa-solid fa-magnifying-glass"></i> Jelajahi Katalog Buku
                            </a>
                        </div>
                    `;
                } else {
                    borrowedContainer.innerHTML = `
                        <div class="student-borrowed-list" style="display: flex; flex-direction: column; gap: 0.85rem;">
                            ${activeBooks.map(item => {
                                const book = item.book || {};
                                const isApproved = item.status === 'disetujui';
                                const isLate = item.status === 'terlambat';

                                return `
                                    <div class="student-book-item ${isApproved ? 'is-approved-item' : ''}" style="display: flex; gap: 1rem; align-items: center; padding: 0.85rem 1rem; border-radius: var(--radius); border: 1px solid ${isApproved ? '#bbf7d0' : (isLate ? '#fecaca' : 'var(--border)')}; background: ${isApproved ? '#f0fdf4' : (isLate ? '#fef2f2' : '#ffffff')};">
                                        <div style="width: 48px; height: 64px; flex-shrink: 0; border-radius: 4px; overflow: hidden; background: #e2e8f0; display: flex; align-items: center; justify-content: center;">
                                            ${book.cover ? `<img src="${book.cover}" alt="${book.judul}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i class="fa-solid fa-book" style="color: #94a3b8; font-size: 1.25rem;"></i>`}
                                        </div>
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.25rem;">
                                                <h4 style="font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                                    ${book.judul || 'Buku Perpustakaan'}
                                                </h4>
                                                ${Components.renderStatusBadge(item.status)}
                                            </div>
                                            <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.35rem;">
                                                ${book.pengarang || '-'} · Rak: <strong>${book.lokasi_rak || 'Umum'}</strong>
                                            </div>
                                            <div style="font-size: 0.825rem; font-weight: 500;">
                                                ${isApproved
                                                    ? `<span style="color: #166534;"><i class="fa-solid fa-circle-check"></i> Sudah di-ACC! Silakan ambil di perpustakaan pada: <strong>${Components.formatDate(item.tgl_ambil)}</strong></span>`
                                                    : `<span style="color: ${isLate ? '#dc2626' : '#2563eb'};"><i class="fa-regular fa-clock"></i> Batas Pengembalian: <strong>${Components.formatDate(item.tgl_kembali_rencana)}</strong></span>`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                }
            }

            // 2. Decision Notifications (Accepted / Rejected)
            const decisionBookings = bookings.filter(item => ['disetujui', 'ditolak'].includes(item.status));
            const decisionNotifs = notifications.filter(item => /disetujui|ditolak|approval|warning/i.test(`${item.tipe} ${item.judul}`));
            
            const totalDecisions = Math.max(decisionBookings.length, decisionNotifs.length);
            const notifBadge = document.getElementById('student-notif-badge');
            if (notifBadge) notifBadge.textContent = `${totalDecisions} Pemberitahuan`;

            const decisionContainer = document.getElementById('student-decision-container');
            if (decisionContainer) {
                if (decisionBookings.length === 0 && decisionNotifs.length === 0) {
                    decisionContainer.innerHTML = `
                        <div style="text-align: center; color: #64748b; padding: 2rem;">
                            <i class="fa-solid fa-bell-slash" style="font-size: 2rem; color: #cbd5e1; margin-bottom: 0.75rem; display: block;"></i>
                            <p style="font-size: 0.875rem;">Belum ada notifikasi keputusan peminjaman yang diterima atau ditolak.</p>
                        </div>
                    `;
                } else {
                    // Combine into structured decision list
                    const decisionListHtml = decisionBookings.slice(0, 5).map(item => {
                        const isApproved = item.status === 'disetujui';
                        const book = item.book || {};
                        return `
                            <div class="decision-alert-item" style="display: flex; gap: 0.85rem; padding: 0.85rem; border-radius: var(--radius); margin-bottom: 0.75rem; background: ${isApproved ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${isApproved ? '#16a34a' : '#ef4444'};">
                                <div style="color: ${isApproved ? '#16a34a' : '#dc2626'}; font-size: 1.15rem; margin-top: 0.15rem;">
                                    <i class="fa-solid ${isApproved ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
                                </div>
                                <div style="flex: 1;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                                        <strong style="color: ${isApproved ? '#14532d' : '#7f1d1d'}; font-size: 0.9rem;">
                                            ${isApproved ? 'Permohonan Peminjaman Disetujui! ✅' : 'Permohonan Peminjaman Ditolak ❌'}
                                        </strong>
                                        <span style="font-size: 0.75rem; color: #64748b;">${Components.formatDate(item.updated_at || item.created_at)}</span>
                                    </div>
                                    <p style="font-size: 0.825rem; color: #334155; margin: 0 0 0.35rem 0;">
                                        Buku: <strong>${book.judul || 'Buku Perpustakaan'}</strong>
                                    </p>
                                    <p style="font-size: 0.8rem; color: ${isApproved ? '#166534' : '#991b1b'}; margin: 0;">
                                        ${isApproved 
                                            ? `Pihak perpustakaan telah menyetujui permohonan Anda. Jadwal ambil: <strong>${Components.formatDate(item.tgl_ambil)}</strong>. Batas kembali: <strong>${Components.formatDate(item.tgl_kembali_rencana)}</strong>.`
                                            : `Alasan penolakan: <em>${item.alasan_tolak || 'Stok tidak mencukupi atau sedang dalam pemeliharaan.'}</em>`
                                        }
                                    </p>
                                </div>
                            </div>
                        `;
                    }).join('');

                    decisionContainer.innerHTML = decisionListHtml;
                }
            }

            // 3. Return Deadline Reminders
            const borrowedOnly = bookings.filter(item => ['diambil', 'terlambat'].includes(item.status));
            const deadlineContainer = document.getElementById('student-deadline-container');
            if (deadlineContainer) {
                if (borrowedOnly.length === 0) {
                    deadlineContainer.innerHTML = `
                        <div style="padding: 1rem 1.25rem; border-radius: var(--radius); background: #f0fdf4; border: 1px solid #bbf7d0; display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1rem;">
                            <i class="fa-solid fa-circle-check" style="font-size: 1.5rem; color: #16a34a;"></i>
                            <div>
                                <strong style="color: #14532d; display: block; font-size: 0.9rem;">Tidak Ada Tanggungan Pengembalian</strong>
                                <span style="font-size: 0.825rem; color: #166534;">Anda tidak memiliki buku yang sedang dipinjam saat ini. Rekam jejak peminjaman Anda tertib!</span>
                            </div>
                        </div>
                        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius); padding: 0.85rem 1rem; font-size: 0.8rem; color: #64748b;">
                            <strong style="color: #334155; display: block; margin-bottom: 0.25rem;"><i class="fa-solid fa-circle-info"></i> Ketentuan Pengembalian Buku:</strong>
                            <ul style="margin: 0; padding-left: 1.25rem; line-height: 1.6;">
                                <li>Durasi peminjaman standar perpustakaan adalah <strong>7 hari kalender</strong> sejak tanggal pengambilan.</li>
                                <li>Pengembalian melewati batas tempo dikenakan denda administrasi.</li>
                                <li>Kembalikan buku dalam kondisi fisik yang baik dan terawat tanpa coretan atau robekan.</li>
                            </ul>
                        </div>
                    `;
                } else {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const deadlineCards = borrowedOnly.map(item => {
                        const book = item.book || {};
                        const deadlineDate = new Date(item.tgl_kembali_rencana);
                        deadlineDate.setHours(0, 0, 0, 0);

                        const diffTime = deadlineDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const isOverdue = diffDays < 0 || item.status === 'terlambat';
                        const isUrgent = diffDays >= 0 && diffDays <= 2;

                        let alertClass = 'deadline-safe';
                        let alertBg = '#eff6ff';
                        let alertBorder = '#bfdbfe';
                        let alertColor = '#1d4ed8';
                        let alertBadge = `<span class="badge" style="background: #dbeafe; color: #1e40af;"><i class="fa-regular fa-clock"></i> Tersisa ${diffDays} Hari</span>`;
                        let alertIcon = 'fa-calendar-check';

                        if (isOverdue) {
                            alertClass = 'deadline-late';
                            alertBg = '#fef2f2';
                            alertBorder = '#fecaca';
                            alertColor = '#b91c1c';
                            alertBadge = `<span class="badge badge-terlambat"><i class="fa-solid fa-triangle-exclamation"></i> TERLAMBAT ${Math.abs(diffDays)} HARI</span>`;
                            alertIcon = 'fa-triangle-exclamation';
                        } else if (isUrgent) {
                            alertClass = 'deadline-soon';
                            alertBg = '#fefce8';
                            alertBorder = '#fef08a';
                            alertColor = '#a16207';
                            alertBadge = `<span class="badge" style="background: #fef08a; color: #854d0e;"><i class="fa-solid fa-hourglass-half"></i> Sisa ${diffDays} Hari Lagi</span>`;
                            alertIcon = 'fa-hourglass-half';
                        }

                        return `
                            <div style="padding: 1rem; border-radius: var(--radius); background: ${alertBg}; border: 1px solid ${alertBorder}; margin-bottom: 0.75rem;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.35rem;">
                                    <div style="font-weight: 700; font-size: 0.95rem; color: #0f172a;">
                                        ${book.judul || 'Buku Perpustakaan'}
                                    </div>
                                    ${alertBadge}
                                </div>
                                <div style="font-size: 0.825rem; color: #475569; margin-bottom: 0.5rem;">
                                    Pengarang: ${book.pengarang || '-'} · Rak: ${book.lokasi_rak || '-'}
                                </div>
                                <div style="font-size: 0.85rem; color: ${alertColor}; font-weight: 500;">
                                    ${isOverdue 
                                        ? `<i class="fa-solid ${alertIcon}"></i> Batas pengembalian telah terlewat pada <strong>${Components.formatDate(item.tgl_kembali_rencana)}</strong>. Segera kembalikan ke perpustakaan untuk menghentikan akumulasi denda!`
                                        : (isUrgent 
                                            ? `<i class="fa-solid ${alertIcon}"></i> Segera kembalikan sebelum <strong>${Components.formatDate(item.tgl_kembali_rencana)}</strong> agar tidak terkena denda keterlambatan.`
                                            : `<i class="fa-solid ${alertIcon}"></i> Batas akhir pengembalian adalah <strong>${Components.formatDate(item.tgl_kembali_rencana)}</strong>.`
                                        )
                                    }
                                </div>
                            </div>
                        `;
                    }).join('');

                    deadlineContainer.innerHTML = `
                        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                            ${deadlineCards}
                        </div>
                        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius); padding: 0.75rem 1rem; font-size: 0.775rem; color: #64748b; margin-top: 0.5rem;">
                            <i class="fa-solid fa-bell"></i> <em>Tip: Kembalikan buku tepat waktu langsung ke meja sirkulasi perpustakaan untuk menjaga catatan keaktifan Anda.</em>
                        </div>
                    `;
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
