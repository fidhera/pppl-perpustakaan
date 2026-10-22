/**
 * Landing Page Component
 * SMP Informatika Bina Generasi Bogor
 * Inspired by Gunadarma Digital Library aesthetics
 */

const LandingPage = {
    shuffleInterval: null,
    currentCardIndex: 0,
    totalCards: 5,
    isHovered: false,

    async render() {
        const app = document.getElementById('app');
        if (!app) return;

        // Clean up previous interval if any
        if (this.shuffleInterval) {
            clearInterval(this.shuffleInterval);
            this.shuffleInterval = null;
        }

        // Show loading state
        app.innerHTML = `
            <div class="landing-wrapper">
                ${Components.renderLandingNavbar('beranda')}
                <div style="min-height: 60vh; display: flex; align-items: center; justify-content: center;">
                    <div class="spinner"></div>
                </div>
            </div>
        `;

        try {
            // Fetch landing page settings & books from DB
            const [settingsRes, booksRes] = await Promise.all([
                API.get('/landing/settings').catch(() => null),
                API.get('/books?limit=6').catch(() => null)
            ]);

            const settings = (settingsRes && settingsRes.success) ? settingsRes.data : this.getDefaultSettings();
            const books = (booksRes && booksRes.success && booksRes.data) ? booksRes.data : [];

            const user = Auth.getUser();
            const isAdmin = user && (user.role === 'admin' || user.role === 'petugas');

            // Render Page Structure
            app.innerHTML = `
                <div class="landing-wrapper">
                    ${Components.renderLandingNavbar('beranda')}

                    <!-- HERO SECTION -->
                    <section class="landing-hero">
                        <div class="hero-content">
                            <span class="hero-eyebrow">${escapeHtml(settings.hero_eyebrow || 'PERPUSTAKAAN DIGITAL TERPADU')}</span>
                            <h1 class="hero-title font-serif">
                                Rumah bagi setiap<br>
                                <span class="gradient-italic">masa depan.</span>
                            </h1>
                            <p class="hero-subtitle">
                                ${escapeHtml(settings.hero_subtitle || 'Koleksi buku pembelajaran, literatur digital, ensiklopedia dan referensi sains terlengkap untuk generasi berprestasi.')}
                            </p>

                            <!-- Hero Search Bar -->
                            <form id="heroSearchForm" class="landing-search-bar" onsubmit="LandingPage.handleSearch(event)">
                                <i class="fas fa-search landing-search-icon"></i>
                                <input 
                                    type="text" 
                                    id="heroSearchInput" 
                                    class="landing-search-input" 
                                    placeholder="Cari judul buku, pengarang, ISBN atau topik pembelajaran..."
                                    autocomplete="off"
                                >
                                <button type="submit" class="landing-search-btn">
                                    <span>Cari</span>
                                    <i class="fas fa-arrow-right" style="font-size: 0.8rem;"></i>
                                </button>
                            </form>
                        </div>

                        <!-- 5-CARD SHUFFLE DECK -->
                        <div class="hero-cards-wrapper" id="heroCardsWrapper">
                            <div class="hero-cards-deck" id="heroCardsDeck">
                                ${this.renderHeroCards(settings.cards)}
                            </div>
                            <!-- Deck Dots Indicator -->
                            <div class="hero-deck-controls" id="heroDeckDots">
                                ${Array.from({ length: 5 }).map((_, i) => `
                                    <span class="deck-dot ${i === 0 ? 'active' : ''}" onclick="LandingPage.jumpToCard(${i})"></span>
                                `).join('')}
                            </div>
                        </div>
                    </section>

                    <!-- ACADEMIC FEATURES SECTION -->
                    <section class="landing-section">
                        <div class="section-header-center">
                            <span class="section-eyebrow">FITUR UTAMA</span>
                            <h2 class="section-title font-serif">Segala Kebutuhan Akademik Anda</h2>
                            <p class="section-subtitle">
                                Akses jutaan data referensi pembelajaran, literatur resmi kurikulum merdeka, dan fasilitas digital SMP Informatika Bina Generasi.
                            </p>
                        </div>

                        <div class="academic-grid">
                            <!-- Main Featured Purple Card -->
                            <div class="academic-card card-featured">
                                <div>
                                    <div class="academic-icon-box">
                                        <i class="fas fa-book-bookmark fa-lg"></i>
                                    </div>
                                    <h3 class="academic-title font-serif">Repository & Pustaka Digital</h3>
                                    <p class="academic-desc">
                                        Koleksi buku paket, modul pembelajaran informatika, karya tulis ilmiah siswa, dan arsip pembelajaran digital sekolah.
                                    </p>
                                </div>
                                <a href="#layanan" class="academic-link">
                                    <span>Telusuri Koleksi</span>
                                    <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>

                            <!-- OPAC Card -->
                            <div class="academic-card">
                                <div>
                                    <div class="academic-icon-box" style="background:#eff6ff; color:#2563eb;">
                                        <i class="fas fa-magnifying-glass"></i>
                                    </div>
                                    <h3 class="academic-title font-serif">Katalog OPAC</h3>
                                    <p class="academic-desc">
                                        Pencarian cepat katalog buku perpustakaan terpadu berbasis nomor panggil dan rak.
                                    </p>
                                </div>
                                <a href="#layanan" class="academic-link" style="color:#2563eb;">
                                    <span>Buka Katalog</span>
                                    <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>

                            <!-- E-Paper Card -->
                            <div class="academic-card">
                                <div>
                                    <div class="academic-icon-box" style="background:#fef3c7; color:#d97706;">
                                        <i class="fas fa-newspaper"></i>
                                    </div>
                                    <h3 class="academic-title font-serif">E-Paper & Majalah</h3>
                                    <p class="academic-desc">
                                        Publikasi berita sekolah, majalah dinding digital, dan artikel ilmiah siswa terkini.
                                    </p>
                                </div>
                                <a href="#layanan?q=majalah" class="academic-link" style="color:#d97706;">
                                    <span>Lihat Terbitan</span>
                                    <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>

                            <!-- Unggah Karya Card -->
                            <div class="academic-card">
                                <div>
                                    <div class="academic-icon-box" style="background:#f0fdf4; color:#16a34a;">
                                        <i class="fas fa-cloud-arrow-up"></i>
                                    </div>
                                    <h3 class="academic-title font-serif">Unggah Karya Siswa</h3>
                                    <p class="academic-desc">
                                        Platform penyerahan tugas proyek akhir siswa dan karya literasi mandiri ke perpustakaan.
                                    </p>
                                </div>
                                <a href="#login" class="academic-link" style="color:#16a34a;">
                                    <span>Masuk untuk Unggah</span>
                                    <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>

                            <!-- Usulan Buku Card -->
                            <div class="academic-card">
                                <div>
                                    <div class="academic-icon-box" style="background:#fdf2f8; color:#db2777;">
                                        <i class="fas fa-lightbulb"></i>
                                    </div>
                                    <h3 class="academic-title font-serif">Usulan Buku Baru</h3>
                                    <p class="academic-desc">
                                        Bantu pustakawan melengkapi koleksi dengan mengajukan rekomendasi buku yang ingin dibaca.
                                    </p>
                                </div>
                                <a href="#login" class="academic-link" style="color:#db2777;">
                                    <span>Kirim Usulan</span>
                                    <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>

                            <!-- Bebas Pustaka Card -->
                            <div class="academic-card">
                                <div>
                                    <div class="academic-icon-box" style="background:#f1f5f9; color:#475569;">
                                        <i class="fas fa-certificate"></i>
                                    </div>
                                    <h3 class="academic-title font-serif">Bebas Pustaka</h3>
                                    <p class="academic-desc">
                                        Cek status peminjaman buku dan verifikasi bebas pinjaman untuk siswa kelas IX dan kelulusan.
                                    </p>
                                </div>
                                <a href="#login" class="academic-link" style="color:#475569;">
                                    <span>Cek Status</span>
                                    <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </section>

                    <!-- FACILITIES SECTION -->
                    <section class="landing-section" style="background: #ffffff; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
                        <div class="facility-container">
                            <div>
                                <span class="section-eyebrow">FASILITAS SEKOLAH</span>
                                <h2 class="section-title font-serif">
                                    Ruang membaca yang nyaman, suasana yang mendukung.
                                </h2>
                                <p class="section-subtitle">
                                    Perpustakaan SMP Informatika Bina Generasi didesain dengan konsep modern, terang, dan tenang guna memantik semangat literasi serta eksplorasi teknologi generasi muda.
                                </p>

                                <ul class="facility-list">
                                    <li class="facility-item">
                                        <span class="facility-check"><i class="fas fa-check" style="font-size:0.75rem;"></i></span>
                                        <span>Ruang baca ber-AC, sejuk dan hening untuk konsentrasi belajar maksimal</span>
                                    </li>
                                    <li class="facility-item">
                                        <span class="facility-check"><i class="fas fa-check" style="font-size:0.75rem;"></i></span>
                                        <span>Akses WiFi berkecepatan tinggi & area meja colokan laptop siswa</span>
                                    </li>
                                    <li class="facility-item">
                                        <span class="facility-check"><i class="fas fa-check" style="font-size:0.75rem;"></i></span>
                                        <span>Koleksi buku Kurikulum Merdeka & pengayaan sains informatika terlengkap</span>
                                    </li>
                                    <li class="facility-item">
                                        <span class="facility-check"><i class="fas fa-check" style="font-size:0.75rem;"></i></span>
                                        <span>Pojok baca santai dengan beanbag & ruang diskusi kelompok terarah</span>
                                    </li>
                                </ul>

                                <a href="#layanan" class="btn btn-blue" style="padding: 0.65rem 1.6rem; border-radius: 9999px;">
                                    <i class="fas fa-book-open"></i>
                                    <span>Eksplorasi Katalog</span>
                                </a>
                            </div>

                            <div class="facility-image-card">
                                <img src="/img/library_reading_room.jpg" alt="Ruang Baca Perpustakaan SMP Informatika Bina Generasi" class="facility-img">
                                <div class="facility-overlay-badge">
                                    <h4 class="facility-badge-title">Ayo Membaca Bersama Generasi Cerdas</h4>
                                    <p class="facility-badge-desc">
                                        Kunjungi perpustakaan setiap hari sekolah, temukan ide-ide baru dan wujudkan masa depan gemilang melalui buku.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- RECENT BOOKS COLLECTION -->
                    <section class="landing-section">
                        <div class="section-header-center">
                            <span class="section-eyebrow">KOLEKSI TERBARU</span>
                            <h2 class="section-title font-serif">Buku & Literatur Terbaru</h2>
                            <p class="section-subtitle">
                                Buku pelajaran, literatur sains teknologi, dan karya sastra yang baru saja ditambahkan oleh petugas perpustakaan.
                            </p>
                        </div>

                        <div class="landing-books-grid">
                            ${this.renderRecentBooks(books)}
                        </div>

                        <div style="text-align: center; margin-top: 3rem;">
                            <a href="#layanan" class="btn btn-outline" style="border-radius: 9999px; padding: 0.65rem 2rem;">
                                <span>Lihat Seluruh Koleksi Buku</span>
                                <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </section>

                    <!-- STATS BANNER -->
                    <div class="landing-stats-banner">
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-number">${settings.stats ? escapeHtml(settings.stats.stat1_num || '35K+') : '35K+'}</span>
                                <span class="stat-label">${settings.stats ? escapeHtml(settings.stats.stat1_label || 'Koleksi Buku & E-Book') : 'Koleksi Buku'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${settings.stats ? escapeHtml(settings.stats.stat2_num || '64,196') : '64,196'}</span>
                                <span class="stat-label">${settings.stats ? escapeHtml(settings.stats.stat2_label || 'Sirkulasi Peminjaman') : 'Sirkulasi Peminjaman'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${settings.stats ? escapeHtml(settings.stats.stat3_num || '1,609') : '1,609'}</span>
                                <span class="stat-label">${settings.stats ? escapeHtml(settings.stats.stat3_label || 'Anggota Terdaftar') : 'Anggota Terdaftar'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${settings.stats ? escapeHtml(settings.stats.stat4_num || '250+') : '250+'}</span>
                                <span class="stat-label">${settings.stats ? escapeHtml(settings.stats.stat4_label || 'Kategori & Klasifikasi') : 'Kategori Topik'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- LIBRARY LOCATIONS & SERVICE HOURS -->
                    <section class="landing-section" style="padding-top: 0;">
                        <div class="section-header-center">
                            <span class="section-eyebrow">LAYANAN FISIK</span>
                            <h2 class="section-title font-serif">Lokasi & Jam Operasional</h2>
                            <p class="section-subtitle">
                                Kunjungi pusat perpustakaan dan sudut literasi di lingkungan kampus SMP Informatika Bina Generasi.
                            </p>
                        </div>

                        <div class="locations-grid">
                            <div class="location-card">
                                <div class="location-card-header">
                                    <div class="location-icon-badge">
                                        <i class="fas fa-building-columns"></i>
                                    </div>
                                    <div>
                                        <h4 class="location-name">Gedung Utama Lt. 2</h4>
                                        <small style="color:#64748b;">Pusat Koleksi & Sirkulasi</small>
                                    </div>
                                </div>
                                <div class="location-hours-row">
                                    <span>Senin - Kamis</span>
                                    <span class="location-hours-label">07.30 - 15.30 WIB</span>
                                </div>
                                <div class="location-hours-row">
                                    <span>Jumat</span>
                                    <span class="location-hours-label">07.30 - 11.30 WIB</span>
                                </div>
                                <div class="location-hours-row">
                                    <span>Sabtu - Minggu</span>
                                    <span style="color:#ef4444; font-weight:600;">Libur</span>
                                </div>
                            </div>

                            <div class="location-card">
                                <div class="location-card-header">
                                    <div class="location-icon-badge" style="background:#eff6ff; color:#2563eb;">
                                        <i class="fas fa-laptop-code"></i>
                                    </div>
                                    <div>
                                        <h4 class="location-name">Lab Komputer</h4>
                                        <small style="color:#64748b;">Pojok Akses Digital & OPAC</small>
                                    </div>
                                </div>
                                <div class="location-hours-row">
                                    <span>Senin - Kamis</span>
                                    <span class="location-hours-label">08.00 - 15.00 WIB</span>
                                </div>
                                <div class="location-hours-row">
                                    <span>Jumat</span>
                                    <span class="location-hours-label">08.00 - 11.00 WIB</span>
                                </div>
                                <div class="location-hours-row">
                                    <span>Sabtu - Minggu</span>
                                    <span style="color:#ef4444; font-weight:600;">Libur</span>
                                </div>
                            </div>

                            <div class="location-card">
                                <div class="location-card-header">
                                    <div class="location-icon-badge" style="background:#f0fdf4; color:#16a34a;">
                                        <i class="fas fa-tree"></i>
                                    </div>
                                    <div>
                                        <h4 class="location-name">Gazebo Literasi</h4>
                                        <small style="color:#64748b;">Area Baca Terbuka Hijau</small>
                                    </div>
                                </div>
                                <div class="location-hours-row">
                                    <span>Senin - Jumat</span>
                                    <span class="location-hours-label">07.00 - 16.00 WIB</span>
                                </div>
                                <div class="location-hours-row">
                                    <span>Akses Terbuka</span>
                                    <span style="color:#16a34a; font-weight:600;">Setiap Jam Istirahat</span>
                                </div>
                            </div>

                            <div class="location-card">
                                <div class="location-card-header">
                                    <div class="location-icon-badge" style="background:#fef3c7; color:#d97706;">
                                        <i class="fas fa-chalkboard-user"></i>
                                    </div>
                                    <div>
                                        <h4 class="location-name">Ruang Referensi Guru</h4>
                                        <small style="color:#64748b;">Modul & Jurnal Pengajaran</small>
                                    </div>
                                </div>
                                <div class="location-hours-row">
                                    <span>Senin - Jumat</span>
                                    <span class="location-hours-label">07.30 - 16.00 WIB</span>
                                </div>
                                <div class="location-hours-row">
                                    <span>Layanan Khusus</span>
                                    <span style="color:#d97706; font-weight:600;">Pendidik & Staf</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- FOOTER & COOKIE BANNER -->
                    ${Components.renderLandingFooter(settings)}

                    <!-- Admin Floating Edit Button -->
                    ${isAdmin ? `
                        <a href="#kelola-beranda" class="admin-quick-edit-btn" title="Kelola konten dan gambar beranda">
                            <i class="fas fa-edit"></i>
                            <span>Kelola Beranda</span>
                        </a>
                    ` : ''}
                </div>
            `;

            // Initialize 5-card horizontal shuffle loop
            this.initShuffleDeck();

        } catch (err) {
            console.error('Error rendering landing page:', err);
            app.innerHTML = `
                <div class="landing-wrapper">
                    ${Components.renderLandingNavbar('beranda')}
                    <div style="padding: 4rem; text-align: center;">
                        <p style="color: #ef4444;">Gagal memuat konten beranda. Silakan muat ulang halaman.</p>
                        <button onclick="LandingPage.render()" class="btn btn-blue">Muat Ulang</button>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Render the 5 cards in the hero section
     */
    renderHeroCards(cardsData) {
        const defaultCards = this.getDefaultSettings().cards;
        const cards = (cardsData && cardsData.length === 5) ? cardsData : defaultCards;

        const colorClasses = ['theme-purple', 'theme-violet', 'theme-indigo', 'theme-fuchsia', 'theme-amber'];

        return cards.map((card, i) => {
            const posClass = `pos-${i}`;
            const themeClass = colorClasses[i % colorClasses.length];
            return `
                <div 
                    class="hero-card ${posClass} ${themeClass}" 
                    data-index="${i}"
                    onclick="LandingPage.handleCardClick(${i})"
                >
                    <span class="hero-card-badge">${escapeHtml(card.badge || 'LITERATUR')}</span>
                    <div class="hero-card-body">
                        <h3 class="hero-card-title">${escapeHtml(card.title || '')}</h3>
                        <p class="hero-card-desc">${escapeHtml(card.desc || '')}</p>
                    </div>
                    <div class="hero-card-footer">
                        <span>${escapeHtml(card.meta || 'Koleksi Perpustakaan')}</span>
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Initialize automatic 5-card shuffle animation
     */
    initShuffleDeck() {
        const wrapper = document.getElementById('heroCardsWrapper');
        if (!wrapper) return;

        wrapper.addEventListener('mouseenter', () => {
            this.isHovered = true;
        });
        wrapper.addEventListener('mouseleave', () => {
            this.isHovered = false;
        });

        // Shuffle every 3.5 seconds
        this.shuffleInterval = setInterval(() => {
            if (!this.isHovered) {
                this.shuffleNext();
            }
        }, 3500);
    },

    /**
     * Execute one shuffle step:
     * Active front card (pos-0) slides right and transitions to the back,
     * while other cards shift forward (pos-1 -> pos-0, pos-2 -> pos-1, etc.)
     */
    shuffleNext() {
        const deck = document.getElementById('heroCardsDeck');
        if (!deck) return;

        const cards = Array.from(deck.querySelectorAll('.hero-card'));
        if (cards.length !== 5) return;

        // Find currently front card (pos-0)
        const frontCard = deck.querySelector('.hero-card.pos-0');
        if (frontCard) {
            frontCard.classList.add('shuffling-out');
        }

        setTimeout(() => {
            // Reassign positions cyclically
            cards.forEach(card => {
                let currentPos = -1;
                for (let i = 0; i < 5; i++) {
                    if (card.classList.contains(`pos-${i}`)) {
                        currentPos = i;
                        card.classList.remove(`pos-${i}`);
                        break;
                    }
                }

                if (currentPos !== -1) {
                    // pos-0 moves to pos-4 (back)
                    // pos-1 becomes pos-0 (new front)
                    // pos-2 becomes pos-1
                    // pos-3 becomes pos-2
                    // pos-4 becomes pos-3
                    const nextPos = (currentPos + 4) % 5;
                    card.classList.add(`pos-${nextPos}`);
                }
                card.classList.remove('shuffling-out');
            });

            // Update current active index and dots
            const newFront = deck.querySelector('.hero-card.pos-0');
            if (newFront) {
                const idx = parseInt(newFront.getAttribute('data-index') || '0', 10);
                this.updateDeckDots(idx);
            }
        }, 400);
    },

    /**
     * Jump directly to a card when dot or card is clicked
     */
    jumpToCard(targetIdx) {
        const deck = document.getElementById('heroCardsDeck');
        if (!deck) return;

        const targetCard = deck.querySelector(`.hero-card[data-index="${targetIdx}"]`);
        if (!targetCard || targetCard.classList.contains('pos-0')) return;

        // Perform single shuffle step towards target
        this.shuffleNext();
    },

    handleCardClick(cardIdx) {
        const deck = document.getElementById('heroCardsDeck');
        if (!deck) return;

        const card = deck.querySelector(`.hero-card[data-index="${cardIdx}"]`);
        if (card && card.classList.contains('pos-0')) {
            // If already at front, navigate to layanan search for this topic
            const title = card.querySelector('.hero-card-title')?.innerText || '';
            Router.navigate(`layanan?q=${encodeURIComponent(title.split(' ')[0] || '')}`);
        } else {
            this.shuffleNext();
        }
    },

    updateDeckDots(activeIdx) {
        const dots = document.querySelectorAll('#heroDeckDots .deck-dot');
        dots.forEach((dot, idx) => {
            if (idx === activeIdx) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    },

    /**
     * Handle hero search submit
     */
    handleSearch(e) {
        e.preventDefault();
        const input = document.getElementById('heroSearchInput');
        const q = (input && input.value) ? input.value.trim() : '';
        if (q) {
            Router.navigate(`layanan?q=${encodeURIComponent(q)}`);
        } else {
            Router.navigate('layanan');
        }
    },

    /**
     * Render books from DB into recent books grid
     */
    renderRecentBooks(books) {
        if (!books || books.length === 0) {
            return `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #64748b;">
                    <p>Belum ada koleksi buku yang ditambahkan.</p>
                </div>
            `;
        }

        return books.map(book => {
            const coverHtml = book.cover 
                ? `<img src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.judul)}" class="book-card-cover-img">`
                : `<div class="book-card-cover-placeholder font-serif">${escapeHtml(book.judul ? book.judul.charAt(0) : 'B')}</div>`;

            const stokTersedia = book.stok_tersedia ?? (book.stok || 0);
            const stokDipinjam = book.stok_dipinjam ?? 0;

            return `
                <div class="landing-book-card" onclick="Router.navigate('layanan?q=${encodeURIComponent(book.judul)}')">
                    <div class="book-card-cover-container">
                        ${coverHtml}
                        <span class="book-card-category-tag">${escapeHtml(book.kategori_nama || 'UMUM')}</span>
                    </div>
                    <div class="book-card-info">
                        <h4 class="book-card-title">${escapeHtml(book.judul)}</h4>
                        <div class="book-card-author">
                            <i class="fas fa-user-pen" style="color: #7c3aed;"></i>
                            <span>${escapeHtml(book.pengarang || 'Penulis Tidak Diketahui')}</span>
                        </div>
                        <div class="book-card-stock-row">
                            <span class="stock-pill stock-avail">Tersedia: ${stokTersedia}</span>
                            <span class="stock-pill stock-borrowed">Dipinjam: ${stokDipinjam}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Default Fallback Settings
     */
    getDefaultSettings() {
        return {
            hero_eyebrow: 'PERPUSTAKAAN DIGITAL TERPADU',
            hero_title: 'Rumah bagi setiap masa depan.',
            hero_subtitle: 'Koleksi buku pembelajaran, literatur digital, ensiklopedia dan referensi sains terlengkap untuk generasi berprestasi.',
            cards: [
                {
                    badge: 'LITERATUR',
                    title: 'Koleksi Sastra & Novel Inspiratif',
                    desc: 'Karya fiksi, novel petualangan, dan buku sastra pilihan untuk membangun karakter siswa.',
                    meta: 'Edisi Pelajar 2026'
                },
                {
                    badge: 'TEKNOLOGI',
                    title: 'Modul Informatika & Koding',
                    desc: 'Panduan pemrograman dasar, algoritma komputasi, dan kecerdasan buatan bagi generasi muda.',
                    meta: 'Kurikulum Merdeka'
                },
                {
                    badge: 'SAINS',
                    title: 'Ensiklopedia Sains & Alam Semesta',
                    desc: 'Eksplorasi fenomena fisika, biologi, antariksa, dan rahasia bumi dengan ilustrasi lengkap.',
                    meta: 'Referensi Utama'
                },
                {
                    badge: 'MATEMATIKA',
                    title: 'Logika & Eksplorasi Berhitung',
                    desc: 'Metode belajar matematika praktis, pemecahan masalah, dan olimpiade siswa SMP.',
                    meta: 'Pengayaan Terpadu'
                },
                {
                    badge: 'SEJARAH',
                    title: 'Nusantara & Peradaban Dunia',
                    desc: 'Perjalanan sejarah bangsa Indonesia, kebudayaan luhur, dan riwayat peradaban gemilang.',
                    meta: 'Wawasan Kebangsaan'
                }
            ],
            stats: {
                stat1_num: '35K+',
                stat1_label: 'Koleksi Buku & E-Book',
                stat2_num: '64,196',
                stat2_label: 'Sirkulasi Peminjaman',
                stat3_num: '1,609',
                stat3_label: 'Anggota Terdaftar',
                stat4_num: '250+',
                stat4_label: 'Kategori & Klasifikasi'
            }
        };
    }
};

window.LandingPage = LandingPage;
