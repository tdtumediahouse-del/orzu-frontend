const CertificatesModule = {
    init: function() {
        this.setupSearch();
    },
    setupSearch: function() {
        const container = document.querySelector('#tab-certificates .glass-card');
        if(!container) return;

        container.classList.remove('justify-center', 'items-center');
        container.innerHTML = `
            <div class="relative mb-6 shrink-0 w-full max-w-2xl mx-auto">
                <i data-lucide="search" class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"></i>
                <input type="text" id="cert-search-input" placeholder="Ism yoki ID raqamini kiriting... (Enter bosing)" class="bg-black/30 border border-white/10 w-full rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none text-white placeholder-zinc-500 focus:border-white/30 transition-all">
            </div>
            <div id="cert-result-area" class="flex-1 flex flex-col items-center justify-center text-zinc-500 w-full">
                <i data-lucide="file-badge" class="w-16 h-16 mb-4 opacity-30"></i>
                <p class="text-sm font-bold uppercase tracking-widest opacity-50">Qidiruv natijalari shu yerda chiqadi</p>
            </div>
        `;
        if(typeof lucide !== 'undefined') lucide.createIcons();

        const input = document.getElementById('cert-search-input');
        input.addEventListener('keyup', (e) => {
            if(e.key === 'Enter') this.searchCert(input.value);
        });
    },
    searchCert: function(query) {
        query = query.trim().toLowerCase();
        const resultBox = document.getElementById('cert-result-area');
        if(!query) return;

        resultBox.innerHTML = `<i data-lucide="loader" class="w-10 h-10 animate-spin opacity-50 mb-4 text-sky-500"></i>`;
        if(typeof lucide !== 'undefined') lucide.createIcons();

        // Python API'dan qidirish
        fetch(`${window.API_URL}/certificates`)
            .then(response => response.json())
            .then(result => {
                if(result.status !== 'ok' || !result.data) {
                    this.showError(resultBox); 
                    return;
                }

                let found = null;
                let count = 0;
                const certs = result.data;
                
                Object.keys(certs).forEach(key => {
                    count++;
                    let cert = certs[key];
                    if((cert.studentName && cert.studentName.toLowerCase().includes(query)) || (cert.certId && cert.certId.toLowerCase() === query)) {
                        found = cert;
                    }
                });

                // Asosiy ekrandagi "Sertifikatlar" statistikasini yangilash
                const statCert = document.querySelectorAll('#tab-dashboard .text-4xl')[2];
                if(statCert) statCert.innerText = count;

                if(found) {
                    resultBox.innerHTML = `
                        <div class="animate__animated animate__zoomIn text-center flex flex-col items-center w-full max-w-md mx-auto">
                            <div class="w-full rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] mb-6 relative group bg-white/5 p-2">
                                <img src="${found.imageURL}" class="w-full h-auto object-cover rounded-xl" alt="Sertifikat">
                                <div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-sm">
                                    <a href="${found.imageURL}" target="_blank" download class="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-black py-3 px-6 rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all">
                                        <i data-lucide="download" class="w-4 h-4"></i> Yuklab olish
                                    </a>
                                </div>
                            </div>
                            <h3 class="text-xl font-black text-white uppercase tracking-widest">${found.studentName}</h3>
                            <p class="text-xs text-emerald-400 font-bold tracking-widest mt-2 mb-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full inline-block">ID: ${found.certId}</p>
                            <p class="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mt-2">Yo'nalish: <span class="text-white">${found.course}</span></p>
                        </div>
                    `;
                } else {
                    this.showError(resultBox);
                }
                if(typeof lucide !== 'undefined') lucide.createIcons();
            })
            .catch(error => {
                console.error("API xatosi:", error);
                this.showError(resultBox);
            });
    },
    showError: function(box) {
        box.innerHTML = `
            <div class="animate__animated animate__shakeX flex flex-col items-center text-center">
                <i data-lucide="search-x" class="w-16 h-16 mb-4 text-red-500/50"></i>
                <p class="text-sm font-black uppercase tracking-widest text-red-400">Sertifikat topilmadi!</p>
                <p class="text-[10px] text-zinc-500 mt-2 tracking-widest uppercase font-bold max-w-xs">Ismni yoki ID raqamini to'g'ri yozganingizni tekshiring.</p>
            </div>
        `;
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }
};
window.CertificatesModule = CertificatesModule;