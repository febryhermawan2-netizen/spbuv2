let teksStrukGlobal = "";
let bluetoothCharacteristic = null;
let bluetoothDeviceGlobal = null;

window.onload = function() {
    muatDaftarProfil();
    document.getElementById("waktuCustom").value = dapatkanWaktu();
    tampilkanRiwayat();
};

// --- FUNGSI PINDAH TAB ---
function pindahTab(namaTab) {
    document.getElementById('btnTabTransaksi').classList.remove('active');
    document.getElementById('btnTabSetelan').classList.remove('active');
    document.getElementById('tabTransaksi').classList.remove('active');
    document.getElementById('tabSetelan').classList.remove('active');
    
    if (namaTab === 'transaksi') {
        document.getElementById('btnTabTransaksi').classList.add('active');
        document.getElementById('tabTransaksi').classList.add('active');
    } else {
        document.getElementById('btnTabSetelan').classList.add('active');
        document.getElementById('tabSetelan').classList.add('active');
    }
}

// --- SISTEM MANAJEMEN PROFIL ---
function getFormDataProfil() {
    return {
        noSpbu: document.getElementById('noSpbu').value,
        namaSpbu: document.getElementById('namaSpbu').value,
        alamatSpbu1: document.getElementById('alamatSpbu1').value,
        alamatSpbu2: document.getElementById('alamatSpbu2').value,
        jenisBbm: document.getElementById('jenisBbm').value,
        hargaJual: document.getElementById('hargaJual').value,
        subsidiLiter: document.getElementById('subsidiLiter').value,
        pesanSubsidi: document.getElementById('pesanSubsidi').value,
        keterangan: document.getElementById('keterangan').value
    };
}

function muatDaftarProfil() {
    const dropdown = document.getElementById("dropdownProfil");
    dropdown.innerHTML = '<option value="">-- Ketik Format Baru di Bawah --</option>';
    let daftar = JSON.parse(localStorage.getItem('daftarProfilSPBU')) || [];
    
    daftar.forEach((profil, index) => {
        let opt = document.createElement("option");
        opt.value = index;
        opt.text = profil.namaProfil;
        dropdown.appendChild(opt);
    });
}

function muatProfilPilihan() {
    const index = document.getElementById("dropdownProfil").value;
    if (index === "") return; 
    
    let daftar = JSON.parse(localStorage.getItem('daftarProfilSPBU')) || [];
    const data = daftar[index];
    
    if (data) {
        document.getElementById('noSpbu').value = data.noSpbu || '';
        document.getElementById('namaSpbu').value = data.namaSpbu || '';
        document.getElementById('alamatSpbu1').value = data.alamatSpbu1 || '';
        document.getElementById('alamatSpbu2').value = data.alamatSpbu2 || '';
        document.getElementById('jenisBbm').value = data.jenisBbm || '';
        document.getElementById('hargaJual').value = data.hargaJual || '';
        document.getElementById('subsidiLiter').value = data.subsidiLiter || '';
        document.getElementById('pesanSubsidi').value = data.pesanSubsidi || '';
        document.getElementById('keterangan').value = data.keterangan || '';
    }
}

function simpanSebagaiBaru() {
    let namaProfil = prompt("Masukkan NAMA untuk format ini\n(Contoh: SPBU Soetomo - Pertalite):");
    if (!namaProfil) return;
    
    let dataBaru = getFormDataProfil();
    dataBaru.namaProfil = namaProfil;
    
    let daftar = JSON.parse(localStorage.getItem('daftarProfilSPBU')) || [];
    daftar.push(dataBaru);
    localStorage.setItem('daftarProfilSPBU', JSON.stringify(daftar));
    
    muatDaftarProfil();
    document.getElementById("dropdownProfil").value = daftar.length - 1;
    alert("Format '" + namaProfil + "' berhasil disimpan!");
}

