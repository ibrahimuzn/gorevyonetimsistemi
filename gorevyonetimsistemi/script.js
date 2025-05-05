// script.js
document.addEventListener('DOMContentLoaded', function () {
    // Değişkenler
    let seciliOncelik = null;
    let gorevler = JSON.parse(localStorage.getItem('gorevler')) || [];

    // Öncelik butonları
    document.querySelectorAll('.priority-btn').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.priority-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.classList.add('selected');
            seciliOncelik = this.dataset.level;
        });
    });

    // Görev ekleme butonu
    document.getElementById('gorev-ekle-btn').addEventListener('click', function () {
        const baslik = document.getElementById('gorev-baslik').value;
        const aciklama = document.getElementById('gorev-aciklama').value;
        const tarih = document.getElementById('gorev-tarih').value;

        if (!baslik || !seciliOncelik) {
            alert('Lütfen başlık ve aciliyet seviyesi seçin!');
            return;
        }

        const yeniGorev = {
            id: Date.now(),
            baslik,
            aciklama,
            tarih,
            oncelik: seciliOncelik,
            tamamlandi: false
        };

        gorevler.push(yeniGorev);
        localStorage.setItem('gorevler', JSON.stringify(gorevler));
        gorevleriListele();
        formuTemizle();
    });

    // Görevleri listeleme fonksiyonu
    function gorevleriListele() {
        const liste = document.getElementById('gorev-listesi');
        liste.innerHTML = '';

        gorevler.forEach(gorev => {
            const gorevElement = document.createElement('div');
            gorevElement.className = `gorev-item ${gorev.oncelik}`;
            if (gorev.tamamlandi) gorevElement.classList.add('gorev-tamamlandi');

            gorevElement.innerHTML = `
                <input type="checkbox" ${gorev.tamamlandi ? 'checked' : ''}>
                <div class="gorev-bilgi">
                    <div class="gorev-baslik">${gorev.baslik}</div>
                    <div>${gorev.aciklama}</div>
                    <div class="gorev-tarih">${gorev.tarih}</div>
                </div>
                <button class="gorev-sil"><i class="fas fa-trash"></i></button>
            `;

            // Checkbox
            const checkbox = gorevElement.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', function () {
                gorev.tamamlandi = this.checked;
                localStorage.setItem('gorevler', JSON.stringify(gorevler));
                gorevElement.classList.toggle('gorev-tamamlandi');
            });

            // Sil butonu
            const silButon = gorevElement.querySelector('.gorev-sil');
            silButon.addEventListener('click', function () {
                if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
                    gorevler = gorevler.filter(g => g.id !== gorev.id);
                    localStorage.setItem('gorevler', JSON.stringify(gorevler));
                    gorevleriListele();
                }
            });

            liste.appendChild(gorevElement);
        });
        const gorevListesi = document.getElementById('gorev-listesi');
        gorevListesi.scrollTop = gorevListesi.scrollHeight;
    }

    // Formu temizleme fonksiyonu
    function formuTemizle() {
        document.getElementById('gorev-baslik').value = '';
        document.getElementById('gorev-aciklama').value = '';
        document.getElementById('gorev-tarih').value = '';
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        seciliOncelik = null;
    }

    // Sayfa yüklendiğinde görevleri listele
    gorevleriListele();
});

// Hatırlatıcılar için dizi
let hatirlaticilar = JSON.parse(localStorage.getItem('hatirlaticilar')) || [];

// Ekle butonu eventi
document.getElementById('hatirlatici-ekle-btn').addEventListener('click', () => {
    const baslik = document.getElementById('hatirlatici-baslik').value; // EKLENDİ
    const zamanInput = document.getElementById('hatirlatma-zamani').value;

    if (!baslik || !zamanInput) { // DEĞİŞTİ
        alert("Lütfen görev başlığı ve tarih seçin!");
        return;
    }

    const yeniHatirlatici = {
        id: Date.now(),
        baslik: baslik, // EKLENDİ
        zaman: zamanInput
    };

    hatirlaticilar.push(yeniHatirlatici);
    localStorage.setItem('hatirlaticilar', JSON.stringify(hatirlaticilar));
    hatirlaticilariListele();
    zamanInput.value = ''; // Inputu temizle
});

// Hatırlatıcıları listeleme fonksiyonu
function hatirlaticilariListele() {
    const liste = document.getElementById('hatirlatici-listesi');
    liste.innerHTML = '';

    hatirlaticilar.forEach(hatirlatici => {
        const item = document.createElement('div');
        item.className = 'hatirlatici-item';

        // Tarih formatını düzenle
        const tarih = new Date(hatirlatici.zaman);
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const formatliTarih = tarih.toLocaleDateString('tr-TR', options);

        item.innerHTML = `
  <div style="flex-grow:1;">
    <div style="font-weight:bold;">${hatirlatici.baslik}</div> <!-- Görev başlığı eklendi -->
    <div>${formatliTarih}</div>
  </div>
  <button class="hatirlatici-sil" data-id="${hatirlatici.id}">
    <i class="fas fa-trash"></i> Sil
  </button>
`;

        liste.appendChild(item);
    });

    // Sil butonlarına event ekleme
    document.querySelectorAll('.hatirlatici-sil').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            hatirlaticilar = hatirlaticilar.filter(h => h.id !== id);
            localStorage.setItem('hatirlaticilar', JSON.stringify(hatirlaticilar));
            hatirlaticilariListele();
        });
    });
}

// Sayfa yüklendiğinde listeyi yükle
document.addEventListener('DOMContentLoaded', hatirlaticilariListele);

// Hatırlatıcıları kontrol et (her dakika)
setInterval(() => {
    const simdi = new Date();
    hatirlaticilar.forEach(hatirlatici => {
        const hatirlatmaZamani = new Date(hatirlatici.zaman);

        if (hatirlatmaZamani <= new Date(simdi.getTime() + 60000)) {
            alert(`GÖREV ZAMANI!\n\n⌛ Tarih: ${hatirlatmaZamani.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })}\n⏰ Saat: ${hatirlatmaZamani.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
            })}\n\n"${hatirlatici.baslik}" görevi için zaman geldi!`); // DÜZELTİLDİ

            hatirlaticilar = hatirlaticilar.filter(h => h.id !== hatirlatici.id);
            localStorage.setItem('hatirlaticilar', JSON.stringify(hatirlaticilar));
            hatirlaticilariListele();
        }
    });
}, 60000);