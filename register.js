// C# Backend Adresi
const API_URL = "https://localhost:7158";

document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('sifre').value;
    const passwordConfirm = document.getElementById('sifre-tekrar').value;

    // --- ÖN KONTROLLER (Resmi Dil) ---
    if (password !== passwordConfirm) {
        alert("Hata: Girdiğiniz şifreler birbiriyle uyuşmuyor.");
        return;
    }

    if (password.length < 6) {
        alert("Uyarı: Şifreniz en az 6 karakterden oluşmalıdır.");
        return;
    }

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

        if (response.ok) {
            // --- BAŞARILI MESAJI (Resmi) ---
            alert("Kayıt işlemi başarıyla tamamlandı. Giriş sayfasına yönlendiriliyorsunuz.");
            window.location.href = "login.html";
        } else {
            // --- HATA MESAJLARI VE ÇEVİRİ ---
            const errorData = await response.json().catch(() => null);

            if (errorData && errorData.errors) {
                let mesaj = "Kayıt İşlemi Başarısız:\n";

                // Gelen hataları döngüyle alıp Türkçeye çeviriyoruz
                for (const key in errorData.errors) {
                    const gelenHata = errorData.errors[key][0]; // Backend'den gelen İngilizce hata
                    let turkceHata = gelenHata; // Varsayılan olarak aynısını tut

                    // Backend'den gelen standart İngilizce mesajları yakalayıp çevirelim
                    if (gelenHata.includes("is already taken")) {
                        turkceHata = "Bu e-posta adresi zaten sisteme kayıtlı.";
                    }
                    else if (gelenHata.includes("Passwords must be at least")) {
                        turkceHata = "Şifreniz en az 6 karakter uzunluğunda olmalıdır.";
                    }
                    else if (gelenHata.includes("non alphanumeric")) {
                        turkceHata = "Şifreniz en az bir sembol (!, *, ? vb.) içermelidir.";
                    }
                    else if (gelenHata.includes("digit")) {
                        turkceHata = "Şifreniz en az bir rakam (0-9) içermelidir.";
                    }
                    else if (gelenHata.includes("uppercase")) {
                        turkceHata = "Şifreniz en az bir büyük harf (A-Z) içermelidir.";
                    }
                    else if (gelenHata.includes("lowercase")) {
                        turkceHata = "Şifreniz en az bir küçük harf (a-z) içermelidir.";
                    }

                    mesaj += `- ${turkceHata}\n`;
                }
                alert(mesaj);
            } else {
                alert("Beklenmedik bir hata oluştu. Lütfen bilgilerinizi kontrol ediniz.");
            }
        }

    } catch (error) {
        console.error("Bağlantı Hatası:", error);
        alert("Sunucuya erişilemiyor. Lütfen internet bağlantınızı kontrol ediniz.");
    }
});