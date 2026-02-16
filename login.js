// C# Backend Adresi (Bunu register.js ve script.js ile aynı yap)
const API_URL = "https://localhost:7094";

document.getElementById('login-form').addEventListener('submit', async function (e) {
    // 1. Sayfanın yenilenmesini engelle
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('sifre').value;

    // 2. Backend'e İstek Gönder (/login endpoint'i)
    try {
        // Backend'e "Ben geldim, bu da şifrem" diyoruz
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        // 3. Cevabı Kontrol Et
        if (response.ok) {
            // Giriş başarılıysa Backend bize bir TOKEN verir
            const data = await response.json();

            // Bu Token'ı tarayıcının hafızasına (localStorage) kaydediyoruz
            // "accessToken" ismi standarttır, değiştirme aga.
            localStorage.setItem('accessToken', data.accessToken);

            // Kullanıcıyı ana sayfaya gönder
            window.location.href = "index.html";
        } else {
            // Şifre yanlışsa falan burası çalışır
            alert("Giriş başarısız! E-posta veya şifre hatalı.");
        }

    } catch (error) {
        console.error("Bağlantı Hatası:", error);
        alert("Sunucuya ulaşılamadı! Backend çalışıyor mu?");
    }
});