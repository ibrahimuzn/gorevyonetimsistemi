// C# Backend Adresi (Kendi portuna göre düzelt)
const API_URL = "https://localhost:7094";

document.getElementById('register-form').addEventListener('submit', async function (e) {
    // 1. Sayfanın yenilenmesini engelle
    e.preventDefault();

    // 2. Kutulardaki verileri al
    // const ad = document.getElementById('kullanici-adi').value; // Identity standart olarak email kullanır
    const email = document.getElementById('email').value;
    const password = document.getElementById('sifre').value;
    const passwordConfirm = document.getElementById('sifre-tekrar').value;

    // 3. Basit Kontroller
    if (password !== passwordConfirm) {
        alert("Aga şifreler uyuşmuyor, bi kontrol et!");
        return;
    }

    if (password.length < 6) {
        alert("Şifre en az 6 karakter olmalı kral.");
        return;
    }

    // 4. Backend'e İstek Gönder (/register endpoint'i)
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        // 5. Sonucu Kontrol Et
        if (response.ok) {
            alert("Kayıt başarılı aga! Giriş sayfasına yönlendiriliyorsun...");
            window.location.href = "login.html"; // Başarılıysa girişe at
        } else {
            // Hata varsa detayını göstermeye çalışalım
            const errorData = await response.json().catch(() => null);
            console.error("Hata detayı:", errorData);

            if (errorData && errorData.errors) {
                // Backend'den gelen hata mesajlarını birleştir
                let mesaj = "Kayıt olunamadı:\n";
                for (const key in errorData.errors) {
                    mesaj += `- ${errorData.errors[key]}\n`;
                }
                alert(mesaj);
            } else {
                alert("Kayıt başarısız oldu. Bu mail adresi zaten kullanılıyor olabilir.");
            }
        }

    } catch (error) {
        console.error("Bağlantı Hatası:", error);
        alert("Sunucuya ulaşılamadı! C# projesi çalışıyor mu?");
    }
});