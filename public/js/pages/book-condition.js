// Book Condition Monitoring Page (Enhanced with Deep Explanation & Title/Copy Views)
const BookConditionPage = {
    copies: [],
    booksSummary: [],
    filterCondition: 'all',
    searchQuery: '',
    currentTab: 'copies', // 'copies' or 'titles'
    selectedBookFilter: null,
    isExplainerOpen: false,

    async render() {
        const user = Auth.getUser();
        if (user.role !== 'admin' && user.role !== 'pimpinan') {
            window.location.hash = '#dashboard';
            return;
        }

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="app-container">
                ${Components.renderNavbar('kondisi-buku')}
                <main class="main-content">
                    <!-- Page Header -->
                    <div class="page-header" style="margin-bottom: 1.5rem;">
                        <div>
                            <h1 class="page-title">Monitoring Kondisi Buku</h1>
                            <p class="page-subtitle">Pencatatan kondisi fisik berbasis eksemplar (copy-level) untuk akurasi inventaris perpustakaan.</p>
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                            <button class="btn btn-outline" id="btn-toggle-explainer" onclick="BookConditionPage.toggleExplainer()">
                                <i class="fa-solid fa-lightbulb"></i>
                                <span id="explainer-toggle-text">${this.isExplainerOpen ? 'Sembunyikan Panduan' : 'Panduan Sistem Eksemplar'}</span>
                                <i class="fa-solid ${this.isExplainerOpen ? 'fa-chevron-up' : 'fa-chevron-down'}" id="explainer-chevron-icon"></i>
                            </button>
                            <button class="btn btn-blue" onclick="BookConditionPage.refreshData()">
                                <i class="fa-solid fa-rotate"></i>
                                <span>Segarkan Data</span>
                            </button>
                        </div>
                    </div>

                    <!-- PANDUAN / PENJELASAN LOGIKA SISTEM INVENTARIS (COLLAPSIBLE) -->
                    <section class="condition-explainer-card" id="condition-explainer-section">
                        <div class="explainer-toggle-header ${this.isExplainerOpen ? 'is-open' : ''}" onclick="BookConditionPage.toggleExplainer()">
                            <div class="explainer-header-left">
                                <div class="explainer-icon-circle">
                                    <i class="fa-solid fa-lightbulb"></i>
                                </div>
                                <div>
                                    <div class="explainer-header-title">
                                        <span>Konsep Inventaris Eksemplar Fisik Perpustakaan</span>
                                        <span class="explainer-header-tag">Panduan Sistem</span>
                                    </div>
                                    <div class="explainer-header-subtitle">
                                        Mengapa kondisi dicatat per eksemplar fisik unik (barcode), bukan dipukul rata per judul buku?
                                    </div>
                                </div>
                            </div>
                            <button type="button" class="explainer-toggle-btn">
                                <span id="explainer-btn-inner-text">${this.isExplainerOpen ? 'Tutup' : 'Pelajari Lebih Lanjut'}</span>
                                <i class="fa-solid ${this.isExplainerOpen ? 'fa-chevron-up' : 'fa-chevron-down'}" id="explainer-inner-chevron"></i>
                            </button>
                        </div>

                        <div class="explainer-body" id="explainer-body-content" style="${this.isExplainerOpen ? '' : 'display: none;'}">
                            <p class="explainer-lead">
                                Dalam standar pengelolaan perpustakaan, <strong>satu judul buku tidak pernah dianggap sebagai satu kesatuan fisik tunggal</strong> jika memiliki lebih dari 1 stok. 
                                Contohnya buku <em>"Laskar Pelangi"</em> dengan 10 stok memiliki <strong>10 eksemplar fisik berbeda</strong> (Nomor Barcode: LP-001 s/d LP-010). Tiap eksemplar memiliki riwayat peminjaman dan kondisi keausan masing-masing.
                            </p>

                            <div class="condition-case-study">
                                <div class="case-study-title"><i class="fa-solid fa-shuffle"></i> Simulasi Kasus Nyata (10 Eksemplar dari 1 Judul yang Sama):</div>
                                <div class="case-study-grid">
                                    <div class="case-box case-good">
                                        <div class="case-box-header">
                                            <span class="badge badge-baik"><i class="fa-solid fa-check-circle"></i> Baik</span>
                                            <strong style="color: #16a34a; font-size: 0.85rem;">7 Eksemplar (70%)</strong>
                                        </div>
                                        <p class="case-box-desc">Halaman lengkap, cover mulus, jilid utuh. <strong>Siap dipinjamkan dibawa pulang oleh siswa.</strong></p>
                                        <div class="case-code-pill">Contoh: LP-001 s/d LP-007</div>
                                    </div>

                                    <div class="case-box case-light">
                                        <div class="case-box-header">
                                            <span class="badge badge-rusak-ringan"><i class="fa-solid fa-triangle-exclamation"></i> Rusak Ringan</span>
                                            <strong style="color: #ca8a04; font-size: 0.85rem;">2 Eksemplar (20%)</strong>
                                        </div>
                                        <p class="case-box-desc">Cover lecet, lipatan sudut, coretan kecil. <strong>Disarankan baca di tempat atau butuh perbaikan lakban/lem.</strong></p>
                                        <div class="case-code-pill">Contoh: LP-008 & LP-009</div>
                                    </div>

                                    <div class="case-box case-heavy">
                                        <div class="case-box-header">
                                            <span class="badge badge-rusak-berat"><i class="fa-solid fa-circle-exclamation"></i> Rusak Berat</span>
                                            <strong style="color: #ea580c; font-size: 0.85rem;">1 Eksemplar (10%)</strong>
                                        </div>
                                        <p class="case-box-desc">Halaman robek hilang, jilid terlepas, atau basah. <strong>Ditarik sementara dari sirkulasi untuk reparasi total.</strong></p>
                                        <div class="case-code-pill">Contoh: LP-010</div>
                                    </div>
                                </div>
                            </div>

                            <div class="explainer-benefits-grid">
                                <div class="benefit-item">
                                    <div class="benefit-icon"><i class="fa-solid fa-shield-halved"></i></div>
                                    <div>
                                        <strong>1. Proteksi & Keadilan Siswa</strong>
                                        <p>Peminjam tidak akan dituduh merusak buku jika kondisi sobek/lecet sudah tercatat dalam sistem sejak awal penyerahan.</p>
                                    </div>
                                </div>
                                <div class="benefit-item">
                                    <div class="benefit-icon"><i class="fa-solid fa-circle-check"></i></div>
                                    <div>
                                        <strong>2. Kontrol Mutu Sirkulasi</strong>
                                        <p>Pustakawan memastikan hanya eksemplar dalam kondisi 'Baik' yang diserahkan untuk peminjaman ke rumah.</p>
                                    </div>
                                </div>
                                <div class="benefit-item">
                                    <div class="benefit-icon"><i class="fa-solid fa-chart-pie"></i></div>
                                    <div>
                                        <strong>3. Akurasi Inventaris & Anggaran</strong>
                                        <p>Pimpinan sekolah memiliki statistik akurat berapa buku yang perlu diperbaiki atau diganti tanpa audit fisik manual.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- 4 Condition Stats Grid (Clickable Filters) -->
                    <div class="stats-grid" style="margin-top: 1rem;">
                        <div class="stat-card clickable ${this.filterCondition === 'Baik' ? 'active-filter' : ''}" id="card-filter-baik" onclick="BookConditionPage.filterByCard('Baik')" title="Klik untuk filter kondisi Baik">
                            <div class="stat-info">
                                <div class="stat-label">Kondisi Baik</div>
                                <div class="stat-value" style="color: #16a34a;" id="bc-count-baik">0</div>
                                <div class="stat-desc">Siap dipinjamkan keluar</div>
                            </div>
                            <div class="stat-icon icon-green"><i class="fa-solid fa-check-circle"></i></div>
                        </div>

                        <div class="stat-card clickable ${this.filterCondition === 'Rusak Ringan' ? 'active-filter' : ''}" id="card-filter-ringan" onclick="BookConditionPage.filterByCard('Rusak Ringan')" title="Klik untuk filter Rusak Ringan">
                            <div class="stat-info">
                                <div class="stat-label">Rusak Ringan</div>
                                <div class="stat-value" style="color: #ca8a04;" id="bc-count-ringan">0</div>
                                <div class="stat-desc">Butuh perbaikan kecil</div>
                            </div>
                            <div class="stat-icon icon-yellow"><i class="fa-solid fa-triangle-exclamation"></i></div>
                        </div>

                        <div class="stat-card clickable ${this.filterCondition === 'Rusak Berat' ? 'active-filter' : ''}" id="card-filter-berat" onclick="BookConditionPage.filterByCard('Rusak Berat')" title="Klik untuk filter Rusak Berat">
                            <div class="stat-info">
                                <div class="stat-label">Rusak Berat</div>
                                <div class="stat-value" style="color: #ea580c;" id="bc-count-berat">0</div>
                                <div class="stat-desc">Perlu rekondisi / ditarik</div>
                            </div>
                            <div class="stat-icon icon-orange"><i class="fa-solid fa-circle-exclamation"></i></div>
                        </div>

                        <div class="stat-card clickable ${this.filterCondition === 'Hilang' ? 'active-filter' : ''}" id="card-filter-hilang" onclick="BookConditionPage.filterByCard('Hilang')" title="Klik untuk filter Hilang">
                            <div class="stat-info">
                                <div class="stat-label">Buku Hilang</div>
                                <div class="stat-value" style="color: #dc2626;" id="bc-count-hilang">0</div>
                                <div class="stat-desc">Dalam proses ganti rugi</div>
                            </div>
                            <div class="stat-icon icon-red"><i class="fa-solid fa-circle-xmark"></i></div>
                        </div>
                    </div>

                    <!-- Dual Tab View -->
                    <div class="card" style="margin-top: 1.5rem;">
                        <div class="card-header" style="flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); padding: 1rem 1.25rem;">
                            <div>
                                <div class="tabs-nav-group">
                                    <button class="tab-nav-btn ${this.currentTab === 'copies' ? 'active' : ''}" id="btn-tab-copies" onclick="BookConditionPage.switchTab('copies')">
                                        <i class="fa-solid fa-barcode"></i> Rincian Eksemplar Fisik
                                    </button>
                                    <button class="tab-nav-btn ${this.currentTab === 'titles' ? 'active' : ''}" id="btn-tab-titles" onclick="BookConditionPage.switchTab('titles')">
                                        <i class="fa-solid fa-book-bookmark"></i> Ringkasan per Judul Buku
                                    </button>
                                </div>
                            </div>

                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                                <div class="search-box" style="width: 280px;">
                                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                                    <input type="text" class="search-input" id="bc-search-input" placeholder="Cari barcode, judul, atau rak..." value="${this.searchQuery}">
                                </div>
                            </div>
                        </div>

                        <div id="tab-copies-container" style="${this.currentTab === 'copies' ? '' : 'display: none;'}">
                            <!-- Filter pills for copies -->
                            <div style="padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border); display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; background: #f8fafc;">
                                <span style="font-size: 0.825rem; font-weight: 600; color: #64748b; margin-right: 0.25rem;">Filter Kondisi:</span>
                                <button class="btn btn-sm ${this.filterCondition === 'all' ? 'btn-blue' : 'btn-outline'} bc-filter-btn" data-filter="all">
                                    Semua <span id="pill-count-all" style="opacity: 0.8; font-size: 0.75rem;">(0)</span>
                                </button>
                                <button class="btn btn-sm ${this.filterCondition === 'Baik' ? 'btn-blue' : 'btn-outline'} bc-filter-btn" data-filter="Baik">
                                    <i class="fa-solid fa-check" style="font-size: 0.75rem;"></i> Baik <span id="pill-count-baik" style="opacity: 0.8; font-size: 0.75rem;">(0)</span>
                                </button>
                                <button class="btn btn-sm ${this.filterCondition === 'Rusak Ringan' ? 'btn-blue' : 'btn-outline'} bc-filter-btn" data-filter="Rusak Ringan">
                                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 0.75rem;"></i> Rusak Ringan <span id="pill-count-ringan" style="opacity: 0.8; font-size: 0.75rem;">(0)</span>
                                </button>
                                <button class="btn btn-sm ${this.filterCondition === 'Rusak Berat' ? 'btn-blue' : 'btn-outline'} bc-filter-btn" data-filter="Rusak Berat">
                                    <i class="fa-solid fa-circle-exclamation" style="font-size: 0.75rem;"></i> Rusak Berat <span id="pill-count-berat" style="opacity: 0.8; font-size: 0.75rem;">(0)</span>
                                </button>
                                <button class="btn btn-sm ${this.filterCondition === 'Hilang' ? 'btn-blue' : 'btn-outline'} bc-filter-btn" data-filter="Hilang">
                                    <i class="fa-solid fa-circle-xmark" style="font-size: 0.75rem;"></i> Hilang <span id="pill-count-hilang" style="opacity: 0.8; font-size: 0.75rem;">(0)</span>
                                </button>

                                ${this.selectedBookFilter ? `
                                    <div class="selected-book-filter-tag">
                                        <i class="fa-solid fa-book"></i>
                                        <span>Buku: ${this.selectedBookFilter.judul}</span>
                                        <button onclick="BookConditionPage.clearBookFilter()" title="Hapus filter buku"><i class="fa-solid fa-xmark"></i></button>
                                    </div>
                                ` : ''}
                            </div>

                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th style="min-width: 170px;">Kode Eksemplar / Barcode</th>
                                            <th style="min-width: 250px;">Buku & Lokasi</th>
                                            <th>Status Sirkulasi</th>
                                            <th>Kondisi Fisik</th>
                                            <th style="min-width: 220px;">Catatan Kerusakan</th>
                                            <th>Terakhir Diperiksa</th>
                                            <th style="text-align: right; min-width: 130px;">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="bc-table-tbody">
                                        <tr><td colspan="7" style="text-align: center; padding: 3rem; color: #94a3b8;"><i class="fa-solid fa-circle-notch fa-spin"></i> Memuat data kondisi eksemplar...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div id="tab-titles-container" style="${this.currentTab === 'titles' ? '' : 'display: none;'}">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th style="min-width: 280px;">Judul & Koleksi Buku</th>
                                            <th style="width: 120px;">Total Fisik</th>
                                            <th style="min-width: 260px;">Distribusi Kondisi Eksemplar</th>
                                            <th style="width: 150px;">Rasio Kelayakan</th>
                                            <th style="text-align: right; width: 160px;">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="bc-titles-tbody">
                                        <tr><td colspan="5" style="text-align: center; padding: 3rem; color: #94a3b8;"><i class="fa-solid fa-circle-notch fa-spin"></i> Memuat ringkasan judul...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;

        this.setupFilterButtons();
        this.setupSearch();
        await this.loadCopies();
    },

    toggleExplainer() {
        this.isExplainerOpen = !this.isExplainerOpen;
        const section = document.getElementById('condition-explainer-section');
        const header = document.querySelector('.explainer-toggle-header');
        const body = document.getElementById('explainer-body-content');
        const toggleText = document.getElementById('explainer-toggle-text');
        const chevronIcon = document.getElementById('explainer-chevron-icon');
        const innerText = document.getElementById('explainer-btn-inner-text');
        const innerChevron = document.getElementById('explainer-inner-chevron');

        if (body) {
            body.style.display = this.isExplainerOpen ? '' : 'none';
        }
        if (header) {
            if (this.isExplainerOpen) header.classList.add('is-open');
            else header.classList.remove('is-open');
        }
        if (toggleText) toggleText.textContent = this.isExplainerOpen ? 'Sembunyikan Panduan' : 'Panduan Sistem Eksemplar';
        if (chevronIcon) chevronIcon.className = `fa-solid ${this.isExplainerOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`;
        if (innerText) innerText.textContent = this.isExplainerOpen ? 'Tutup' : 'Pelajari Lebih Lanjut';
        if (innerChevron) innerChevron.className = `fa-solid ${this.isExplainerOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`;
    },

    async refreshData() {
        Components.showToast('Menyegarkan data kondisi buku...', 'info');
        await this.loadCopies();
        Components.showToast('Data kondisi berhasil diperbarui', 'success');
    },

    setupFilterButtons() {
        document.querySelectorAll('.bc-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const filter = target.getAttribute('data-filter');
                this.setFilterCondition(filter);
            });
        });
    },

    setFilterCondition(condition) {
        this.filterCondition = condition;
        document.querySelectorAll('.bc-filter-btn').forEach(b => {
            if (b.getAttribute('data-filter') === condition) {
                b.className = 'btn btn-blue btn-sm bc-filter-btn';
            } else {
                b.className = 'btn btn-outline btn-sm bc-filter-btn';
            }
        });

        // Update active class on stat cards
        ['baik', 'ringan', 'berat', 'hilang'].forEach(k => {
            const card = document.getElementById(`card-filter-${k}`);
            if (card) card.classList.remove('active-filter');
        });

        if (condition === 'Baik') document.getElementById('card-filter-baik')?.classList.add('active-filter');
        if (condition === 'Rusak Ringan') document.getElementById('card-filter-ringan')?.classList.add('active-filter');
        if (condition === 'Rusak Berat') document.getElementById('card-filter-berat')?.classList.add('active-filter');
        if (condition === 'Hilang') document.getElementById('card-filter-hilang')?.classList.add('active-filter');

        this.renderCopiesTable();
    },

    filterByCard(condition) {
        if (this.currentTab !== 'copies') {
            this.switchTab('copies');
        }
        if (this.filterCondition === condition) {
            // Toggle back to all
            this.setFilterCondition('all');
        } else {
            this.setFilterCondition(condition);
        }
    },

    setupSearch() {
        const input = document.getElementById('bc-search-input');
        if (!input) return;
        input.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            if (this.currentTab === 'copies') {
                this.renderCopiesTable();
            } else {
                this.renderTitlesTable();
            }
        });
    },

    switchTab(tab) {
        this.currentTab = tab;
        const copiesContainer = document.getElementById('tab-copies-container');
        const titlesContainer = document.getElementById('tab-titles-container');
        const btnCopies = document.getElementById('btn-tab-copies');
        const btnTitles = document.getElementById('btn-tab-titles');

        if (copiesContainer && titlesContainer && btnCopies && btnTitles) {
            if (tab === 'copies') {
                copiesContainer.style.display = '';
                titlesContainer.style.display = 'none';
                btnCopies.classList.add('active');
                btnTitles.classList.remove('active');
                this.renderCopiesTable();
            } else {
                copiesContainer.style.display = 'none';
                titlesContainer.style.display = '';
                btnCopies.classList.remove('active');
                btnTitles.classList.add('active');
                this.renderTitlesTable();
            }
        }
    },

    filterByBook(bookId, bookTitle) {
        this.selectedBookFilter = { id: bookId, judul: bookTitle };
        this.currentTab = 'copies';
        this.render();
    },

    clearBookFilter() {
        this.selectedBookFilter = null;
        this.render();
    },

    async loadCopies() {
        try {
            const res = await API.get('/books/inventory/copies');
            this.copies = res.data || [];

            // Calculate Counts
            let baik = 0, ringan = 0, berat = 0, hilang = 0;
            this.copies.forEach(b => {
                const c = b.condition || 'Baik';
                if (c === 'Baik') baik++;
                else if (c === 'Rusak Ringan') ringan++;
                else if (c === 'Rusak Berat') berat++;
                else if (c === 'Hilang') hilang++;
            });

            const elBaik = document.getElementById('bc-count-baik');
            const elRingan = document.getElementById('bc-count-ringan');
            const elBerat = document.getElementById('bc-count-berat');
            const elHilang = document.getElementById('bc-count-hilang');

            if (elBaik) elBaik.textContent = baik;
            if (elRingan) elRingan.textContent = ringan;
            if (elBerat) elBerat.textContent = berat;
            if (elHilang) elHilang.textContent = hilang;

            // Update badge counts on filter pills
            const pillAll = document.getElementById('pill-count-all');
            const pillBaik = document.getElementById('pill-count-baik');
            const pillRingan = document.getElementById('pill-count-ringan');
            const pillBerat = document.getElementById('pill-count-berat');
            const pillHilang = document.getElementById('pill-count-hilang');

            if (pillAll) pillAll.textContent = `(${this.copies.length})`;
            if (pillBaik) pillBaik.textContent = `(${baik})`;
            if (pillRingan) pillRingan.textContent = `(${ringan})`;
            if (pillBerat) pillBerat.textContent = `(${berat})`;
            if (pillHilang) pillHilang.textContent = `(${hilang})`;

            // Build books summary
            const booksMap = new Map();
            this.copies.forEach(c => {
                const bId = c.book_id;
                if (!booksMap.has(bId)) {
                    booksMap.set(bId, {
                        id: bId,
                        book: c.book || { judul: 'Buku #' + bId, pengarang: '-' },
                        total: 0,
                        baik: 0,
                        ringan: 0,
                        berat: 0,
                        hilang: 0,
                        copies: []
                    });
                }
                const entry = booksMap.get(bId);
                entry.total++;
                entry.copies.push(c);
                const cond = c.condition || 'Baik';
                if (cond === 'Baik') entry.baik++;
                else if (cond === 'Rusak Ringan') entry.ringan++;
                else if (cond === 'Rusak Berat') entry.berat++;
                else if (cond === 'Hilang') entry.hilang++;
            });

            this.booksSummary = Array.from(booksMap.values());

            this.renderCopiesTable();
            this.renderTitlesTable();
        } catch (error) {
            console.error('Load condition error:', error);
            Components.showToast('Gagal memuat kondisi buku', 'error');
        }
    },

    renderCopiesTable() {
        const tbody = document.getElementById('bc-table-tbody');
        if (!tbody) return;

        let filtered = this.copies;

        if (this.selectedBookFilter) {
            filtered = filtered.filter(c => c.book_id === this.selectedBookFilter.id);
        }

        if (this.filterCondition !== 'all') {
            filtered = filtered.filter(c => (c.condition || 'Baik') === this.filterCondition);
        }

        if (this.searchQuery) {
            filtered = filtered.filter(c => {
                const kode = (c.kode_eksemplar || '').toLowerCase();
                const judul = (c.book?.judul || '').toLowerCase();
                const pengarang = (c.book?.pengarang || '').toLowerCase();
                const rak = (c.book?.lokasi_rak || '').toLowerCase();
                return kode.includes(this.searchQuery) || judul.includes(this.searchQuery) || pengarang.includes(this.searchQuery) || rak.includes(this.searchQuery);
            });
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 3rem; color: #94a3b8;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;"><i class="fa-regular fa-folder-open"></i></div>
                        <div style="font-weight: 600; color: #475569;">Tidak ada eksemplar yang sesuai dengan filter.</div>
                        <div style="font-size: 0.85rem; margin-top: 0.25rem;">Coba ubah kata kunci pencarian atau pilih filter kondisi lain.</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(copy => {
            return `
                <tr>
                    <td>
                        <span class="copy-barcode-pill">
                            <i class="fa-solid fa-barcode"></i>
                            <span>${copy.kode_eksemplar}</span>
                        </span>
                    </td>
                    <td>
                        <div style="font-weight: 700; color: #0f172a; line-height: 1.3;">${copy.book?.judul || '-'}</div>
                        <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.2rem;">
                            <span>${copy.book?.pengarang || '-'}</span>
                            <span style="margin: 0 0.35rem;">·</span>
                            <span><i class="fa-solid fa-location-dot" style="font-size: 0.75rem; color: #94a3b8;"></i> Rak: ${copy.book?.lokasi_rak || '-'}</span>
                        </div>
                    </td>
                    <td>
                        ${Components.renderStatusBadge(copy.status)}
                    </td>
                    <td>${Components.renderConditionBadge(copy.condition || 'Baik')}</td>
                    <td>
                        <div style="font-size: 0.85rem; color: #334155; max-width: 260px; line-height: 1.4;">
                            ${copy.condition_notes ? `
                                <div style="display: flex; gap: 0.35rem; align-items: flex-start;">
                                    <i class="fa-regular fa-note-sticky" style="color: #64748b; margin-top: 0.2rem; flex-shrink: 0;"></i>
                                    <span>${copy.condition_notes}</span>
                                </div>
                            ` : '<span style="color: #94a3b8; font-style: italic;">Normal / Tanpa catatan</span>'}
                        </div>
                    </td>
                    <td>
                        <div style="font-size: 0.825rem; font-weight: 600; color: #334155;">${Components.formatDate(copy.updated_at || copy.created_at)}</div>
                        <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.15rem;">
                            <i class="fa-regular fa-user" style="font-size: 0.7rem;"></i> ${copy.condition_updated_by || 'Admin Perpustakaan'}
                        </div>
                    </td>
                    <td style="text-align: right;">
                        <button class="btn btn-outline btn-sm" onclick="BookConditionPage.openUpdateModal(${copy.id})" title="Perbarui kondisi fisik eksemplar ini">
                            <i class="fa-solid fa-pen-to-square"></i>
                            <span>Ubah Kondisi</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderTitlesTable() {
        const tbody = document.getElementById('bc-titles-tbody');
        if (!tbody) return;

        let filtered = this.booksSummary;
        if (this.searchQuery) {
            filtered = filtered.filter(b => {
                const judul = (b.book?.judul || '').toLowerCase();
                const pengarang = (b.book?.pengarang || '').toLowerCase();
                const genre = (b.book?.genre || '').toLowerCase();
                return judul.includes(this.searchQuery) || pengarang.includes(this.searchQuery) || genre.includes(this.searchQuery);
            });
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 3rem; color: #94a3b8;">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-book"></i></div>
                        <div style="font-weight: 600; color: #475569;">Tidak ada judul buku yang cocok.</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(item => {
            const total = item.total || 1;
            const pctBaik = Math.round((item.baik / total) * 100);
            const pctRingan = Math.round((item.ringan / total) * 100);
            const pctBerat = Math.round((item.berat / total) * 100);
            const pctHilang = Math.round((item.hilang / total) * 100);

            const coverUrl = item.book?.cover_image ? item.book.cover_image : null;

            return `
                <tr>
                    <td>
                        <div style="display: flex; gap: 0.85rem; align-items: center;">
                            <div class="table-cover-thumb">
                                ${coverUrl ? `<img src="${coverUrl}" alt="Cover">` : `<i class="fa-solid fa-book"></i>`}
                            </div>
                            <div>
                                <div style="font-weight: 700; color: #0f172a; line-height: 1.3;">${item.book?.judul || '-'}</div>
                                <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.2rem;">
                                    <span>${item.book?.pengarang || '-'}</span>
                                    <span style="margin: 0 0.35rem;">·</span>
                                    <span>${item.book?.genre || 'Umum'}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; align-items: baseline; gap: 0.35rem;">
                            <strong style="font-size: 1.25rem; font-weight: 800; color: #0f172a;">${item.total}</strong>
                            <span style="font-size: 0.8rem; color: #64748b;">eksemplar</span>
                        </div>
                    </td>
                    <td style="min-width: 260px;">
                        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.35rem;">
                            <span class="mini-condition-pill baik">Baik: ${item.baik}</span>
                            ${item.ringan > 0 ? `<span class="mini-condition-pill ringan">Ringan: ${item.ringan}</span>` : ''}
                            ${item.berat > 0 ? `<span class="mini-condition-pill berat">Berat: ${item.berat}</span>` : ''}
                            ${item.hilang > 0 ? `<span class="mini-condition-pill hilang">Hilang: ${item.hilang}</span>` : ''}
                        </div>
                        <div class="condition-progress-bar" title="Baik: ${pctBaik}%, Rusak Ringan: ${pctRingan}%, Rusak Berat: ${pctBerat}%, Hilang: ${pctHilang}%">
                            <div style="width: ${pctBaik}%; background: #22c55e;" title="Baik: ${item.baik} (${pctBaik}%)"></div>
                            <div style="width: ${pctRingan}%; background: #eab308;" title="Rusak Ringan: ${item.ringan} (${pctRingan}%)"></div>
                            <div style="width: ${pctBerat}%; background: #f97316;" title="Rusak Berat: ${item.berat} (${pctBerat}%)"></div>
                            <div style="width: ${pctHilang}%; background: #ef4444;" title="Hilang: ${item.hilang} (${pctHilang}%)"></div>
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 700; font-size: 0.95rem; color: ${pctBaik >= 70 ? '#166534' : (pctBaik >= 40 ? '#ca8a04' : '#dc2626')};">
                            ${pctBaik}% Layak
                        </div>
                        <div style="font-size: 0.775rem; color: #64748b; margin-top: 0.1rem;">${item.baik} dari ${item.total} siap sirkulasi</div>
                    </td>
                    <td style="text-align: right;">
                        <button class="btn btn-outline btn-sm" onclick="BookConditionPage.filterByBook(${item.id}, '${(item.book?.judul || '').replace(/'/g, "\\'")}')">
                            <i class="fa-solid fa-list-check"></i>
                            <span>Lihat ${item.total} Eksemplar</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openUpdateModal(copyId) {
        const copy = this.copies.find(c => c.id == copyId);
        if (!copy) return;

        const body = `
            <form id="update-condition-form">
                <div style="margin-bottom: 1.25rem; padding: 1rem; background: #f8fafc; border-radius: var(--radius-md); border: 1px solid var(--border);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span class="copy-barcode-pill"><i class="fa-solid fa-barcode"></i> ${copy.kode_eksemplar}</span>
                        ${Components.renderStatusBadge(copy.status)}
                    </div>
                    <div style="font-weight: 700; font-size: 1rem; color: #0f172a;">${copy.book?.judul || '-'}</div>
                    <div style="font-size: 0.825rem; color: #64748b; margin-top: 0.2rem;">
                        <span>Pengarang: ${copy.book?.pengarang || '-'}</span>
                        <span style="margin: 0 0.35rem;">·</span>
                        <span>Lokasi Rak: ${copy.book?.lokasi_rak || '-'}</span>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="modal-condition-val" style="font-weight: 600;">Status Kondisi Fisik Eksemplar *</label>
                    <select id="modal-condition-val" class="form-select" required style="font-size: 0.9rem;">
                        <option value="Baik" ${copy.condition === 'Baik' ? 'selected' : ''}>✅ Baik (Mulus, utuh, siap dipinjamkan keluar)</option>
                        <option value="Rusak Ringan" ${copy.condition === 'Rusak Ringan' ? 'selected' : ''}>⚠️ Rusak Ringan (Cover/halaman sedikit robek/terlipat)</option>
                        <option value="Rusak Berat" ${copy.condition === 'Rusak Berat' ? 'selected' : ''}>⛔ Rusak Berat (Jilid lepas/halaman hilang/tidak layak pinjam)</option>
                        <option value="Hilang" ${copy.condition === 'Hilang' ? 'selected' : ''}>❌ Hilang (Koleksi fisik tidak ditemukan di rak)</option>
                    </select>
                    <small style="color: #64748b; font-size: 0.775rem; margin-top: 0.35rem; display: block; line-height: 1.4;">
                        <i class="fa-solid fa-circle-info" style="color: #2563eb;"></i> Perubahan kondisi hanya berlaku untuk eksemplar fisik ini dan otomatis memperbarui statistik kelayakan sirkulasi.
                    </small>
                </div>

                <div class="form-group" style="margin-top: 1rem;">
                    <label class="form-label" for="modal-condition-notes" style="font-weight: 600;">Catatan Kerusakan / Keterangan Fisik</label>
                    <textarea id="modal-condition-notes" class="form-textarea" rows="3" placeholder="Contoh: Cover depan sedikit robek di sudut kanan, halaman 14 ada lipatan kertas">${copy.condition_notes || ''}</textarea>
                </div>
            </form>
        `;

        Components.showModal({
            title: 'Update Kondisi Eksemplar Buku',
            body: body,
            saveText: 'Simpan Status Fisik',
            onSave: async () => {
                const condition = document.getElementById('modal-condition-val').value;
                const notes = document.getElementById('modal-condition-notes').value.trim();

                try {
                    await API.put(`/books/inventory/copies/${copyId}/condition`, { condition, notes });
                    Components.closeModal();
                    Components.showToast('Kondisi eksemplar berhasil diperbarui!', 'success');
                    await this.loadCopies();
                } catch (err) {
                    Components.showToast(err.message || 'Gagal memperbarui kondisi', 'error');
                }
            }
        });
    }
};
