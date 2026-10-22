/**
 * Landing Services & Catalog Search Page (#layanan)
 * Matching Gunadarma Library screenshot 3 & 4
 * Features:
 * - Search keyword extraction from URL query parameter ?q=...
 * - Active keyword tag filter with dismissible badge ('dilan' ✕)
 * - Result count display
 * - 2-column cards grid with comprehensive book information from MySQL DB
 * - Real-time stock calculation (Tersedia / Sedang Dipinjam)
 * - "Pinjam Buku" button routing to #login
 */

const LandingServicesPage = {
    currentQuery: '',
    currentCategory: '',
    books: [],
    categories: [],

    async render() {
        const app = document.getElementById('app');
        if (!app) return;

        // Extract search query from router
        const params = Router.getQueryParams();
        this.currentQuery = params.q ? decodeURIComponent(params.q).trim() : '';
        this.currentCategory = params.kategori ? decodeURIComponent(params.kategori).trim() : '';

        // Initial loading state
        app.innerHTML = `
            <div class="landing-wrapper">
                ${Components.renderLandingNavbar('layanan')}
                <div style="min-height: 60vh; display: flex; align-items: center; justify-content: center;">
                    <div class="spinner"></div>
                </div>
            </div>
        `;

        try {
            // Fetch categories and books matching query
            let booksEndpoint = '/books?limit=50';
            if (this.currentQuery) {
                booksEndpoint += `&search=${encodeURIComponent(this.currentQuery)}`;
            }
            if (this.currentCategory) {
                booksEndpoint += `&kategori_id=${encodeURIComponent(this.currentCategory)}`;
            }

            const [booksRes, catRes, settingsRes] = await Promise.all([
                API.get(booksEndpoint).catch(() => null),
                API.get('/categories').catch(() => null),
                API.get('/landing/settings').catch(() => null)
            ]);

            this.books = (booksRes && booksRes.success && booksRes.data) ? booksRes.data : [];
            this.categories = (catRes && catRes.success && catRes.data) ? catRes.data : [];
            const settings = (settingsRes && settingsRes.success) ? settingsRes.data : {};

            const count = this.books.length;

            app.innerHTML = `
                <div class="landing-wrapper">
                    ${Components.renderLandingNavbar('layanan')}

                    <!-- SERVICES HERO HEADER -->
                    <div class="layanan-hero">
                        <div class="layanan-hero-left">
                            <span class="hero-eyebrow">LAYANAN PERPUSTAKAAN & REPOSITORY</span>
                            <h1 class="hero-title font-serif" style="font-size: 2.85rem; margin-top: 0.5rem;">
                                Penulisan Ilmiah & Koleksi Buku<br>
                                <span class="gradient-italic">SMP Bina Generasi</span>
                            </h1>
                            <p class="hero-subtitle">
                                Telusuri katalog buku paket, modul pembelajaran informatika, literatur fiksi, ensiklopedia sains, dan karya siswa SMP Informatika Bina Generasi Bogor.
                            </p>

                            <!-- Layanan Search Input Bar -->
                            <form id="layananSearchForm" class="landing-search-bar layanan-search-container" onsubmit="LandingServicesPage.handleSearchSubmit(event)">
                                <i class="fas fa-search landing-search-icon"></i>
                                <input 
                                    type="text" 
                                    id="layananSearchInput" 
                                    class="landing-search-input" 
                                    value="${escapeHtml(this.currentQuery)}" 
                                    placeholder="Cari judul buku, topik, pengarang, atau ISBN..."
                                    autocomplete="off"
                                >
                                <button type="submit" class="landing-search-btn">
                                    <span>Cari</span>
                                    <i class="fas fa-arrow-right" style="font-size: 0.8rem;"></i>
                                </button>
                            </form>
                        </div>

                        <!-- Geometric Wireframe Illustration matching Screenshot 3 -->
                        <div class="layanan-wireframe-art">
                            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                                <circle cx="100" cy="100" r="88" stroke="#a855f7" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.6"/>
                                <circle cx="100" cy="100" r="68" stroke="#7c3aed" stroke-width="1.5" opacity="0.75"/>
                                <circle cx="100" cy="100" r="42" stroke="#ec4899" stroke-width="1" stroke-dasharray="2 3" opacity="0.7"/>
                                <ellipse cx="100" cy="100" rx="92" ry="40" stroke="#8b5cf6" stroke-width="1.2" transform="rotate(-30 100 100)" opacity="0.8"/>
                                <ellipse cx="100" cy="100" rx="92" ry="40" stroke="#c084fc" stroke-width="1" transform="rotate(45 100 100)" opacity="0.65"/>
                                <line x1="100" y1="20" x2="100" y2="180" stroke="#ddd6fe" stroke-width="0.8" opacity="0.5"/>
                                <line x1="20" y1="100" x2="180" y2="100" stroke="#ddd6fe" stroke-width="0.8" opacity="0.5"/>
                                <circle cx="100" cy="100" r="4" fill="#7c3aed"/>
                                <circle cx="60" cy="80" r="2.5" fill="#a855f7"/>
                                <circle cx="145" cy="70" r="2.5" fill="#ec4899"/>
                                <circle cx="130" cy="135" r="2" fill="#8b5cf6"/>
                            </svg>
                        </div>
                    </div>

                    <!-- RESULTS SUMMARY BAR -->
                    <div class="layanan-results-header">
                        <div class="layanan-query-info">
                            <span class="layanan-count-label">
                                <strong>${count}</strong> karya & buku ditemukan
                            </span>
                            ${this.currentQuery ? `
                                <div>
                                    <span class="active-query-tag">
                                        <span>"${escapeHtml(this.currentQuery)}"</span>
                                        <button class="remove-query-btn" onclick="LandingServicesPage.clearQuery()" title="Hapus pencarian">×</button>
                                    </span>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Category Filter Dropdown -->
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <select 
                                id="layananCategorySelect" 
                                class="form-control" 
                                style="border-radius: 9999px; font-size: 0.82rem; padding: 0.4rem 1rem; width: auto;"
                                onchange="LandingServicesPage.handleCategoryChange(event)"
                            >
                                <option value="">Semua Kategori</option>
                                ${this.categories.map(c => `
                                    <option value="${c.id}" ${this.currentCategory == c.id ? 'selected' : ''}>
                                        ${escapeHtml(c.nama_kategori)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- BOOK RESULTS CARDS (2 COLUMNS MATCHING SCREENSHOT) -->
                    <div class="layanan-cards-grid">
                        ${this.renderBookCards(this.books)}
                    </div>

                    <!-- FOOTER & COOKIE BANNER -->
                    ${Components.renderLandingFooter(settings)}
                </div>
            `;

        } catch (err) {
            console.error('Error rendering layanan page:', err);
            app.innerHTML = `
                <div class="landing-wrapper">
                    ${Components.renderLandingNavbar('layanan')}
                    <div style="padding: 4rem; text-align: center;">
                        <p style="color: #ef4444;">Terjadi kesalahan saat mencari buku. Silakan coba lagi.</p>
                        <a href="#layanan" class="btn btn-blue">Lihat Semua Buku</a>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Render the 2-column cards grid for Layanan page
     */
    renderBookCards(books) {
        if (!books || books.length === 0) {
            return `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; background: #ffffff; border-radius: 16px; border: 1px dashed #cbd5e1;">
                    <i class="fas fa-book-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <h3 class="font-serif" style="color: #1e1b4b; margin: 0 0 0.5rem;">Buku Tidak Ditemukan</h3>
                    <p style="color: #64748b; max-width: 460px; margin: 0 auto 1.5rem; font-size: 0.9rem;">
                        Tidak ada buku yang cocok dengan kata kunci <strong>"${escapeHtml(this.currentQuery)}"</strong>. Periksa ejaan atau gunakan istilah umum lainnya.
                    </p>
                    <button onclick="LandingServicesPage.clearQuery()" class="btn btn-blue" style="border-radius: 9999px;">
                        Tampilkan Semua Buku
                    </button>
                </div>
            `;
        }

        return books.map(book => {
            const stokTersedia = book.stok_tersedia ?? (book.stok || 0);
            const stokDipinjam = book.stok_dipinjam ?? 0;
            const totalStok = book.stok_total ?? (stokTersedia + stokDipinjam);

            const badgeText = (book.kategori_nama || 'BUKU UMUM').toUpperCase();
            const tahun = book.tahun_terbit || '-';
            const rak = book.rak_lokasi || book.lokasi || 'Rak Koleksi';
            const deskripsi = book.deskripsi || book.sinopsis || 'Buku referensi pembelajaran siswa SMP Informatika Bina Generasi Bogor dengan materi kurikulum terpadu.';

            return `
                <div class="layanan-book-card">
                    <span class="layanan-card-badge">${escapeHtml(badgeText)}</span>
                    <h3 class="layanan-card-title">${escapeHtml(book.judul)}</h3>

                    <!-- Meta Information Row -->
                    <div class="layanan-card-meta">
                        <div class="layanan-meta-item" title="Pengarang">
                            <i class="fas fa-user-pen" style="color: #7c3aed;"></i>
                            <span>${escapeHtml(book.pengarang || 'Penulis')}</span>
                        </div>
                        <div class="layanan-meta-item" title="Tahun Terbit">
                            <i class="fas fa-calendar" style="color: #94a3b8;"></i>
                            <span>${escapeHtml(String(tahun))}</span>
                        </div>
                        <div class="layanan-meta-item" title="Lokasi Rak">
                            <i class="fas fa-map-pin" style="color: #d97706;"></i>
                            <span>${escapeHtml(rak)}</span>
                        </div>
                        ${book.isbn ? `
                            <div class="layanan-meta-item" title="ISBN">
                                <i class="fas fa-barcode" style="color: #64748b;"></i>
                                <span>${escapeHtml(book.isbn)}</span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Description / Synopsis snippet -->
                    <p class="layanan-card-desc">
                        ${escapeHtml(deskripsi)}
                    </p>

                    <!-- Availability & Stock breakdown -->
                    <div class="layanan-card-stock-box">
                        <div style="display: flex; align-items: center; gap: 0.65rem;">
                            <span class="stock-pill stock-avail">
                                <i class="fas fa-check-circle" style="font-size:0.7rem; margin-right: 3px;"></i>
                                Tersedia: <strong>${stokTersedia}</strong>
                            </span>
                            <span class="stock-pill stock-borrowed">
                                <i class="fas fa-clock" style="font-size:0.7rem; margin-right: 3px;"></i>
                                Sedang Dipinjam: <strong>${stokDipinjam}</strong>
                            </span>
                        </div>
                        <span style="color: #64748b; font-size: 0.76rem;">
                            Total: ${totalStok} eks.
                        </span>
                    </div>

                    <!-- Action Row: Button Pinjam -> routes to #login -->
                    <div class="layanan-card-actions">
                        <span style="font-size: 0.78rem; color: #64748b;">
                            Penerbit: <strong style="color: #334155;">${escapeHtml(book.penerbit || 'Penerbit')}</strong>
                        </span>
                        <a 
                            href="#login" 
                            class="btn btn-blue" 
                            style="border-radius: 9999px; padding: 0.45rem 1.25rem; font-size: 0.82rem;"
                            title="Masuk untuk meminjam buku ini"
                        >
                            <i class="fas fa-hand-holding-hand"></i>
                            <span>Pinjam Buku</span>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Submit new query
     */
    handleSearchSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('layananSearchInput');
        const q = (input && input.value) ? input.value.trim() : '';
        if (q) {
            Router.navigate(`layanan?q=${encodeURIComponent(q)}`);
        } else {
            Router.navigate('layanan');
        }
    },

    /**
     * Clear search filter
     */
    clearQuery() {
        Router.navigate('layanan');
    },

    /**
     * Change category filter
     */
    handleCategoryChange(e) {
        const catId = e.target.value;
        const q = this.currentQuery;
        if (catId && q) {
            Router.navigate(`layanan?q=${encodeURIComponent(q)}&kategori=${encodeURIComponent(catId)}`);
        } else if (catId) {
            Router.navigate(`layanan?kategori=${encodeURIComponent(catId)}`);
        } else if (q) {
            Router.navigate(`layanan?q=${encodeURIComponent(q)}`);
        } else {
            Router.navigate('layanan');
        }
    }
};

window.LandingServicesPage = LandingServicesPage;
