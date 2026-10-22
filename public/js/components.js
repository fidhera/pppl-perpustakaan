// UI Components & Shared Helpers (Matching Figma Community Design)
const Components = {
    // Render Top Navbar based on active role
    renderNavbar(activePage = 'dashboard') {
        const user = Auth.getUser();
        if (!user) return '';

        let navItems = [];
        if (user.role === 'admin') {
            navItems = [
                { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-house' },
                { id: 'kelola-buku', label: 'Kelola Buku', icon: 'fa-solid fa-book-bookmark' },
                { id: 'kategori', label: 'Kategori', icon: 'fa-regular fa-folder-open' },
                { id: 'kondisi-buku', label: 'Kondisi Buku', icon: 'fa-solid fa-desktop' },
                { id: 'peminjaman', label: 'Peminjaman', icon: 'fa-regular fa-calendar-check' },
                { id: 'kelola-beranda', label: 'Kelola Beranda', icon: 'fa-solid fa-palette' },
                { id: 'manajemen-user', label: 'Manajemen User', icon: 'fa-solid fa-users' },
                { id: 'laporan', label: 'Laporan', icon: 'fa-regular fa-file-lines' },
                { id: 'profil', label: 'Profil', icon: 'fa-regular fa-user' }
            ];
        } else if (user.role === 'pimpinan') {
            navItems = [
                { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-house' },
                { id: 'laporan', label: 'Laporan', icon: 'fa-regular fa-file-lines' },
                { id: 'profil', label: 'Profil', icon: 'fa-regular fa-user' }
            ];
        } else {
            // Role Siswa
            navItems = [
                { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-house' },
                { id: 'katalog', label: 'Katalog Buku', icon: 'fa-solid fa-book-open' },
                { id: 'peminjaman-saya', label: 'Peminjaman Saya', icon: 'fa-regular fa-calendar-check' },
                { id: 'profil', label: 'Profil', icon: 'fa-regular fa-user' }
            ];
        }

        const navLinksHtml = navItems.map(item => `
            <a href="#${item.id}" class="nav-link ${activePage === item.id ? 'active' : ''}">
                <i class="${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `).join('');

        const mobileNavLinksHtml = navItems.map(item => `
            <a href="#${item.id}" class="mobile-nav-link ${activePage === item.id ? 'active' : ''}" onclick="Components.closeMobileNav()">
                <div class="mobile-nav-icon"><i class="${item.icon}"></i></div>
                <span>${item.label}</span>
            </a>
        `).join('');

        const roleClass = user.role === 'admin' ? 'role-admin' : (user.role === 'pimpinan' ? 'role-pimpinan' : 'role-siswa');

        return `
            <header class="top-navbar">
                <div class="navbar-inner">
                    <div class="navbar-primary">
                        <a href="#dashboard" class="navbar-brand">
                            <div class="navbar-brand-logo">
                                <img src="img/logo_smp-informatika-bina-generasi.png" alt="Logo SMP Informatika Bina Generasi" class="navbar-brand-img">
                            </div>
                            <span>Sistem Perpustakaan</span>
                        </a>

                        <nav class="navbar-nav desktop-only">
                            ${navLinksHtml}
                        </nav>
                    </div>

                    <div class="navbar-user-section">
                        <div class="user-info-text">
                            <div class="user-name">${user.nama || user.username}</div>
                            <span class="user-role-badge ${roleClass}">${user.role}</span>
                        </div>
                        <button class="btn-logout desktop-only" onclick="Auth.logout()">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                            <span>Keluar</span>
                        </button>
                        <button class="btn-mobile-nav-toggle mobile-only" id="btn-mobile-toggle" onclick="Components.toggleMobileNav(event)" aria-label="Menu navigasi">
                            <i class="fa-solid fa-bars"></i>
                        </button>
                    </div>
                </div>

                <!-- Mobile Backdrop & Drawer Navigation -->
                <div class="mobile-nav-backdrop" id="mobile-nav-backdrop" onclick="Components.closeMobileNav()"></div>
                <div class="mobile-nav-drawer" id="mobile-nav-drawer">
                    <div class="mobile-nav-header">
                        <div class="mobile-nav-user">
                            <div class="navbar-brand-icon" style="width: 2.2rem; height: 2.2rem; font-size: 1rem;">
                                <i class="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <div class="user-name">${user.nama || user.username}</div>
                                <span class="user-role-badge ${roleClass}">${user.role}</span>
                            </div>
                        </div>
                        <button class="mobile-nav-close" onclick="Components.closeMobileNav()" aria-label="Tutup menu">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="mobile-nav-items">
                        ${mobileNavLinksHtml}
                    </div>
                    <div class="mobile-nav-footer">
                        <button class="btn-logout mobile-logout-btn" onclick="Auth.logout(); Components.closeMobileNav();">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                            <span>Keluar dari Akun</span>
                        </button>
                    </div>
                </div>
            </header>
        `;
    },

    toggleMobileNav(e) {
        if (e) e.stopPropagation();
        const drawer = document.getElementById('mobile-nav-drawer');
        const backdrop = document.getElementById('mobile-nav-backdrop');
        const btn = document.getElementById('btn-mobile-toggle');
        if (!drawer) return;
        const isOpen = drawer.classList.contains('open');
        if (isOpen) {
            this.closeMobileNav();
        } else {
            drawer.classList.add('open');
            if (backdrop) backdrop.classList.add('open');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            document.body.style.overflow = 'hidden';
        }
    },

    closeMobileNav() {
        const drawer = document.getElementById('mobile-nav-drawer');
        const backdrop = document.getElementById('mobile-nav-backdrop');
        const btn = document.getElementById('btn-mobile-toggle');
        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        document.body.style.overflow = '';
    },

    setupPasswordToggles(root = document) {
        root.querySelectorAll('input[type="password"]:not([data-password-toggle-ready])').forEach(input => {
            input.dataset.passwordToggleReady = 'true';
            const wrapper = document.createElement('div');
            wrapper.className = 'password-input-wrap';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'password-visibility-toggle';
            toggle.setAttribute('aria-label', 'Tampilkan password');
            toggle.title = 'Tampilkan password';
            toggle.innerHTML = '<i class="fa-regular fa-eye" aria-hidden="true"></i>';
            toggle.addEventListener('click', () => {
                const visible = input.type === 'password';
                input.type = visible ? 'text' : 'password';
                toggle.setAttribute('aria-label', visible ? 'Sembunyikan password' : 'Tampilkan password');
                toggle.title = visible ? 'Sembunyikan password' : 'Tampilkan password';
                toggle.innerHTML = `<i class="fa-regular ${visible ? 'fa-eye-slash' : 'fa-eye'}" aria-hidden="true"></i>`;
            });
            wrapper.appendChild(toggle);
        });
    },

    // Badges
    renderConditionBadge(condition = 'Baik') {
        const cond = String(condition).toLowerCase();
        let cls = 'badge-baik';
        let icon = 'fa-check-circle';

        if (cond.includes('ringan')) {
            cls = 'badge-rusak-ringan';
            icon = 'fa-triangle-exclamation';
        } else if (cond.includes('berat')) {
            cls = 'badge-rusak-berat';
            icon = 'fa-circle-exclamation';
        } else if (cond.includes('hilang')) {
            cls = 'badge-hilang';
            icon = 'fa-circle-xmark';
        }

        return `<span class="badge ${cls}"><i class="fa-solid ${icon}"></i> ${condition}</span>`;
    },

    renderStatusBadge(status = 'Tersedia') {
        const stat = String(status).toLowerCase();
        let cls = 'badge-tersedia';
        if (stat === 'dipinjam') cls = 'badge-dipinjam';
        if (stat === 'hilang' || stat === 'ditolak') cls = 'badge-hilang';
        if (stat === 'pending') cls = 'badge-pending';
        if (stat === 'dikembalikan' || stat === 'disetujui') cls = 'badge-dikembalikan';

        return `<span class="badge ${cls}">${status}</span>`;
    },

    renderRoleBadge(role = 'siswa') {
        const r = String(role).toLowerCase();
        let cls = 'role-siswa';
        let icon = 'fa-graduation-cap';
        if (r === 'admin') {
            cls = 'role-admin';
            icon = 'fa-shield-halved';
        } else if (r === 'pimpinan') {
            cls = 'role-pimpinan';
            icon = 'fa-user-tie';
        }
        return `<span class="user-role-badge ${cls}"><i class="fa-solid ${icon}"></i> ${role}</span>`;
    },

    // Toast Notification
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'fa-check';
        if (type === 'error') icon = 'fa-circle-exclamation';
        if (type === 'info') icon = 'fa-info';

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.2s ease';
            setTimeout(() => toast.remove(), 200);
        }, 3000);
    },

    // Modal Manager
    showModal({ title, body, onSave, saveText = 'Simpan', cancelText = 'Batal', maxWidth = '580px' }) {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        if (!overlay || !content) return;

        content.innerHTML = `
            <div class="modal-box" style="max-width: ${maxWidth};">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="Components.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${body}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="Components.closeModal()">${cancelText}</button>
                    ${onSave ? `<button type="button" class="btn btn-primary" id="modal-btn-save">${saveText}</button>` : ''}
                </div>
            </div>
        `;

        if (onSave) {
            document.getElementById('modal-btn-save').addEventListener('click', onSave);
        }

        this.setupPasswordToggles(content);
        overlay.classList.remove('hidden');
    },

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.add('hidden');
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    },

    // Render Public Landing Navbar (Matching Screenshot 1 & 3)
    renderLandingNavbar(activeTab = 'beranda') {
        const user = Auth.getUser();
        const isLoggedIn = Auth.isLoggedIn();
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        return `
            <header class="landing-top-navbar">
                <div class="landing-navbar-inner">
                    <!-- Brand -->
                    <a href="#beranda" class="landing-brand">
                        <div class="landing-brand-logo">
                            <img src="img/logo_smp-informatika-bina-generasi.png" alt="Logo SMP Informatika Bina Generasi" class="landing-brand-img">
                        </div>
                        <div class="landing-brand-text">
                            <span class="landing-brand-title">SMP INFORMATIKA BINA GENERASI</span>
                            <span class="landing-brand-sub">PERPUSTAKAAN DIGITAL</span>
                        </div>
                    </a>

                    <!-- Center Navigation (Beranda, Profil, Petunjuk, Prosedur, Layanan) -->
                    <nav class="landing-nav-menu desktop-only">
                        <a href="#beranda" class="landing-nav-item ${activeTab === 'beranda' ? 'active' : ''}">Beranda</a>
                        <a href="javascript:void(0)" onclick="Components.showNavNotice('Profil Perpustakaan', 'Profil perpustakaan SMP Informatika Bina Generasi mencakup visi misi literasi, struktur pustakawan, dan tata tertib ruang baca.')" class="landing-nav-item ${activeTab === 'profil' ? 'active' : ''}">Profil <i class="fa-solid fa-chevron-down nav-sub-arrow"></i></a>
                        <a href="javascript:void(0)" onclick="Components.showNavNotice('Petunjuk Peminjaman', 'Siswa dapat mencari buku melalui menu Layanan/Katalog, memilih buku, lalu login menggunakan NISN untuk mengajukan peminjaman online.')" class="landing-nav-item ${activeTab === 'petunjuk' ? 'active' : ''}">Petunjuk <i class="fa-solid fa-chevron-down nav-sub-arrow"></i></a>
                        <a href="javascript:void(0)" onclick="Components.showNavNotice('Prosedur Perpustakaan', 'Buku yang telah disetujui dapat diambil di meja sirkulasi perpustakaan dengan menunjukkan kartu anggota / nomor peminjaman.')" class="landing-nav-item ${activeTab === 'prosedur' ? 'active' : ''}">Prosedur <i class="fa-solid fa-chevron-down nav-sub-arrow"></i></a>
                        <a href="#layanan" class="landing-nav-item ${activeTab === 'layanan' ? 'active' : ''}">Layanan <i class="fa-solid fa-chevron-down nav-sub-arrow"></i></a>
                    </nav>

                    <!-- Right Controls (Search Icon, Theme Toggle, Login/Dashboard Button) -->
                    <div class="landing-nav-actions">
                        <button class="landing-btn-icon" onclick="Components.openSearchModal()" title="Cari Buku (Shortcut)" aria-label="Buka Pencarian">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </button>
                        <button class="landing-btn-icon" onclick="Components.toggleTheme()" title="Ubah Tema" aria-label="Ganti Tema">
                            <i class="fa-regular ${isDark ? 'fa-sun' : 'fa-moon'}" id="landing-theme-icon"></i>
                        </button>
                        ${isLoggedIn ? `
                            <a href="#dashboard" class="btn btn-blue btn-nav-auth">
                                <i class="fa-solid fa-gauge-high"></i>
                                <span>Dashboard</span>
                            </a>
                        ` : `
                            <a href="#login" class="btn btn-outline btn-nav-auth">
                                <span>Login</span>
                            </a>
                        `}
                        <button class="btn-mobile-nav-toggle mobile-only" onclick="Components.toggleLandingMobileNav(event)" aria-label="Menu navigasi">
                            <i class="fa-solid fa-bars" id="landing-mobile-toggle-icon"></i>
                        </button>
                    </div>
                </div>

                <!-- Mobile Navigation Drawer -->
                <div class="landing-mobile-drawer" id="landing-mobile-drawer">
                    <div class="landing-mobile-nav-items">
                        <a href="#beranda" class="landing-mobile-item ${activeTab === 'beranda' ? 'active' : ''}" onclick="Components.closeLandingMobileNav()">
                            <i class="fa-solid fa-house"></i> Beranda
                        </a>
                        <a href="#layanan" class="landing-mobile-item ${activeTab === 'layanan' ? 'active' : ''}" onclick="Components.closeLandingMobileNav()">
                            <i class="fa-solid fa-book-bookmark"></i> Layanan & Koleksi
                        </a>
                        <a href="javascript:void(0)" onclick="Components.closeLandingMobileNav(); Components.showNavNotice('Profil Perpustakaan', 'Profil perpustakaan SMP Informatika Bina Generasi mencakup visi misi literasi dan sarana prasarana sekolah.');" class="landing-mobile-item">
                            <i class="fa-solid fa-school"></i> Profil
                        </a>
                        <a href="javascript:void(0)" onclick="Components.closeLandingMobileNav(); Components.showNavNotice('Petunjuk Peminjaman', 'Pilih buku di menu Layanan lalu login dengan NISN untuk pinjam buku.');" class="landing-mobile-item">
                            <i class="fa-solid fa-circle-question"></i> Petunjuk
                        </a>
                        <a href="javascript:void(0)" onclick="Components.closeLandingMobileNav(); Components.showNavNotice('Prosedur Perpustakaan', 'Buku dapat diambil di meja pustakawan setelah permohonan disetujui.');" class="landing-mobile-item">
                            <i class="fa-solid fa-clipboard-list"></i> Prosedur
                        </a>
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                            ${isLoggedIn ? `
                                <a href="#dashboard" class="btn btn-blue btn-block" onclick="Components.closeLandingMobileNav()">Ke Dashboard (${user.nama || user.username})</a>
                            ` : `
                                <a href="#login" class="btn btn-blue btn-block" onclick="Components.closeLandingMobileNav()">Masuk / Login</a>
                            `}
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    toggleLandingMobileNav(e) {
        if (e) e.stopPropagation();
        const drawer = document.getElementById('landing-mobile-drawer');
        const icon = document.getElementById('landing-mobile-toggle-icon');
        if (!drawer) return;
        const isOpen = drawer.classList.contains('open');
        if (isOpen) {
            this.closeLandingMobileNav();
        } else {
            drawer.classList.add('open');
            if (icon) icon.className = 'fa-solid fa-xmark';
        }
    },

    closeLandingMobileNav() {
        const drawer = document.getElementById('landing-mobile-drawer');
        const icon = document.getElementById('landing-mobile-toggle-icon');
        if (drawer) drawer.classList.remove('open');
        if (icon) icon.className = 'fa-solid fa-bars';
    },

    showNavNotice(title, message) {
        Components.showModal({
            title: title,
            body: `
                <div style="padding: 1rem 0; line-height: 1.6; color: #475569;">
                    <div style="display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 1rem;">
                        <div style="width: 2.5rem; height: 2.5rem; border-radius: var(--radius-md); background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; flex-shrink: 0;">
                            <i class="fa-solid fa-circle-info"></i>
                        </div>
                        <div>
                            <h4 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 0.35rem;">${title}</h4>
                            <p style="font-size: 0.875rem;">${message}</p>
                        </div>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius); padding: 0.85rem; font-size: 0.8rem; color: #64748b;">
                        Saat ini Anda berada di portal publik. Untuk mencari dan meminjam buku, silakan kunjungi menu <strong>Layanan</strong> atau gunakan kolom pencarian.
                    </div>
                </div>
            `,
            cancelText: 'Tutup'
        });
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('perpustakaan_theme', next);
        const icon = document.getElementById('landing-theme-icon');
        if (icon) icon.className = `fa-regular ${next === 'dark' ? 'fa-sun' : 'fa-moon'}`;
        Components.showToast(`Mode ${next === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`, 'info');
    },

    // Search Popup Modal (Matching Screenshot 2)
    openSearchModal() {
        let modal = document.getElementById('landing-search-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'landing-search-modal';
            modal.className = 'landing-search-modal-backdrop';
            modal.innerHTML = `
                <div class="landing-search-modal-box">
                    <button class="landing-search-close-btn" onclick="Components.closeSearchModal()" aria-label="Tutup">&times;</button>
                    <div class="landing-search-bar-wrap">
                        <div class="search-category-tag">
                            <i class="fa-solid fa-graduation-cap"></i>
                            <span>REPOSITORY</span>
                            <i class="fa-solid fa-chevron-down" style="font-size: 0.65rem;"></i>
                        </div>
                        <input type="text" id="landing-modal-search-input" class="landing-search-modal-input" placeholder="Cari skripsi, tugas akhir, buku pelajaran, materi riset..." autofocus>
                        <button class="landing-search-modal-btn" onclick="Components.submitModalSearch()" aria-label="Cari">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                    <div class="landing-search-modal-hint">
                        <span>Tekan <strong>ESC</strong> untuk menutup</span>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.addEventListener('click', (e) => {
                if (e.target === modal) Components.closeSearchModal();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') Components.closeSearchModal();
            });
        }

        modal.classList.add('open');
        const input = document.getElementById('landing-modal-search-input');
        if (input) {
            input.value = '';
            input.focus();
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    Components.submitModalSearch();
                }
            };
        }
    },

    closeSearchModal() {
        const modal = document.getElementById('landing-search-modal');
        if (modal) modal.classList.remove('open');
    },

    submitModalSearch() {
        const input = document.getElementById('landing-modal-search-input');
        const query = input ? input.value.trim() : '';
        Components.closeSearchModal();
        if (query) {
            window.location.hash = `#layanan?q=${encodeURIComponent(query)}`;
        } else {
            window.location.hash = '#layanan';
        }
    },

    // Render Public Landing Footer (Matching Screenshot 1)
    renderLandingFooter(settings) {
        const desc = settings?.footer?.description || 'Perpustakaan SMP Informatika Bina Generasi Bogor merupakan unit yang berfungsi memberikan pelayanan informasi kepada siswa, dewan guru dalam melaksanakan kegiatan belajar mengajar dengan koleksi buku fisik dan pustaka digital terlengkap.';
        const addr = settings?.footer?.address || 'Jl. Babakan Madang No. 45, Sentul, Bogor, Jawa Barat 16810';
        const phone = settings?.footer?.phone || '(0251) 827-0100';

        const cookieDismissed = localStorage.getItem('cookie_notice_dismissed');

        return `
            <footer class="landing-footer">
                <div class="landing-footer-container">
                    <!-- Column 1: School Brand & About -->
                    <div class="footer-brand-col">
                        <div class="footer-brand-header">
                            <img src="img/logo_smp-informatika-bina-generasi.png" alt="Logo SMP Informatika Bina Generasi" class="footer-logo">
                            <div>
                                <h3 class="footer-brand-title">SMP INFORMATIKA BINA GENERASI</h3>
                                <p class="footer-brand-subtitle">Perpustakaan Sekolah & Pusat Sumber Belajar Digital</p>
                            </div>
                        </div>
                        <p class="footer-desc">${desc}</p>
                        <div class="footer-contact">
                            <p><i class="fa-solid fa-location-dot"></i> ${addr}</p>
                            <p><i class="fa-solid fa-phone"></i> ${phone}</p>
                        </div>
                        <div class="footer-socials">
                            <a href="#" class="social-icon" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                            <a href="#" class="social-icon" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                            <a href="#" class="social-icon" aria-label="Youtube"><i class="fa-brands fa-youtube"></i></a>
                        </div>
                    </div>

                    <!-- Column 2: Layanan -->
                    <div class="footer-links-col">
                        <h4 class="footer-col-title">LAYANAN</h4>
                        <ul class="footer-link-list">
                            <li><a href="#layanan">Repository Siswa</a></li>
                            <li><a href="#layanan">Koleksi Buku Paket</a></li>
                            <li><a href="#layanan">Katalog Digital (OPAC)</a></li>
                            <li><a href="#layanan">Buku Sekolah Elektronik (BSE)</a></li>
                            <li><a href="#layanan">E-Paper & Majalah</a></li>
                        </ul>
                    </div>

                    <!-- Column 3: Petunjuk -->
                    <div class="footer-links-col">
                        <h4 class="footer-col-title">PETUNJUK</h4>
                        <ul class="footer-link-list">
                            <li><a href="javascript:void(0)" onclick="Components.showNavNotice('Keanggotaan Siswa', 'Seluruh siswa-siswi terdaftar otomatis menjadi anggota perpustakaan menggunakan NISN sebagai username.')">Keanggotaan</a></li>
                            <li><a href="javascript:void(0)" onclick="Components.showNavNotice('Unggah Karya', 'Siswa berprestasi dapat mengunggah cerpen, puisi, atau karya ilmiah melalui bantuan petugas pustakawan.')">Upload Tugas & Karya</a></li>
                            <li><a href="javascript:void(0)" onclick="Components.showNavNotice('Bebas Pustaka', 'Surat bebas pustaka untuk kelulusan kelas IX diterbitkan secara otomatis jika tidak ada tanggungan pinjaman.')">Bebas Pustaka</a></li>
                            <li><a href="javascript:void(0)" onclick="Components.showNavNotice('Usul Buku Baru', 'Ajukan saran buku baru ke staf perpustakaan untuk pengadaan koleksi semester depan.')">Usulan Buku</a></li>
                            <li><a href="javascript:void(0)" onclick="Components.showNavNotice('Blog Literasi', 'Artikel inspiratif seputar tips membaca cepat dan literasi digital sekolah.')">Blog Literasi</a></li>
                        </ul>
                    </div>

                    <!-- Column 4: Direktori Sekolah -->
                    <div class="footer-links-col">
                        <h4 class="footer-col-title">DIREKTORI SEKOLAH</h4>
                        <ul class="footer-link-list">
                            <li><a href="#">Website Resmi Sekolah</a></li>
                            <li><a href="#">Portal Siswa & Rapor</a></li>
                            <li><a href="#">Tata Usaha & Administrasi</a></li>
                            <li><a href="#">E-Learning SMP IBG</a></li>
                        </ul>
                    </div>
                </div>

                <div class="footer-bottom-bar">
                    <div class="footer-bottom-inner">
                        <p>© 2026 Perpustakaan SMP Informatika Bina Generasi Bogor. Seluruh hak cipta dilindungi.</p>
                        <p class="footer-city-tag">BOGOR, JAWA BARAT — INDONESIA</p>
                    </div>
                </div>

                <!-- Cookie Banner (Matching Screenshot 1) -->
                ${!cookieDismissed ? `
                    <div class="landing-cookie-banner" id="landing-cookie-banner">
                        <div class="cookie-banner-content">
                            <div class="cookie-icon"><i class="fa-solid fa-cookie-bite"></i></div>
                            <div class="cookie-text">
                                <strong>Kami menggunakan cookie</strong>
                                <p>Website ini menggunakan cookie analitik untuk meningkatkan pengalaman penelusuran buku dan performa layanan perpustakaan digital.</p>
                            </div>
                        </div>
                        <div class="cookie-banner-actions">
                            <button class="btn btn-outline btn-sm" onclick="Components.dismissCookieNotice()">Tolak Analitik</button>
                            <button class="btn btn-primary btn-sm" onclick="Components.dismissCookieNotice()" style="background: #7c3aed; border-color: #7c3aed; color: #fff;">Terima & Lanjutkan</button>
                        </div>
                    </div>
                ` : ''}
            </footer>
        `;
    },

    dismissCookieNotice() {
        const banner = document.getElementById('landing-cookie-banner');
        if (banner) {
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(20px)';
            setTimeout(() => banner.remove(), 250);
        }
        localStorage.setItem('cookie_notice_dismissed', 'true');
    }
};