function simpanPerubahan() {
    const index = document.getElementById("dropdownProfil").value;
    if (index === "") {
        alert("Pilih format dari kotak pilihan (dropdown) terlebih dahulu.");
        return;
    }
    
    let daftar = JSON.parse(localStorage.getItem('daftarProfilSPBU')) || [];
    let namaProfilLama = daftar[index].namaProfil; 
    
    let dataBaru = getFormDataProfil();
    dataBaru.namaProfil = namaProfilLama; 
    
    daftar[index] = dataBaru;
    localStorage.setItem('daftarProfilSPBU', JSON.stringify(daftar));
    alert("Perubahan pada format '" + namaProfilLama + "' berhasil diupdate!");
}

function hapusProfil() {
    const index = document.getElementById("dropdownProfil").value;
    if (index === "") {
        alert("Pilih format yang mau dihapus.");
        return;
    }
    
    let daftar = JSON.parse(localStorage.getItem('daftarProfilSPBU')) || [];
    let namaProfil = daftar[index].namaProfil;
    
    if(confirm("Yakin ingin menghapus format '" + namaProfil + "' selamanya?")) {
        daftar.splice(index, 1);
        localStorage.setItem('daftarProfilSPBU', JSON.stringify(daftar));
        muatDaftarProfil();
        document.getElementById("dropdownProfil").value = "";
        alert("Format terhapus.");
    }
}

// --- LOGIKA FITUR BACKUP & RESTORE DATA ---
function exportBackupData() {
    let daftar = localStorage.getItem('daftarProfilSPBU');
    let riwayat = localStorage.getItem('riwayatStrukBbm');
    
    if (!daftar && !riwayat) {
        alert("Belum ada data format SPBU atau riwayat yang bisa di-backup!");
        return;
    }
    
    let paketBackup = {
        daftarProfilSPBU: JSON.parse(daftar) || [],
        riwayatStrukBbm: JSON.parse(riwayat) || []
    };
    
    let dataString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(paketBackup, null, 2));
    let linkDownload = document.createElement('a');
    
    let d = new Date();
    let formatTgl = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();
    
    linkDownload.setAttribute("href", dataString);
    linkDownload.setAttribute("download", "BACKUP_KASIR_SPBU_" + formatTgl + ".json");
    document.body.appendChild(linkDownload);
    linkDownload.click();
    linkDownload.remove();
}

function triggerImportBackup() {
    document.getElementById('inputBackup').click();
}

function importBackupData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const pembaca = new FileReader();
    pembaca.onload = function(e) {
        try {
            const dataHasilMembaca = JSON.parse(e.target.result);
            if (dataHasilMembaca.daftarProfilSPBU) {
                if (confirm("Apakah Anda yakin ingin memuat file backup ini?")) {
                    localStorage.setItem('daftarProfilSPBU', JSON.stringify(dataHasilMembaca.daftarProfilSPBU));
                    if (dataHasilMembaca.riwayatStrukBbm) {
                        localStorage.setItem('riwayatStrukBbm', JSON.stringify(dataHasilMembaca.riwayatStrukBbm));
                    }
                    muatDaftarProfil();
                    tampilkanRiwayat();
                    alert("🎉 RESTORE DATA BERHASIL!");
                }
            } else {
                alert("Gagal: Struktur file backup tidak dikenali.");
            }
        } catch (err) {
            alert("Error: Gagal membaca file.");
        }
    };
    pembaca.readAsText(file);
    input.value = "";
}


document.getElementById('inputLogo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const logo = document.getElementById('logoUpload');
    if (file) { const reader = new FileReader(); reader.onload = (e) => { logo.src = e.target.result; logo.style.display = 'inline-block'; }; reader.readAsDataURL(file); }
});

function centerText(text, maxWidth) { return text.length >= maxWidth ? text : " ".repeat(Math.floor((maxWidth - text.length) / 2)) + text; }

function autoWrapCenter(text, maxWidth) {
    if (!text) return "";
    const words = text.split(" ");
    let lines = []; let currentLine = "";
    words.forEach(word => {
        if ((currentLine + word).length > maxWidth) {
            lines.push(centerText(currentLine.trim(), maxWidth));
            currentLine = word + " ";
        } else { currentLine += word + " "; }
    });
    if (currentLine.trim().length > 0) lines.push(centerText(currentLine.trim(), maxWidth));
    return lines.join("\n");
}

