const app = {
    init: function() {
        console.log("🚀 Orzu Education Yadro Tizimi ishga tushdi!");
        
        // Qidiruv tizimini simulyatsiya qilish
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    Swal.fire({
                        title: "Qidiruv",
                        text: "Bu qidiruv darchasi keyingi bosqichda to'liq bazaga ulanadi.",
                        icon: "info",
                        background: '#0f172a',
                        color: '#fff',
                        customClass: { popup: 'border border-white/10 rounded-3xl' }
                    });
                }
            });
        }
    },
    // 📱 IJTIMOIY TARMOQLARNI OCHISH FUNKSIYASI (YANGI)
    openSocial: function(network) {
        const links = {
            'telegram': 'https://t.me/orzu_education', // O'zgaradi
            'instagram': 'https://instagram.com/orzu_education', // O'zgaradi
            'youtube': 'https://youtube.com/@orzu_education' // O'zgaradi
        };
        
        if(links[network]) {
            window.open(links[network], '_blank');
        }
    },
    // 📍 MANZILNI OCHISH FUNKSIYASI (YANGI)
    openMap: function() {
        // Bu yerga o'quv markazining haqiqiy Google Maps ssilkasini qo'yasiz
        window.open('https://maps.google.com/?q=Tashkent', '_blank');
    },
    openTab: function(tabId, btnEl) {
        // Agar "O'yinlar" tugmasi bosilsa
        if (tabId === 'tab-games') {
            return Swal.fire({
                title: "Tez Kunda",
                text: "O'yinlar va Zakovat moduli ustida ishlanmoqda!",
                icon: "info",
                background: '#0f172a',
                color: '#fff',
                customClass: { popup: 'border border-sky-500/30 rounded-3xl' }
            });
        }

        // Qolgan tablarni ochish mantig'i
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.menu-item').forEach(el => {
            el.classList.remove('active', 'bg-white/10');
            el.classList.add('hover:bg-white/5');
        });
        
        const targetTab = document.getElementById(tabId);
        if (targetTab) targetTab.classList.remove('hidden');
        
        if (btnEl) {
            btnEl.classList.add('active', 'bg-white/10');
            btnEl.classList.remove('hover:bg-white/5');
        }
    },

    logout: function() {
        Swal.fire({
            title: "Tizimdan chiqish",
            text: "Haqiqatan ham chiqmoqchimisiz?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ha, chiqish",
            cancelButtonText: "Bekor qilish",
            background: '#0f172a',
            color: '#fff',
            customClass: { 
                popup: 'border border-red-500/30 rounded-3xl',
                confirmButton: 'bg-red-500 text-white rounded-xl px-4 py-2',
                cancelButton: 'bg-slate-700 text-white rounded-xl px-4 py-2'
            }
        }).then((res) => {
            if(res.isConfirmed) {
                // Hozircha shunchaki saytni yangilaydi (Login tizimi ulanganda bu yer o'zgaradi)
                window.location.reload(); 
            }
        });
    }
};

// Sayt yuklanganda barcha modullarni avtomatik ishga tushiramiz
window.addEventListener('DOMContentLoaded', () => {
    app.init();
    if(window.SchedulesModule) SchedulesModule.init();
    if(window.VideosModule) VideosModule.init();
    if(window.CertificatesModule) CertificatesModule.init();
});