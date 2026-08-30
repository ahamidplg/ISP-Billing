# ERP ISP - Enterprise Resource Planning & FTTH Billing System

Sistem ERP & Manajemen Operasional Terpadu untuk Internet Service Provider (ISP) berbasis Fiber To The Home (FTTH), MikroTik RouterOS, dan OLT GPON/EPON.

---

## 📋 Daftar Isi

- [Tentang ERP ISP](#-tentang-erp-isp)
- [Fitur Utama](#-fitur-utama)
  - [1. Operasi Jaringan & Pelanggan](#1-operasi-jaringan--pelanggan)
  - [2. Pemetaan GIS Fiber Optik (FTTH Map)](#2-pemetaan-gis-fiber-optik-ftth-map)
  - [3. Billing & Siklus Penagihan Pelanggan](#3-billing--siklus-penagihan-pelanggan)
  - [4. Modul Keuangan & Pembukuan Kas (Finance & Ledger)](#4-modul-keuangan--pembukuan-kas-finance--ledger)
  - [5. Manajemen Aset & Inventaris Jaringan (Asset Management)](#5-manajemen-aset--inventaris-jaringan-asset-management)
  - [6. Manajemen HR, SPK Teknisi & Payroll (Human Resources)](#6-manajemen-hr-spk-teknisi--payroll-human-resources)
- [Arsitektur & Teknologi](#-arsitektur--teknologi)
- [Struktur Multi-Tenant](#-struktur-multi-tenant)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
- [Konfigurasi Keamanan (Firestore Rules)](#-konfigurasi-keamanan-firestore-rules)

---

## 🌐 Tentang ERP ISP

**ERP ISP** dirancang khusus untuk mempermudah operasional harian penyedia jasa internet (ISP) skala RT/RW Net hingga ISP komersial berlisensi. Platform ini mengintegrasikan seluruh alur kerja mulai dari provisioning jaringan di MikroTik/OLT, penagihan otomatis ke WhatsApp pelanggan, pelacakan redaman fiber optik, pembukuan kas laba-rugi, hingga manajemen tim teknisi lapangan dalam satu dasbor terpadu.

---

## 🚀 Fitur Utama

### 1. Operasi Jaringan & Pelanggan
- **Database Pelanggan**: Pencatatan profil pelanggan, status layanan (Aktif, Terisolir, Tertunda), paket bandwidth (Mbps), IP PPPoE/Static, serta mapping ODP & Port terhubung.
- **Integrasi MikroTik RouterOS**: Sinkronisasi secret PPPoE, monitoring interface, isolir otomatis pelanggan jatuh tempo via Address-List / Profile Isolir.
- **Manajemen OLT & Server**: Monitoring status perangkat OLT (EPON/GPON), ODC feeder, dan server RADIUS.

### 2. Pemetaan GIS Fiber Optik (FTTH Map)
- **Visualisasi Geospasial**: Peta interaktif distribusi kabel fiber optik, titik server (POP/Headend), ODC, dan kotak ODP.
- **Pelacakan Port ODP**: Cek sisa port ODP yang tersedia langsung dari peta saat ada calon pelanggan baru (PSB).
- **Rute Tarikan Dropcore**: Menghitung jarak estimasi kabel dari ODP terdekat ke rumah pelanggan.

### 3. Billing & Siklus Penagihan Pelanggan
- **Generate Tagihan Massal**: Pembuatan tagihan bulanan otomatis sesuai periode paket langganan.
- **WhatsApp Gateway Gateway**: Pengiriman invoice dan pengingat jatuh tempo (*reminder tagihan*) langsung ke WhatsApp pelanggan dengan 1 klik.
- **Konfirmasi Pembayaran Multi-Kanal**: Penerimaan bayar via Transfer Bank (BCA, Mandiri, BRI, BNI), QRIS, maupun Tunai ke Teknisi/Kolektor.
- **Kwitansi Digital**: Cetak dan bagikan bukti pembayaran resmi berformat Rupiah (`IDR`).

### 4. Modul Keuangan & Pembukuan Kas (Finance & Ledger)
- **Multi-Akun Kas & Bank**: Rekening Bank BCA, Mandiri, Kas Tunai Kantor, dan Kas Operasional Lapangan.
- **Buku Kas Masuk & Keluar**: Pencatatan pendapatan billing, pemasangan baru (PSB), beban upstream bandwidth (IXP/OIXP), sewa tiang & ROW, listrik POP/NOC, dan belanja material.
- **Laporan Laba Rugi (P&L Income Statement)**: Analisis *Gross Revenue*, *Net Profit Margin*, dan *Operating Expenses* secara *real-time*.
- **Pencatatan Modal & Dividen**: Rekapitulasi investasi peralatan dan bagi hasil usaha.

### 5. Manajemen Aset & Inventaris Jaringan (Asset Management)
- **Kategorisasi Aset**:
  - *Core Network & OLT*: Router Core CCR, OLT ZTE/Huawei/VSOL, Switch Core.
  - *Distribusi & ODP/ODC*: Kotak ODC 48-144 Core, ODP Pole 8/16 Port, Splitter PLC.
  - *CPE / ONT Pelanggan*: Modem FiberHome, ZTE F609/F660, Huawei HG8245, XPON ONT.
  - *Alat Kerja Teknisi*: Splicer Fiber (Sumitomo/Fujikura), OTDR, Power Meter (OPM), Cleaver.
  - *Kendaraan & Fasilitas*: Mobil operasional penarikan kabel, motor teknisi, rack server.
- **Tracking Detail**: No. Seri (SN), lokasi rak/gudang, status (Aktif, Standby, Rusak, Dipinjam), nilai perolehan, depresiasi tahunan, dan masa garansi.
- **Log Peminjaman & Servis**: Rekam serah terima alat kerja ke teknisi dan jadwal kalibrasi/perawatan rutin.

### 6. Manajemen HR, SPK Teknisi & Payroll (Human Resources)
- **Direktori Tim & Karyawan**: Data lengkap Lead Splicer, Teknisi Lapangan, NOC Engineer, Customer Service, dan Finance Admin.
- **Surat Perintah Kerja (SPK / Work Order)**:
  - Tipe pekerjaan: *Pasang Baru (PSB)*, *Troubleshooting Redaman/LOS*, *Penyambungan Kabel Putus (Fiber Cut)*, *Relokasi*, dan *Perapihan ODP*.
  - Catatan pengukuran redaman akhir (dBm) pasca-splicing.
  - Kirim detail penugasan SPK ke WhatsApp teknisi lapangan.
- **Penggajian & Slip Gaji**:
  - Perhitungan otomatis Gaji Pokok + Tunjangan Makan/Transport + Potongan BPJS.
  - **Insentif Komisi PSB**: Akumulasi bonus otomatis berdasarkan jumlah titik pasang baru yang diselesaikan teknisi.
  - Sinkronisasi instan pembayaran gaji ke pengeluaran Modul Keuangan.
- **Jadwal Shift Standby**: Pengaturan shift kerja operasional dan monitoring NOC 24/7.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion (Framer Motion).
- **Pemetaan**: Leaflet / OpenStreetMap dengan custom marker styling ODP & Fiber Lines.
- **Database & Auth**: Google Cloud Firestore (Real-time NoSQL) & Firebase Authentication.
- **Format Standar**: Mata uang Rupiah Indonesia (`Rp / IDR`) dan zona waktu lokal.

---

## 🏢 Struktur Multi-Tenant

Aplikasi menggunakan arsitektur *Tenant-Isolated* di mana seluruh koleksi data terisolasi berdasarkan `tenantId` (misalnya `fiber_ops_prod`), mencakup:
- `customers` & `billing_invoices`
- `financial_transactions` & `financial_accounts`
- `assets` & `asset_loans`
- `employees`, `attendances`, `work_orders`, dan `payroll_slips`

---

## 📦 Panduan Instalasi & Menjalankan

### Prasyarat
- Node.js (v18 atau lebih baru)
- NPM atau Yarn

### Langkah Instalasi
1. Clone repositori atau buka workspace:
   ```bash
   npm install
   ```

2. Konfigurasi Environment:
   Salin `.env.example` ke `.env.local` dan isi konfigurasi Firebase / Gemini:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. Jalankan Server Pengembangan:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

4. Build untuk Produksi:
   ```bash
   npm run build
   ```

---

## 🔒 Konfigurasi Keamanan (Firestore Rules)

Seluruh koleksi data dilindungi oleh security rules Firestore yang memvalidasi otentikasi user dan isolasi data per tenant untuk mencegah akses yang tidak sah.

---

*Dikembangkan untuk efisiensi dan keandalan operasional ISP Fiber Optik.*

