const API_URL = "https://localhost:7094";

const token = localStorage.getItem('accessToken');

if (!token) {
    window.location.href = "login.html";
}

function cikisYap() {
    if (confirm("Çıkış yapmak istediğine emin misin aga?")) {
        localStorage.removeItem('accessToken');
        window.location.href = "login.html";
    }
}

async function authFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: headers
        });

        if (response.status === 401) {
            alert("Oturum süreniz dolmuş veya giriş yapmamışsınız.");
            return null;
        }

        return response;
    } catch (error) {
        console.error("API Hatası:", error);
        alert("Sunucuyla bağlantı kurulamadı! C# projesi çalışıyor mu?");
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    let seciliOncelik = null;
    let gorevler = [];

    document.querySelectorAll('.priority-btn').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            seciliOncelik = this.dataset.level;
        });
    });

    const ekleBtn = document.getElementById('gorev-ekle-btn');
    if (ekleBtn) {
        ekleBtn.addEventListener('click', async function () {
            const baslik = document.getElementById('gorev-baslik').value;
            const aciklama = document.getElementById('gorev-aciklama').value;
            const tarih = document.getElementById('gorev-tarih').value;

            if (!baslik || !seciliOncelik) {
                alert('Lütfen bir başlık ve aciliyet seviyesi seçin!');
                return;
            }

            const yeniGorev = {
                baslik: baslik,
                aciklama: aciklama,
                tarih: tarih,
                oncelik: seciliOncelik,
                tamamlandi: false
            };

            const response = await authFetch('/api/gorevler', {
                method: 'POST',
                body: JSON.stringify(yeniGorev)
            });

            if (response && response.ok) {
                await listeyiYenile();
                formuTemizle();
            }
        });
    }

    async function listeyiYenile() {
        const response = await authFetch('/api/gorevler');
        if (!response) return;

        gorevler = await response.json();
        const liste = document.getElementById('gorev-listesi');
        liste.innerHTML = '';

        gorevler.forEach(gorev => {
            const div = document.createElement('div');
            div.className = `gorev-item ${gorev.oncelik}`;
            if (gorev.tamamlandi) div.classList.add('gorev-tamamlandi');

            div.innerHTML = `
                <input type="checkbox" ${gorev.tamamlandi ? 'checked' : ''}>
                <div class="gorev-bilgi">
                    <div class="gorev-baslik">${gorev.baslik}</div>
                    <div>${gorev.aciklama}</div>
                    <div class="gorev-tarih">${gorev.tarih}</div>
                </div>
                <button class="gorev-sil" data-id="${gorev.id}"><i class="fas fa-trash"></i></button>
            `;

            const checkbox = div.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', async function () {
                gorev.tamamlandi = this.checked;

                await authFetch(`/api/gorevler/${gorev.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(gorev)
                });

                div.classList.toggle('gorev-tamamlandi');
                yuzdeHesapla();
            });

            const silBtn = div.querySelector('.gorev-sil');
            silBtn.addEventListener('click', async function () {
                if (confirm('Bu görevi silmek istediğine emin misin?')) {
                    await authFetch(`/api/gorevler/${this.dataset.id}`, { method: 'DELETE' });
                    listeyiYenile();
                }
            });

            liste.appendChild(div);
        });
        yuzdeHesapla();
    }

    function formuTemizle() {
        document.getElementById('gorev-baslik').value = '';
        document.getElementById('gorev-aciklama').value = '';
        document.getElementById('gorev-tarih').value = '';
        document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('selected'));
        seciliOncelik = null;
    }

    function yuzdeHesapla() {
        const toplam = gorevler.length;
        const biten = gorevler.filter(g => g.tamamlandi).length;
        const yuzde = toplam > 0 ? (biten / toplam * 100).toFixed(1) : 0;

        const yuzdeText = document.getElementById('tamamlanma-yuzdesi');
        const progressBar = document.getElementById('progress-fill');

        if (yuzdeText) yuzdeText.innerText = `%${yuzde} Tamamlandı`;
        if (progressBar) progressBar.style.width = `${yuzde}%`;
    }

    if (token) {
        listeyiYenile();
    }
});

let hatirlaticilar = [];

const hatirlaticiEkleBtn = document.getElementById('hatirlatici-ekle-btn');
if (hatirlaticiEkleBtn) {
    hatirlaticiEkleBtn.addEventListener('click', async () => {
        const baslik = document.getElementById('hatirlatici-baslik').value;
        const zaman = document.getElementById('hatirlatma-zamani').value;

        if (!baslik || !zaman) {
            alert("Lütfen başlık ve zaman seçin!");
            return;
        }

        const response = await authFetch('/api/hatirlaticilar', {
            method: 'POST',
            body: JSON.stringify({ baslik: baslik, zaman: zaman })
        });

        if (response && response.ok) {
            hatirlaticiListele();
            document.getElementById('hatirlatma-zamani').value = '';
            document.getElementById('hatirlatici-baslik').value = '';
        }
    });
}

async function hatirlaticiListele() {
    const response = await authFetch('/api/hatirlaticilar');
    if (!response) return;

    hatirlaticilar = await response.json();
    const liste = document.getElementById('hatirlatici-listesi');
    liste.innerHTML = '';

    hatirlaticilar.forEach(h => {
        const div = document.createElement('div');
        div.className = 'hatirlatici-item';

        const tarihGosterim = new Date(h.zaman).toLocaleString('tr-TR', {
            month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        div.innerHTML = `
            <div style="flex-grow:1;">
                <b>${h.baslik}</b><br>
                <span style="font-size:0.9em; color:#555;">${tarihGosterim}</span>
            </div>
            <button onclick="hatirlaticiSil(${h.id})" class="hatirlatici-sil">Sil</button>
        `;
        liste.appendChild(div);
    });
}

window.hatirlaticiSil = async (id) => {
    if (confirm("Hatırlatıcıyı silmek istiyor musun?")) {
        await authFetch(`/api/hatirlaticilar/${id}`, { method: 'DELETE' });
        hatirlaticiListele();
    }
}

if (token) {
    setInterval(() => {
        const simdi = new Date();
        hatirlaticilar.forEach(async h => {
            const hedefZaman = new Date(h.zaman);

            if (hedefZaman <= simdi) {
                alert(`⏰ HATIRLATMA: "${h.baslik}" görevinin zamanı geldi!`);
                await authFetch(`/api/hatirlaticilar/${h.id}`, { method: 'DELETE' });
                hatirlaticiListele();
            }
        });
    }, 30000);

    document.addEventListener('DOMContentLoaded', hatirlaticiListele);
}