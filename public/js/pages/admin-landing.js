/**
 * Admin Landing Settings Page (#kelola-beranda)
 * Allows Admin & Petugas to customize all texts, hero deck 5 cards, facilities, stats, and footer
 * Design unified with the application's clean design system & standard buttons
 */

// Safe escapeHtml fallback
if (typeof window.escapeHtml !== 'function') {
    window.escapeHtml = function(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
}

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
            <div class="app-container">
                ${Components.renderNavbar('kelola-beranda')}
                <main class="main-content">
                    <div style="min-height: 50vh; display: flex; align-items: center; justify-content: center;">
                        <div style="text-align: center; color: #64748b;">
                            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--primary-blue); margin-bottom: 1rem;"></i>
                            <p style="font-weight: 500;">Memuat Pengaturan Beranda...</p>
                        </div>
                    </div>
                </main>
            </div>
        `;

        try {
            const res = await API.get('/landing/settings');
            this.settings = (res && res.success && res.data) ? res.data : this.getDefaultSettings();

            const s = this.settings;
            const cards = (s.cards && s.cards.length === 5) ? s.cards : ((s.hero_cards && s.hero_cards.length === 5) ? s.hero_cards : this.getDefaultSettings().cards);
            const stats = s.stats || this.getDefaultSettings().stats;

            app.innerHTML = `
                <div class="app-container">
                    ${Components.renderNavbar('kelola-beranda')}
                    <main class="main-content">
                        <!-- Page Header -->
                        <div class="page-header">
                            <div>
                                <h1 class="page-title">Pengaturan Beranda & Landing Page</h1>
                                <p class="page-subtitle">Sesuaikan teks hero, 5 card animasi beranda, statistik, dan informasi sekolah secara dinamis.</p>
                            </div>
                            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                                <a href="#beranda" class="btn btn-outline" target="_blank">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                    <span>Lihat Beranda</span>
                                </a>
                                <button type="button" id="btn-save-top" onclick="AdminLandingPage.saveSettings()" class="btn btn-blue">
                                    <i class="fa-solid fa-floppy-disk"></i>
                                    <span>Simpan Perubahan</span>
                                </button>
                            </div>
                        </div>

                        <form id="adminLandingForm" onsubmit="AdminLandingPage.handleFormSubmit(event)">
                            <!-- CARD 1: HERO SECTION -->
                            <div class="card">
                                <div class="card-header">
                                    <h2 class="card-title">
                                        <i class="fa-solid fa-heading" style="color: var(--primary-blue);"></i>
                                        <span>Bagian Utama (Hero Section)</span>
                                    </h2>
                                    <span class="badge badge-info"><i class="fa-solid fa-desktop"></i> Tampilan Utama</span>
                                </div>
                                <div class="card-content">
                                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label class="form-label" for="field_hero_eyebrow">Teks Eyebrow (Label Atas)</label>
                                            <input 
                                                type="text" 
                                                id="field_hero_eyebrow" 
                                                class="form-input" 
                                                value="${escapeHtml(s.hero_eyebrow || 'PERPUSTAKAAN DIGITAL TERPADU')}"
                                                placeholder="Contoh: PERPUSTAKAAN DIGITAL RESMI"
                                                required
                                            >
                                            <small style="color: #94a3b8; font-size: 0.775rem; margin-top: 0.25rem; display: block;">Label kecil di atas judul utama beranda.</small>
                                        </div>
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label class="form-label" for="field_hero_title">Judul Utama (Hero Title)</label>
                                            <input 
                                                type="text" 
                                                id="field_hero_title" 
                                                class="form-input" 
                                                value="${escapeHtml(s.hero_title || 'Rumah bagi setiap masa depan.')}"
                                                placeholder="Contoh: Rumah bagi setiap masa depan."
                                                required
                                            >
                                            <small style="color: #94a3b8; font-size: 0.775rem; margin-top: 0.25rem; display: block;">Headline besar yang menyambut pengunjung beranda.</small>
                                        </div>
                                        <div class="form-group" style="grid-column: 1 / -1; margin-bottom: 0;">
                                            <label class="form-label" for="field_hero_subtitle">Subjudul Deskripsi</label>
                                            <textarea 
                                                id="field_hero_subtitle" 
                                                class="form-textarea" 
                                                rows="3"
                                                placeholder="Deskripsi singkat seputar perpustakaan dan literasi sekolah..."
                                                required
                                            >${escapeHtml(s.hero_subtitle || '')}</textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- CARD 2: 5 HERO CARDS SHUFFLE DECK -->
                            <div class="card">
                                <div class="card-header">
                                    <div>
                                        <h2 class="card-title">
                                            <i class="fa-solid fa-layer-group" style="color: var(--primary-blue);"></i>
                                            <span>Konten 5 Card Animasi Hero (Shuffle Deck)</span>
                                        </h2>
                                        <p style="color: #64748b; font-size: 0.8rem; margin-top: 0.25rem; margin-bottom: 0;">
                                            Kelima card ini bergeser bergantian secara animasi pada sisi kanan hero beranda.
                                        </p>
                                    </div>
                                    <span class="badge badge-tersedia">5 Slot Aktif</span>
                                </div>
                                <div class="card-content">
                                    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                                        ${cards.map((card, idx) => `
                                            <div style="background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem; box-shadow: var(--shadow-xs); transition: all 0.2s ease;">
                                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9;">
                                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                                        <span class="badge badge-tersedia" style="font-weight: 700;">
                                                            <i class="fa-solid fa-clone"></i> Card #${idx + 1}
                                                        </span>
                                                        <span style="font-size: 0.825rem; font-weight: 600; color: #334155;">Slot Animasi Urutan ke-${idx + 1}</span>
                                                    </div>
                                                    <span style="font-size: 0.75rem; color: #94a3b8;">Rotasi Otomatis</span>
                                                </div>
                                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                                                    <div class="form-group" style="margin-bottom: 0;">
                                                        <label class="form-label" for="card_badge_${idx}">Kategori / Badge</label>
                                                        <input 
                                                            type="text" 
                                                            id="card_badge_${idx}" 
                                                            class="form-input" 
                                                            value="${escapeHtml(card.badge || '')}"
                                                            placeholder="Contoh: KURIKULUM MERDEKA"
                                                            required
                                                        >
                                                    </div>
                                                    <div class="form-group" style="margin-bottom: 0;">
                                                        <label class="form-label" for="card_title_${idx}">Judul Card</label>
                                                        <input 
                                                            type="text" 
                                                            id="card_title_${idx}" 
                                                            class="form-input" 
                                                            value="${escapeHtml(card.title || '')}"
                                                            placeholder="Contoh: Koleksi Pelajaran & Modul Siswa"
                                                            required
                                                        >
                                                    </div>
                                                    <div class="form-group" style="margin-bottom: 0;">
                                                        <label class="form-label" for="card_meta_${idx}">Label Footer / Edisi</label>
                                                        <input 
                                                            type="text" 
                                                            id="card_meta_${idx}" 
                                                            class="form-input" 
                                                            value="${escapeHtml(card.meta || '')}"
                                                            placeholder="Contoh: Edisi Pelajar 2026"
                                                        >
                                                    </div>
                                                    <div class="form-group" style="grid-column: 1 / -1; margin-bottom: 0;">
                                                        <label class="form-label" for="card_desc_${idx}">Deskripsi Singkat</label>
                                                        <input 
                                                            type="text" 
                                                            id="card_desc_${idx}" 
                                                            class="form-input" 
                                                            value="${escapeHtml(card.desc || '')}"
                                                            placeholder="Penjelasan ringkas isi kartu koleksi..."
                                                            required
                                                        >
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            <!-- CARD 3: STATS BANNER -->
                            <div class="card">
                                <div class="card-header">
                                    <h2 class="card-title">
                                        <i class="fa-solid fa-chart-line" style="color: var(--primary-blue);"></i>
                                        <span>Banner Angka Statistik Perpustakaan</span>
                                    </h2>
                                    <span class="badge badge-info"><i class="fa-solid fa-gauge"></i> Counter Beranda</span>
                                </div>
                                <div class="card-content">
                                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem;">
                                        <!-- Stat 1 -->
                                        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem;">
                                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.85rem;">
                                                <div class="stat-icon icon-blue" style="width: 2rem; height: 2rem; font-size: 0.85rem;">
                                                    <i class="fa-solid fa-book-bookmark"></i>
                                                </div>
                                                <span style="font-weight: 700; font-size: 0.85rem; color: #1e293b;">Statistik 1</span>
                                            </div>
                                            <div class="form-group">
                                                <label class="form-label" for="stat1_num">Angka / Nilai</label>
                                                <input type="text" id="stat1_num" class="form-input" value="${escapeHtml(stats.stat1_num || '35K+')}" placeholder="Contoh: 35K+">
                                            </div>
                                            <div class="form-group" style="margin-bottom: 0;">
                                                <label class="form-label" for="stat1_label">Label Keterangan</label>
                                                <input type="text" id="stat1_label" class="form-input" value="${escapeHtml(stats.stat1_label || 'Koleksi Buku & E-Book')}" placeholder="Contoh: Koleksi Buku & E-Book">
                                            </div>
                                        </div>

                                        <!-- Stat 2 -->
                                        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem;">
                                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.85rem;">
                                                <div class="stat-icon icon-green" style="width: 2rem; height: 2rem; font-size: 0.85rem;">
                                                    <i class="fa-solid fa-repeat"></i>
                                                </div>
                                                <span style="font-weight: 700; font-size: 0.85rem; color: #1e293b;">Statistik 2</span>
                                            </div>
                                            <div class="form-group">
                                                <label class="form-label" for="stat2_num">Angka / Nilai</label>
                                                <input type="text" id="stat2_num" class="form-input" value="${escapeHtml(stats.stat2_num || '64,196')}" placeholder="Contoh: 64,196">
                                            </div>
                                            <div class="form-group" style="margin-bottom: 0;">
                                                <label class="form-label" for="stat2_label">Label Keterangan</label>
                                                <input type="text" id="stat2_label" class="form-input" value="${escapeHtml(stats.stat2_label || 'Sirkulasi Peminjaman')}" placeholder="Contoh: Sirkulasi Peminjaman">
                                            </div>
                                        </div>

                                        <!-- Stat 3 -->
                                        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem;">
                                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.85rem;">
                                                <div class="stat-icon icon-purple" style="width: 2rem; height: 2rem; font-size: 0.85rem;">
                                                    <i class="fa-solid fa-users"></i>
                                                </div>
                                                <span style="font-weight: 700; font-size: 0.85rem; color: #1e293b;">Statistik 3</span>
                                            </div>
                                            <div class="form-group">
                                                <label class="form-label" for="stat3_num">Angka / Nilai</label>
                                                <input type="text" id="stat3_num" class="form-input" value="${escapeHtml(stats.stat3_num || '1,609')}" placeholder="Contoh: 1,609">
                                            </div>
                                            <div class="form-group" style="margin-bottom: 0;">
                                                <label class="form-label" for="stat3_label">Label Keterangan</label>
                                                <input type="text" id="stat3_label" class="form-input" value="${escapeHtml(stats.stat3_label || 'Anggota Terdaftar')}" placeholder="Contoh: Anggota Terdaftar">
                                            </div>
                                        </div>

                                        <!-- Stat 4 -->
                                        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem;">
                                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.85rem;">
                                                <div class="stat-icon icon-orange" style="width: 2rem; height: 2rem; font-size: 0.85rem;">
                                                    <i class="fa-solid fa-tags"></i>
                                                </div>
                                                <span style="font-weight: 700; font-size: 0.85rem; color: #1e293b;">Statistik 4</span>
                                            </div>
                                            <div class="form-group">
                                                <label class="form-label" for="stat4_num">Angka / Nilai</label>
                                                <input type="text" id="stat4_num" class="form-input" value="${escapeHtml(stats.stat4_num || '250+')}" placeholder="Contoh: 250+">
                                            </div>
                                            <div class="form-group" style="margin-bottom: 0;">
                                                <label class="form-label" for="stat4_label">Label Keterangan</label>
                                                <input type="text" id="stat4_label" class="form-input" value="${escapeHtml(stats.stat4_label || 'Kategori Topik')}" placeholder="Contoh: Kategori Topik">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- CARD 4: FOOTER & SCHOOL INFORMATION -->
                            <div class="card">
                                <div class="card-header">
                                    <h2 class="card-title">
                                        <i class="fa-solid fa-school" style="color: var(--primary-blue);"></i>
                                        <span>Informasi Sekolah & Footer</span>
                                    </h2>
                                    <span class="badge badge-info"><i class="fa-solid fa-circle-info"></i> Kontak & Lokasi</span>
                                </div>
                                <div class="card-content">
                                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label class="form-label" for="field_school_name">Nama Sekolah</label>
                                            <input type="text" id="field_school_name" class="form-input" value="${escapeHtml(s.school_name || 'SMP Informatika Bina Generasi')}" placeholder="Nama resmi institusi sekolah">
                                        </div>
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label class="form-label" for="field_address">Alamat Perpustakaan</label>
                                            <input type="text" id="field_address" class="form-input" value="${escapeHtml(s.address || 'Jl. Raya Ciawi - Gadog No. 12, Kab. Bogor')}" placeholder="Alamat lengkap gedung perpustakaan">
                                        </div>
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label class="form-label" for="field_phone">Nomor Telepon</label>
                                            <input type="text" id="field_phone" class="form-input" value="${escapeHtml(s.phone || '(0251) 8241234')}" placeholder="Nomor telepon kantor / staf">
                                        </div>
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label class="form-label" for="field_email">Email Kontak</label>
                                            <input type="email" id="field_email" class="form-input" value="${escapeHtml(s.email || 'perpustakaan@smp-ibg.sch.id')}" placeholder="Email resmi layanan perpustakaan">
                                        </div>
                                        <div class="form-group" style="grid-column: 1 / -1; margin-bottom: 0;">
                                            <label class="form-label" for="field_footer_desc">Deskripsi Singkat Sekolah</label>
                                            <textarea id="field_footer_desc" class="form-textarea" rows="3" placeholder="Informasi profil singkat yang tertera pada bagian footer situs...">${escapeHtml(s.footer_desc || '')}</textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- SUBMIT BUTTONS BAR -->
                            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem; padding-top: 0.5rem; margin-bottom: 2rem;">
                                <a href="#beranda" class="btn btn-outline">
                                    <i class="fa-solid fa-xmark"></i>
                                    <span>Batal</span>
                                </a>
                                <button type="submit" id="btn-save-bottom" class="btn btn-blue" style="padding: 0.65rem 1.75rem;">
                                    <i class="fa-solid fa-floppy-disk"></i>
                                    <span>Simpan Semua Pengaturan</span>
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
            `;

        } catch (err) {
            console.error('Error loading admin landing settings:', err);
            app.innerHTML = `
                <div class="app-container">
                    ${Components.renderNavbar('kelola-beranda')}
                    <main class="main-content">
                        <div class="card" style="padding: 2rem; text-align: center;">
                            <i class="fa-solid fa-circle-exclamation" style="font-size: 2.5rem; color: #ef4444; margin-bottom: 1rem;"></i>
                            <h3 style="color: #0f172a; margin-bottom: 0.5rem;">Gagal Memuat Pengaturan</h3>
                            <p style="color: #64748b; margin-bottom: 1.5rem;">Terjadi kesalahan saat mengambil konfigurasi dari server.</p>
                            <button onclick="AdminLandingPage.render()" class="btn btn-blue">
                                <i class="fa-solid fa-rotate"></i>
                                <span>Coba Lagi</span>
                            </button>
                        </div>
                    </main>
                </div>
            `;
        }
    },

    handleFormSubmit(e) {
        e.preventDefault();
        this.saveSettings();
    },

    async saveSettings() {
        const btnTop = document.getElementById('btn-save-top');
        const btnBottom = document.getElementById('btn-save-bottom');

        const setLoadingState = (loading) => {
            [btnTop, btnBottom].forEach(btn => {
                if (!btn) return;
                btn.disabled = loading;
                btn.style.opacity = loading ? '0.7' : '1';
                btn.innerHTML = loading 
                    ? '<i class="fa-solid fa-circle-notch fa-spin"></i><span>Menyimpan...</span>'
                    : '<i class="fa-solid fa-floppy-disk"></i><span>Simpan Perubahan</span>';
            });
        };

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

        setLoadingState(true);

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
        } finally {
            setLoadingState(false);
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
