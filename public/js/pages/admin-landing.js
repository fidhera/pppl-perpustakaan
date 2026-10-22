/**
 * Admin Landing Settings Page (#kelola-beranda)
 * Allows Admin & Petugas to customize all texts, hero deck 5 cards, facilities, stats, and footer
 */

const AdminLandingPage = {
    settings: null,

    async render() {
        const app = document.getElementById('app');
        if (!app) return;

        // Verify admin role
        const user = Auth.getUser();
        if (!user || (user.role !== 'admin' && user.role !== 'petugas')) {
            Router.navigate('beranda');
            return;
        }

        app.innerHTML = `
            ${Components.renderNavbar('kelola-beranda')}
            <div class="main-content">
                <div style="min-height: 50vh; display: flex; align-items: center; justify-content: center;">
                    <div class="spinner"></div>
                </div>
            </div>
        `;

        try {
            const res = await API.get('/landing/settings');
            this.settings = (res && res.success && res.data) ? res.data : this.getDefaultSettings();

            const s = this.settings;
            const cards = (s.cards && s.cards.length === 5) ? s.cards : this.getDefaultSettings().cards;
            const stats = s.stats || this.getDefaultSettings().stats;

            app.innerHTML = `
                ${Components.renderNavbar('kelola-beranda')}
                <div class="main-content">
                    <div class="page-header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e1b4b; margin: 0 0 0.25rem;">
                                <i class="fas fa-sliders" style="color: #7c3aed; margin-right: 0.5rem;"></i>
                                Pengaturan Konten Beranda & Landing Page
                            </h2>
                            <p style="color: #64748b; font-size: 0.88rem; margin: 0;">
                                Sesuaikan teks hero, 5 card animasi beranda, statistik, dan informasi sekolah secara dinamis.
                            </p>
                        </div>
                        <div style="display: flex; gap: 0.75rem;">
                            <a href="#beranda" class="btn btn-outline" target="_blank" style="border-radius: 9999px;">
                                <i class="fas fa-eye"></i>
                                <span>Lihat Beranda</span>
                            </a>
                            <button onclick="AdminLandingPage.saveSettings()" class="btn btn-blue" style="border-radius: 9999px;">
                                <i class="fas fa-save"></i>
                                <span>Simpan Perubahan</span>
                            </button>
                        </div>
                    </div>

                    <form id="adminLandingForm" onsubmit="AdminLandingPage.handleFormSubmit(event)">
                        <!-- CARD 1: HERO SECTION -->
                        <div class="card" style="margin-bottom: 2rem;">
                            <div class="card-header" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                                <h3 style="font-size: 1.15rem; font-weight: 700; color: #1e1b4b; margin: 0;">
                                    <i class="fas fa-heading" style="color: #7c3aed; margin-right: 0.4rem;"></i>
                                    Bagian Utama (Hero Section)
                                </h3>
                            </div>
                            <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                                <div class="form-group">
                                    <label class="form-label">Teks Eyebrow (Label Atas)</label>
                                    <input 
                                        type="text" 
                                        id="field_hero_eyebrow" 
                                        class="form-control" 
                                        value="${escapeHtml(s.hero_eyebrow || 'PERPUSTAKAAN DIGITAL TERPADU')}"
                                        required
                                    >
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Judul Utama (Hero Title)</label>
                                    <input 
                                        type="text" 
                                        id="field_hero_title" 
                                        class="form-control" 
                                        value="${escapeHtml(s.hero_title || 'Rumah bagi setiap masa depan.')}"
                                        required
                                    >
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label class="form-label">Subjudul Deskripsi</label>
                                    <textarea 
                                        id="field_hero_subtitle" 
                                        class="form-control" 
                                        rows="2"
                                        required
                                    >${escapeHtml(s.hero_subtitle || '')}</textarea>
                                </div>
                            </div>
                        </div>

                        <!-- CARD 2: 5 HERO CARDS SHUFFLE DECK -->
                        <div class="card" style="margin-bottom: 2rem;">
                            <div class="card-header" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                                <h3 style="font-size: 1.15rem; font-weight: 700; color: #1e1b4b; margin: 0;">
                                    <i class="fas fa-layer-group" style="color: #7c3aed; margin-right: 0.4rem;"></i>
                                    Konten 5 Card Animasi Hero (Shuffle Deck)
                                </h3>
                                <small style="color: #64748b;">Kelima card ini bergeser bergantian secara animasi pada sisi kanan hero.</small>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                                ${cards.map((card, idx) => `
                                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem;">
                                        <h4 style="margin: 0 0 1rem; font-size: 0.95rem; font-weight: 700; color: #7c3aed; display: flex; align-items: center; gap: 0.5rem;">
                                            <span style="background: #7c3aed; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem;">${idx + 1}</span>
                                            Card #${idx + 1}
                                        </h4>
                                        <div style="display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 1rem;">
                                            <div class="form-group">
                                                <label class="form-label">Kategori / Badge</label>
                                                <input 
                                                    type="text" 
                                                    id="card_badge_${idx}" 
                                                    class="form-control" 
                                                    value="${escapeHtml(card.badge || '')}"
                                                    required
                                                >
                                            </div>
                                            <div class="form-group">
                                                <label class="form-label">Judul Card</label>
                                                <input 
                                                    type="text" 
                                                    id="card_title_${idx}" 
                                                    class="form-control" 
                                                    value="${escapeHtml(card.title || '')}"
                                                    required
                                                >
                                            </div>
                                            <div class="form-group">
                                                <label class="form-label">Label Footer / Edisi</label>
                                                <input 
                                                    type="text" 
                                                    id="card_meta_${idx}" 
                                                    class="form-control" 
                                                    value="${escapeHtml(card.meta || '')}"
                                                >
                                            </div>
                                            <div class="form-group" style="grid-column: span 3;">
                                                <label class="form-label">Deskripsi Singkat</label>
                                                <input 
                                                    type="text" 
                                                    id="card_desc_${idx}" 
                                                    class="form-control" 
                                                    value="${escapeHtml(card.desc || '')}"
                                                    required
                                                >
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- CARD 3: STATS BANNER -->
                        <div class="card" style="margin-bottom: 2rem;">
                            <div class="card-header" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                                <h3 style="font-size: 1.15rem; font-weight: 700; color: #1e1b4b; margin: 0;">
                                    <i class="fas fa-chart-line" style="color: #7c3aed; margin-right: 0.4rem;"></i>
                                    Banner Angka Statistik Perpustakaan
                                </h3>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem;">
                                <div class="form-group">
                                    <label class="form-label">Statistik 1 (Angka)</label>
                                    <input type="text" id="stat1_num" class="form-control" value="${escapeHtml(stats.stat1_num || '35K+')}">
                                    <label class="form-label" style="margin-top: 0.5rem;">Label 1</label>
                                    <input type="text" id="stat1_label" class="form-control" value="${escapeHtml(stats.stat1_label || 'Koleksi Buku & E-Book')}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Statistik 2 (Angka)</label>
                                    <input type="text" id="stat2_num" class="form-control" value="${escapeHtml(stats.stat2_num || '64,196')}">
                                    <label class="form-label" style="margin-top: 0.5rem;">Label 2</label>
                                    <input type="text" id="stat2_label" class="form-control" value="${escapeHtml(stats.stat2_label || 'Sirkulasi Peminjaman')}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Statistik 3 (Angka)</label>
                                    <input type="text" id="stat3_num" class="form-control" value="${escapeHtml(stats.stat3_num || '1,609')}">
                                    <label class="form-label" style="margin-top: 0.5rem;">Label 3</label>
                                    <input type="text" id="stat3_label" class="form-control" value="${escapeHtml(stats.stat3_label || 'Anggota Terdaftar')}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Statistik 4 (Angka)</label>
                                    <input type="text" id="stat4_num" class="form-control" value="${escapeHtml(stats.stat4_num || '250+')}">
                                    <label class="form-label" style="margin-top: 0.5rem;">Label 4</label>
                                    <input type="text" id="stat4_label" class="form-control" value="${escapeHtml(stats.stat4_label || 'Kategori Topik')}">
                                </div>
                            </div>
                        </div>

                        <!-- CARD 4: FOOTER & SCHOOL INFORMATION -->
                        <div class="card" style="margin-bottom: 2rem;">
                            <div class="card-header" style="border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                                <h3 style="font-size: 1.15rem; font-weight: 700; color: #1e1b4b; margin: 0;">
                                    <i class="fas fa-school" style="color: #7c3aed; margin-right: 0.4rem;"></i>
                                    Informasi Sekolah & Footer
                                </h3>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                                <div class="form-group">
                                    <label class="form-label">Nama Sekolah</label>
                                    <input type="text" id="field_school_name" class="form-control" value="${escapeHtml(s.school_name || 'SMP Informatika Bina Generasi')}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Alamat Perpustakaan</label>
                                    <input type="text" id="field_address" class="form-control" value="${escapeHtml(s.address || 'Jl. Raya Ciawi - Gadog No. 12, Kab. Bogor')}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Nomor Telepon</label>
                                    <input type="text" id="field_phone" class="form-control" value="${escapeHtml(s.phone || '(0251) 8241234')}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email Kontak</label>
                                    <input type="email" id="field_email" class="form-control" value="${escapeHtml(s.email || 'perpustakaan@smp-ibg.sch.id')}">
                                </div>
                                <div class="form-group" style="grid-column: span 2;">
                                    <label class="form-label">Deskripsi Singkat Sekolah</label>
                                    <textarea id="field_footer_desc" class="form-control" rows="2">${escapeHtml(s.footer_desc || '')}</textarea>
                                </div>
                            </div>
                        </div>

                        <!-- SUBMIT BUTTON -->
                        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
                            <a href="#beranda" class="btn btn-outline" style="border-radius: 9999px;">Batal</a>
                            <button type="submit" class="btn btn-blue" style="border-radius: 9999px; padding: 0.75rem 2rem;">
                                <i class="fas fa-save"></i>
                                <span>Simpan Semua Pengaturan</span>
                            </button>
                        </div>
                    </form>
                </div>
            `;

        } catch (err) {
            console.error('Error loading admin landing settings:', err);
            app.innerHTML = `
                ${Components.renderNavbar('kelola-beranda')}
                <div class="main-content">
                    <div style="padding: 2rem; color: #ef4444;">
                        Gagal memuat pengaturan. Silakan segarkan halaman.
                    </div>
                </div>
            `;
        }
    },

    handleFormSubmit(e) {
        e.preventDefault();
        this.saveSettings();
    },

    async saveSettings() {
        const cards = [];
        for (let i = 0; i < 5; i++) {
            cards.push({
                badge: document.getElementById(`card_badge_${i}`)?.value || 'LITERATUR',
                title: document.getElementById(`card_title_${i}`)?.value || '',
                desc: document.getElementById(`card_desc_${i}`)?.value || '',
                meta: document.getElementById(`card_meta_${i}`)?.value || ''
            });
        }

        const payload = {
            hero_eyebrow: document.getElementById('field_hero_eyebrow')?.value || '',
            hero_title: document.getElementById('field_hero_title')?.value || '',
            hero_subtitle: document.getElementById('field_hero_subtitle')?.value || '',
            school_name: document.getElementById('field_school_name')?.value || '',
            address: document.getElementById('field_address')?.value || '',
            phone: document.getElementById('field_phone')?.value || '',
            email: document.getElementById('field_email')?.value || '',
            footer_desc: document.getElementById('field_footer_desc')?.value || '',
            cards: cards,
            stats: {
                stat1_num: document.getElementById('stat1_num')?.value || '35K+',
                stat1_label: document.getElementById('stat1_label')?.value || 'Koleksi Buku & E-Book',
                stat2_num: document.getElementById('stat2_num')?.value || '64,196',
                stat2_label: document.getElementById('stat2_label')?.value || 'Sirkulasi Peminjaman',
                stat3_num: document.getElementById('stat3_num')?.value || '1,609',
                stat3_label: document.getElementById('stat3_label')?.value || 'Anggota Terdaftar',
                stat4_num: document.getElementById('stat4_num')?.value || '250+',
                stat4_label: document.getElementById('stat4_label')?.value || 'Kategori Topik'
            }
        };

        try {
            const res = await API.put('/landing/settings', payload);
            if (res && res.success) {
                Components.showToast('Pengaturan beranda berhasil disimpan!', 'success');
            } else {
                Components.showToast(res.message || 'Gagal menyimpan pengaturan', 'error');
            }
        } catch (err) {
            console.error('Error saving landing settings:', err);
            Components.showToast('Terjadi kesalahan koneksi server', 'error');
        }
    },

    getDefaultSettings() {
        return {
            hero_eyebrow: 'PERPUSTAKAAN DIGITAL TERPADU',
            hero_title: 'Rumah bagi setiap masa depan.',
            hero_subtitle: 'Koleksi buku pembelajaran, literatur digital, ensiklopedia dan referensi sains terlengkap untuk generasi berprestasi.',
            school_name: 'SMP Informatika Bina Generasi',
            address: 'Jl. Raya Ciawi - Gadog No. 12, Kab. Bogor',
            phone: '(0251) 8241234',
            email: 'perpustakaan@smp-ibg.sch.id',
            footer_desc: 'Perpustakaan SMP Informatika Bina Generasi merupakan pusat informasi dan sarana pembelajaran terpadu bagi seluruh civitas akademika.',
            cards: [
                { badge: 'LITERATUR', title: 'Koleksi Sastra & Novel Inspiratif', desc: 'Karya fiksi, novel petualangan, dan buku sastra pilihan untuk membangun karakter siswa.', meta: 'Edisi Pelajar 2026' },
                { badge: 'TEKNOLOGI', title: 'Modul Informatika & Koding', desc: 'Panduan pemrograman dasar, algoritma komputasi, dan kecerdasan buatan bagi generasi muda.', meta: 'Kurikulum Merdeka' },
                { badge: 'SAINS', title: 'Ensiklopedia Sains & Alam Semesta', desc: 'Eksplorasi fenomena fisika, biologi, antariksa, dan rahasia bumi dengan ilustrasi lengkap.', meta: 'Referensi Utama' },
                { badge: 'MATEMATIKA', title: 'Logika & Eksplorasi Berhitung', desc: 'Metode belajar matematika praktis, pemecahan masalah, dan olimpiade siswa SMP.', meta: 'Pengayaan Terpadu' },
                { badge: 'SEJARAH', title: 'Nusantara & Peradaban Dunia', desc: 'Perjalanan sejarah bangsa Indonesia, kebudayaan luhur, dan riwayat peradaban gemilang.', meta: 'Wawasan Kebangsaan' }
            ],
            stats: {
                stat1_num: '35K+',
                stat1_label: 'Koleksi Buku & E-Book',
                stat2_num: '64,196',
                stat2_label: 'Sirkulasi Peminjaman',
                stat3_num: '1,609',
                stat3_label: 'Anggota Terdaftar',
                stat4_num: '250+',
                stat4_label: 'Kategori Topik'
            }
        };
    }
};

window.AdminLandingPage = AdminLandingPage;
