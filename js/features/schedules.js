const SchedulesModule = {
    dataMap: {}, // Ma'lumotlarni vaqtinchalik saqlab turish uchun

    init: function() {
        this.loadSchedules();
        window.openScheduleModal = this.openScheduleModal.bind(this);
    },

    loadSchedules: function() {
        const container = document.querySelector('#tab-schedules .glass-card');
        if(!container) return;

        container.innerHTML = `<div class="flex flex-col items-center justify-center h-full w-full"><i data-lucide="loader" class="w-10 h-10 animate-spin mb-2 text-zinc-500"></i> Jadvallar API'dan yuklanmoqda...</div>`;
        if(typeof lucide !== 'undefined') lucide.createIcons();

        // API ga ulanish
        fetch(`${window.API_URL}/schedules`)
            .then(response => response.json())
            .then(result => {
                this.dataMap = {}; // Xotirani tozalash
                
                // Agar baza bo'sh bo'lsa yoki xato kelsa
                if(result.status !== 'ok' || !result.data) {
                    container.innerHTML = `
                        <div class="flex flex-col items-center justify-center h-full w-full text-zinc-500">
                            <i data-lucide="calendar-x" class="w-16 h-16 mb-4 opacity-30"></i>
                            <p class="text-sm font-bold uppercase tracking-widest opacity-50">Hozircha jadvallar kiritilmagan.</p>
                        </div>
                    `;
                    if(typeof lucide !== 'undefined') lucide.createIcons();
                    return;
                }

                container.classList.remove('justify-center', 'items-center', 'h-[65vh]');
                let html = `<div class="w-full h-full overflow-y-auto minimal-scroll pr-2 space-y-3 pb-10">`;
                
                // Python'dan kelgan jadvallarni aylanib chiqamiz
                const schedules = result.data;
                Object.keys(schedules).forEach(key => {
                    let sched = schedules[key];
                    this.dataMap[key] = sched;

                    // Rasm xato bo'lsa yoki umuman yo'q bo'lsa, avtomatik Lucide "user" ikonkasini chiqarish
                    let avatarHtml = '';
                    if (sched.photo && sched.photo !== './rasmlar/logo.png' && sched.photo.trim() !== '') {
                        avatarHtml = `<img src="${sched.photo}" onerror="this.outerHTML='<div class=\\'w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0\\'><i data-lucide=\\'user\\' class=\\'w-5 h-5 text-emerald-400\\'></i></div>'" class="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0">`;
                    } else {
                        avatarHtml = `<div class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0"><i data-lucide="user" class="w-5 h-5 text-emerald-400"></i></div>`;
                    }

                    html += `
                        <div onclick="openScheduleModal('${key}')" class="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-all cursor-pointer group hover:scale-[1.01]">
                            <div class="flex items-center gap-4">
                                ${avatarHtml}
                                <div>
                                    <h3 class="text-white font-black uppercase tracking-widest text-sm">${sched.groupName || "Guruh"}</h3>
                                    <p class="text-[10px] text-zinc-400 font-bold tracking-widest mt-1 uppercase group-hover:text-sky-400 transition-colors"><i data-lucide="user" class="w-3 h-3 inline"></i> ${sched.teacher || "O'qituvchi"} | ${sched.room}-xona</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="bg-white/10 text-white text-[9px] px-3 py-1 rounded-lg font-black tracking-widest uppercase">${sched.days || "Kunlar"}</span>
                                <p class="text-sm font-black text-sky-400 mt-2">${sched.time || "00:00"}</p>
                            </div>
                        </div>
                    `;
                });
                html += `</div>`;
                container.innerHTML = html;
                if(typeof lucide !== 'undefined') lucide.createIcons();
            })
            .catch(error => {
                console.error("API xatosi:", error);
                container.innerHTML = `<p class="text-red-500 font-bold text-center mt-10">Server bilan ulanishda xatolik!</p>`;
            });
    },

    openScheduleModal: function(id) {
        const sched = this.dataMap[id];
        if(!sched) return;

        // Modal ichidagi katta avatar uchun
        let modalAvatar = '';
        if (sched.photo && sched.photo !== './rasmlar/logo.png' && sched.photo.trim() !== '') {
            modalAvatar = `<img src="${sched.photo}" onerror="this.outerHTML='<div class=\\'w-20 h-20 rounded-xl bg-white/5 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center z-10 shrink-0\\'><i data-lucide=\\'user\\' class=\\'w-10 h-10 text-emerald-400\\'></i></div>'" class="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] z-10 shrink-0">`;
        } else {
            modalAvatar = `<div class="w-20 h-20 rounded-xl bg-white/5 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center z-10 shrink-0"><i data-lucide="user" class="w-10 h-10 text-emerald-400"></i></div>`;
        }

        let modalHtml = `
            <div class="flex flex-col gap-4 text-left">
                
                <div class="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                    ${modalAvatar}
                    <div class="flex-1 z-10">
                        <h3 class="text-lg font-black text-white uppercase tracking-widest leading-tight">${sched.teacher || "O'qituvchi"}</h3>
                        <p class="text-[10px] text-emerald-400 font-bold mt-1 uppercase tracking-widest bg-emerald-500/10 inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-500/20"><i data-lucide="phone" class="w-3 h-3"></i> ${sched.phone || "Kiritilmagan"}</p>
                        <p class="text-[10px] text-zinc-300 font-bold mt-2 tracking-widest leading-relaxed">${sched.level || "Ma'lumot kiritilmagan"}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                        <span class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Guruh & Kunlar</span>
                        <h4 class="text-sm font-black text-white mt-1">${sched.groupName}</h4>
                        <p class="text-xs font-black text-sky-400 mt-1">${sched.days}</p>
                    </div>
                    <div class="bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                        <span class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Vaqt & Xona</span>
                        <h4 class="text-sm font-black text-white mt-1">${sched.time}</h4>
                        <p class="text-xs font-black text-rose-400 mt-1">${sched.room}-xona</p>
                    </div>
                </div>

                <div class="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden border border-white/10 bg-[#f3f3f3] mt-1 shadow-inner">
                    <iframe src="./rooms.html?room=${sched.room}" class="w-full h-full border-none outline-none" style="pointer-events: auto;"></iframe>
                </div>

                <button onclick="Swal.close()" class="w-full py-3.5 mt-2 rounded-full bg-white/5 hover:bg-white/10 text-white font-black tracking-widest uppercase text-xs transition-all flex justify-center items-center gap-2 border border-white/10">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i> Orqaga
                </button>

            </div>
        `;

        Swal.fire({
            html: modalHtml,
            showConfirmButton: false,
            showCloseButton: false, 
            background: '#0f172a',
            color: '#fff',
            width: '750px', // Iframe yaxshi ko'rinishi uchun modalni biroz kengaytirdik
            padding: '1.5rem',
            customClass: {
                popup: 'border border-white/10 rounded-[2rem] backdrop-blur-xl',
            },
            didOpen: () => {
                if(typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }
};
window.SchedulesModule = SchedulesModule;