function leftRightText(left, right, maxWidth) { const space = maxWidth - left.length - right.length; return space <= 0 ? left + " " + right : left + " ".repeat(space) + right; }
function formatAngka(angka) { return new Intl.NumberFormat('id-ID').format(Math.round(angka)); }
function formatVolume(angka) { return new Intl.NumberFormat('id-ID', {maximumFractionDigits: 2}).format(angka); }

function formatBarisHarga(label, angka) {
    let strAngka = formatAngka(angka);
    let space = 32 - label.length - strAngka.length;
    if(space < 0) space = 0;
    return label + " ".repeat(space) + strAngka;
}

function dapatkanWaktu() { 
    const now = new Date(); const pad = (n) => n.toString().padStart(2, '0'); 
    return `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`; 
}

function buatStruk() {
    const noSpbu = document.getElementById("noSpbu").value.trim().toUpperCase();
    const namaSpbu = document.getElementById("namaSpbu").value.trim().toUpperCase();
    const alamatSpbu1 = document.getElementById("alamatSpbu1").value.trim().toUpperCase();
    const alamatSpbu2 = document.getElementById("alamatSpbu2").value.trim().toUpperCase();
    const waktuStruk = document.getElementById("waktuCustom").value.trim(); 
    const shift = document.getElementById("shift").value;
    const noTrans = document.getElementById("noTrans").value;
    const pompa = document.getElementById("pompa").value;
    const operator = document.getElementById("operator").value; 
    const platNo = document.getElementById("platNo").value.trim().toUpperCase(); 
    const jenisBbm = document.getElementById("jenisBbm").value;
    
    const hargaJual = parseFloat(document.getElementById("hargaJual").value) || 0;
    const subsidiLiter = parseFloat(document.getElementById("subsidiLiter").value) || 0;
    const totalBayar = parseFloat(document.getElementById("totalBayar").value) || 0;
    
    let inputCash = document.getElementById("cashBayar").value;
    let cashBayar = inputCash ? parseFloat(inputCash) : totalBayar;
    if (cashBayar < totalBayar) cashBayar = totalBayar; 
    const changeKembalian = cashBayar - totalBayar;

    const volume = totalBayar / hargaJual;
    const hargaNonSubsidi = hargaJual + subsidiLiter;
    const totalSubsidi = subsidiLiter * volume;
    const totalTanpaSubsidi = totalBayar + totalSubsidi;
    
    let pesanSubsidi = document.getElementById("pesanSubsidi").value.trim();
    const keterangan = document.getElementById("keterangan").value.trim();

    const LEBAR = 32; let k = "";
    
    if (noSpbu !== "") k += centerText(noSpbu, LEBAR) + "\n";
    if (namaSpbu !== "") k += centerText(namaSpbu, LEBAR) + "\n";
    if (alamatSpbu1 !== "") k += centerText(alamatSpbu1, LEBAR) + "\n";
    if (alamatSpbu2 !== "") k += centerText(alamatSpbu2, LEBAR) + "\n";
    
    k += leftRightText(`Shift : ${shift}`, `No. Trans : ${noTrans}`, LEBAR) + "\n";
    k += `Waktu : ${waktuStruk}\n`;
    k += "-".repeat(LEBAR) + "\n";
    
    k += "Pulau/Pompa : " + pompa + "\n";
    k += "Operator    : " + operator + "\n";
    k += "Jenis BBM   : " + jenisBbm + "\n";
    k += "Volume      : " + formatVolume(volume) + " Liter\n";
    k += "-".repeat(LEBAR) + "\n";
    
    if (subsidiLiter > 0) {
        k += "Informasi Harga BBM (Rp/Liter)\n";
        k += formatBarisHarga("Harga Non Subsidi : ", hargaNonSubsidi) + "\n";
        k += formatBarisHarga("Subsidi Pemerintah: ", subsidiLiter) + "\n";
        k += formatBarisHarga("Harga Jual        : ", hargaJual) + "\n";
        k += "-".repeat(LEBAR) + "\n";
        
        k += "Total Penjualan (Rp)\n";
        k += formatBarisHarga("Tanpa Subsidi     : ", totalTanpaSubsidi) + "\n";
        k += formatBarisHarga("Subsidi Pemerintah: ", totalSubsidi) + "\n";
        k += formatBarisHarga("Dibayar Konsumen  : ", totalBayar) + "\n";
    } else {
        k += formatBarisHarga("Harga/Liter : Rp ", hargaJual) + "\n";
        k += formatBarisHarga("Total Harga : Rp ", totalBayar) + "\n";
    }
    k += "-".repeat(LEBAR) + "\n";
    
    k += leftRightText("CASH", formatAngka(cashBayar), LEBAR) + "\n";
    if(changeKembalian >= 0) {
        k += leftRightText("CHANGE", formatAngka(changeKembalian), LEBAR) + "\n";
    }
    k += "-".repeat(LEBAR) + "\n";
    
    if (platNo !== "") k += centerText("No. Plat : " + platNo, LEBAR) + "\n\n";
    
    if (subsidiLiter > 0 && pesanSubsidi !== "") {
        let finalPesan = pesanSubsidi.replace("[SUBSIDI]", formatAngka(totalSubsidi));
        k += autoWrapCenter(finalPesan, LEBAR) + "\n";
    }
    if (keterangan !== "") k += "\n" + autoWrapCenter(keterangan, LEBAR) + "\n";
    k += "\n\n\n\n";

    teksStrukGlobal = k;
    document.getElementById("hasilStruk").innerText = k;
}

