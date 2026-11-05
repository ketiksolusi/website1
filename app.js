document.addEventListener("DOMContentLoaded", () => {
    const trackForm = document.getElementById('trackForm');
    const trackResult = document.getElementById('trackResult');
    
    // LINK WEB APP GOOGLE APPS SCRIPT TERBARU ANDA
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyTtHtmxb-ZoogjkjkItRw0vKiz4LmoE2D7ZsLyL16XAtf2GzMncBTyzK2vLUttxvZM/exec";

    // FUNGSI PEWARNAAN OTOMATIS BERDASARKAN KATA KUNCI STATUS
    function getBadgeColor(statusText) {
        const text = statusText.toLowerCase();
        
        if (text.includes('tunggu') || text.includes('bayar') || text.includes('antre')) {
            return 'bg-gray-500 text-white'; 
        } 
        else if (text.includes('proses') || text.includes('koding') || text.includes('revisi') || text.includes('sedang') || text.includes('kerja') || text.includes('50%')) {
            return 'bg-orange text-white'; 
        } 
        else if (text.includes('selesai') || text.includes('dikirim') || text.includes('lunas') || text.includes('sukses')) {
            return 'bg-green-500 text-white'; 
        } 
        else {
            return 'bg-teal text-white'; 
        }
    }

    if(trackForm) {
        trackForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const inputId = document.getElementById('trackId').value.trim().toUpperCase();
            
            if(inputId !== '') {
                trackResult.innerHTML = `<p class="text-center text-teal font-bold"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Mencari data ke database...</p>`;
                trackResult.classList.remove('hidden');

                try {
                    // Mengambil data JSON dari Google Apps Script khusus tab pesanan
                    const response = await fetch(WEB_APP_URL + "?type=pesanan");
                    const data = await response.json();
                    
                    let foundData = null;

                    // Melakukan pencarian berdasarkan id_trx
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].id_trx && data[i].id_trx.toUpperCase() === inputId) {
                            const statusPesanan = data[i].status ? data[i].status.trim() : "Diproses";
                            foundData = {
                                layanan: data[i].layanan ? data[i].layanan.trim() : "",
                                status: statusPesanan,
                                tanggal: data[i].tanggal ? data[i].tanggal.trim() : "Terbaru",
                                keterangan: data[i].keterangan ? data[i].keterangan.trim() : "Proses pengerjaan tugas sedang berlangsung.",
                                warnaBadge: getBadgeColor(statusPesanan) 
                            };
                            break; 
                        }
                    }

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
