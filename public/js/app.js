// Main App Entrypoint - Setup all routes
document.addEventListener('DOMContentLoaded', () => {
    // Public Landing Page Routes
    Router.add('beranda', () => LandingPage.render());
    Router.add('layanan', () => LandingServicesPage.render());
    Router.add('kelola-beranda', () => AdminLandingPage.render());

    // Auth route
    Router.add('login', () => LoginPage.render());
    Router.add('lengkapi-akun', () => FirstLoginPage.render());

    // Main App Routes (matching Figma reference)
    Router.add('dashboard', () => DashboardPage.render());
    Router.add('kelola-buku', () => BookManagementPage.render());
    Router.add('kategori', () => CategoryManagementPage.render());
    Router.add('kondisi-buku', () => BookConditionPage.render());
    Router.add('peminjaman', () => CirculationPage.render());
    Router.add('manajemen-user', () => UserManagementPage.render());
    Router.add('laporan', () => ReportsPage.render());
    Router.add('profil', () => ProfilePage.render());

    // Siswa / Student Specific Routes
    Router.add('katalog', () => CatalogPage.render());
    Router.add('peminjaman-saya', () => MyBookingsPage.render());

    // Initialize Router
    Router.init();
});