function simpanRiwayat() {
    const dataBaru = { waktu: document.getElementById("waktuCustom").value.trim(), platNo: document.getElementById("platNo").value || "-", jenisBbm: document.getElementById("jenisBbm").value, total: document.getElementById("totalBayar").value, strukAsli: teksStrukGlobal };
    let riwayatLama = JSON.parse(localStorage.getItem("riwayatStrukBbm")) || [];
    riwayatLama.unshift(dataBaru);
    localStorage.setItem("riwayatStrukBbm", JSON.stringify(riwayatLama.slice(0, 20)));
    tampilkanRiwayat();
}

function tampilkanRiwayat() {
    const isiTabel = document.getElementById("isiRiwayat");
    let riwayat = JSON.parse(localStorage.getItem("riwayatStrukBbm")) || [];
    isiTabel.innerHTML = ""; 
    if (riwayat.length === 0) { isiTabel.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">Belum ada riwayat cetak</td></tr>`; return; }
    riwayat.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${item.waktu}</td><td>${item.platNo.toUpperCase()}</td><td>${item.jenisBbm}</td><td class="text-right">${formatAngka(item.total)}</td><td class="text-center"><button class="btn-reprint" onclick="cetakUlang(${index})">PRINT</button></td>`;
        isiTabel.appendChild(tr);
    });
}

function hapusRiwayat() { if (confirm("Hapus semua riwayat struk?")) { localStorage.removeItem("riwayatStrukBbm"); tampilkanRiwayat(); } }

function generateImageESCData(imgElement) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
        let targetWidth = 256; let targetHeight = Math.floor((imgElement.height / imgElement.width) * targetWidth);
        canvas.width = targetWidth; canvas.height = targetHeight;
        ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const widthBytes = Math.floor(targetWidth / 8);
        const headerData = [0x1B, 0x61, 0x01, 0x1D, 0x76, 0x30, 0x00, widthBytes % 256, Math.floor(widthBytes / 256), targetHeight % 256, Math.floor(targetHeight / 256)];
        const imageBytes = new Uint8Array(widthBytes * targetHeight);
        let byteIndex = 0;
        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < widthBytes; x++) {
                let byte = 0;
                for (let bit = 0; bit < 8; bit++) {
                    const idx = (y * targetWidth + (x * 8 + bit)) * 4;
                    if ((0.299 * pixels[idx] + 0.587 * pixels[idx+1] + 0.114 * pixels[idx+2]) < 150) byte |= (1 << (7 - bit));
                }
                imageBytes[byteIndex++] = byte;
            }
        }
        const footerData = [0x1B, 0x61, 0x00, 0x0A]; 
        const finalBuffer = new Uint8Array(headerData.length + imageBytes.length + footerData.length);
        finalBuffer.set(headerData, 0); finalBuffer.set(imageBytes, headerData.length); finalBuffer.set(footerData, headerData.length + imageBytes.length);
        resolve(finalBuffer);
    });
}

async function kirimDataBertahap(characteristic, uint8ArrayData) {
    const chunkSize = 256; 
    for (let i = 0; i < uint8ArrayData.length; i += chunkSize) {
        await characteristic.writeValue(uint8ArrayData.slice(i, i + chunkSize));
        await new Promise(resolve => setTimeout(resolve, 20)); 
    }
}

function putuskanBluetooth() {
    if (bluetoothDeviceGlobal && bluetoothDeviceGlobal.gatt.connected) {
        bluetoothDeviceGlobal.gatt.disconnect();
    }
    bluetoothCharacteristic = null;
    document.getElementById("statusText").innerText = "Status: Koneksi Di-reset. Standby.";
    document.getElementById("statusText").style.color = "#d32f2f";
    alert("Jalur Bluetooth telah dibersihkan!");
}

async function eksekusiBluetooth(teksCetak) {
    const statusDiv = document.getElementById("statusText");
    if (!navigator.bluetooth) {
        statusDiv.innerText = "Error: Browser memblokir akses Bluetooth!"; 
        statusDiv.style.color = "red";
        alert("GAGAL: Pastikan Anda menggunakan Google Chrome asli!");
        return false;
    }

    try {
        if (!bluetoothCharacteristic) {
            statusDiv.innerText = "Status: Meminta izin Bluetooth..."; statusDiv.style.color = "orange";
            const device = await navigator.bluetooth.requestDevice({ 
                acceptAllDevices: true, 
                optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] 
            });
            bluetoothDeviceGlobal = device;
            statusDiv.innerText = "Status: Menyambungkan...";
            const server = await device.gatt.connect();
            const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
            bluetoothCharacteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
        }
        
        statusDiv.innerText = "Status: Mengirim data...";
        const imgUpload = document.getElementById("logoUpload");
        if (imgUpload.src && imgUpload.style.display !== 'none') {
            const imageEscData = await generateImageESCData(imgUpload);
            await kirimDataBertahap(bluetoothCharacteristic, imageEscData);
        }
        
        const encoder = new TextEncoder();
        await kirimDataBertahap(bluetoothCharacteristic, encoder.encode(teksCetak));
        
        statusDiv.innerText = "Status: Berhasil Dicetak!"; statusDiv.style.color = "green";
        return true;
    } catch (error) { 
        console.error(error); 
        statusDiv.innerText = "Gagal: " + error.message; statusDiv.style.color = "red"; 
        bluetoothCharacteristic = null; 
        return false; 
    }
}

async function printBluetooth() {
    if (!teksStrukGlobal) { alert("Buat preview dulu!"); return; }
    const sukses = await eksekusiBluetooth(teksStrukGlobal);
    if (sukses) {
        simpanRiwayat();
        let transLama = parseInt(document.getElementById("noTrans").value);
        if (!isNaN(transLama)) document.getElementById("noTrans").value = transLama + 1;
        document.getElementById("waktuCustom").value = dapatkanWaktu();
        document.getElementById("cashBayar").value = ""; 
    }
}

async function cetakUlang(index) {
    const riwayat = JSON.parse(localStorage.getItem("riwayatStrukBbm")) || [];
    const strukLama = riwayat[index].strukAsli;
    if (strukLama) await eksekusiBluetooth(strukLama); else alert("Format struk lama tidak lengkap.");
}

// --- SERVICE WORKER UNTUK OFFLINE ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => console.error('SW Error:', err));
    });
}