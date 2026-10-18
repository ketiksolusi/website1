document.addEventListener("DOMContentLoaded", () => {
    const trackForm = document.getElementById('trackForm');
    const trackResult = document.getElementById('trackResult');
    
    // LINK DATABASE SPREADSHEET MILIKMU (Sudah diubah ke format export CSV)
    const sheetCSV_URL = "https://docs.google.com/spreadsheets/d/1mCH2kkcE-bJgEU7nzCLvZk5JeLUFEO_JBcyTgeCanvQ/export?format=csv";

    // FUNGSI PEWARNAAN OTOMATIS BERDASARKAN KATA KUNCI STATUS
    function getBadgeColor(statusText) {
        const text = statusText.toLowerCase();
        
        // Jika mengandung kata: tunggu, bayar, antre
        if (text.includes('tunggu') || text.includes('bayar') || text.includes('antre')) {
            return 'bg-gray-500 text-white'; // Warna Abu-abu (Pending)
        } 
        // Jika mengandung kata: proses, koding, revisi, sedang, kerja
        else if (text.includes('proses') || text.includes('koding') || text.includes('revisi') || text.includes('sedang') || text.includes('kerja')) {
            return 'bg-orange text-white'; // Warna Oranye (Berjalan)
        } 
        // Jika mengandung kata: selesai, dikirim, lunas, sukses
        else if (text.includes('selesai') || text.includes('dikirim') || text.includes('lunas') || text.includes('sukses')) {
            return 'bg-green-500 text-white'; // Warna Hijau (Berhasil)
        } 
        // Warna Default jika kata tidak dikenali
        else {
            return 'bg-teal text-white'; // Warna Toska khas Ketik Solusi
        }
    }

    if(trackForm) {
        trackForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const inputId = document.getElementById('trackId').value.trim().toUpperCase();
            
            if(inputId !== '') {
                // Tampilkan efek loading
                trackResult.innerHTML = `<p class="text-center text-teal font-bold"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Mencari data ke database...</p>`;
                trackResult.classList.remove('hidden');

                try {
                    // Mengambil data dari Google Sheets
                    const response = await fetch(sheetCSV_URL);
                    const csvText = await response.text();
                    
                    // Memecah baris data CSV
                    const rows = csvText.split('\n');
                    let foundData = null;

                    // Mulai pencarian dari baris kedua (index 1) untuk melewati judul kolom
                    for (let i = 1; i < rows.length; i++) {
                        // Memecah kolom berdasarkan tanda koma
                        const columns = rows[i].split(',');
                        
                        // Cek apakah kolom ID (kolom ke-0) sama dengan input pengguna
                        if (columns.length > 1 && columns[0].trim().toUpperCase() === inputId) {
                            const statusPesanan = columns[2] ? columns[2].trim() : "";
                            
                            foundData = {
                                layanan: columns[1] ? columns[1].trim() : "",
                                status: statusPesanan,
                                tanggal: columns[3] ? columns[3].trim() : "",
                                keterangan: columns[4] ? columns[4].trim() : "",
                                // Panggil fungsi warna otomatis
                                warnaBadge: getBadgeColor(statusPesanan) 
                            };
                            break; 
                        }
                    }

                    // Tampilkan hasil ke layar
                    if (foundData) {
                        trackResult.innerHTML = `
                            <div class="flex items-center justify-between mb-4">
                                <h4 class="font-bold text-navy">Pesanan: <span class="text-orange">${inputId}</span></h4>
                                <span class="${foundData.warnaBadge} px-3 py-1 rounded-full text-xs font-bold">${foundData.status}</span>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner">
                                <p class="text-sm font-bold text-navy mb-1"><i class="fa-solid fa-box-open text-gray-400 mr-2"></i> ${foundData.layanan}</p>
                                <p class="text-xs text-gray-500 mb-3"><i class="fa-regular fa-clock text-gray-400 mr-2"></i> Update terakhir: ${foundData.tanggal}</p>
                                <p class="text-sm text-gray-700 italic border-l-2 border-orange pl-3">" ${foundData.keterangan} "</p>
                            </div>
                        `;
                    } else {
                        // KONDISI JIKA ID TIDAK ADA DI DALAM SPREADSHEET
                        trackResult.innerHTML = `
                            <div class="bg-red-50 p-4 rounded-xl border border-red-200 text-center shadow-inner">
                                <i class="fa-solid fa-circle-exclamation text-red-500 text-3xl mb-2"></i>
                                <p class="font-bold text-red-600 text-lg">Paket Tidak Ditemukan</p>
                                <p class="text-sm text-red-500 mt-1">Maaf, ID Pesanan "${inputId}" tidak ada dalam sistem kami. Pastikan kode yang dimasukkan sudah benar.</p>
                            </div>
                        `;
                    }
                    
                } catch (error) {
                    trackResult.innerHTML = `<p class="text-center text-red-500 font-bold bg-red-50 p-4 rounded-xl">Gagal terhubung ke Database. Periksa koneksi internetmu.</p>`;
                }
            }
        });
    }
});