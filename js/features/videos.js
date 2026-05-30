const VideosModule = {
    init: function() {
        this.loadVideos();
    },
    loadVideos: function() {
        const container = document.querySelector('#tab-videolessons .glass-card');
        if(!container) return;

        container.innerHTML = `<div class="flex flex-col items-center justify-center h-full w-full"><i data-lucide="loader" class="w-10 h-10 animate-spin mb-2 text-zinc-500"></i> Videolar API'dan yuklanmoqda...</div>`;
        if(typeof lucide !== 'undefined') lucide.createIcons();

        // Python API ga ulanish
        fetch(`${window.API_URL}/videos`)
            .then(response => response.json())
            .then(result => {
                if(result.status !== 'ok' || !result.data) {
                    container.innerHTML = `
                        <div class="flex flex-col items-center justify-center h-full w-full text-zinc-500">
                            <i data-lucide="video-off" class="w-16 h-16 mb-4 opacity-30"></i>
                            <p class="text-sm font-bold uppercase tracking-widest opacity-50">Hozircha video darslar kiritilmagan.</p>
                        </div>
                    `;
                    if(typeof lucide !== 'undefined') lucide.createIcons();
                    return;
                }

                container.classList.remove('flex', 'flex-col', 'justify-center', 'items-center', 'p-8', 'glass-card');
                
                let html = `<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">`;
                let count = 0;

                const videos = result.data;
                Object.keys(videos).forEach(key => {
                    let video = videos[key];
                    let embedLink = video.originalLink ? video.originalLink.replace("watch?v=", "embed/") : `https://www.youtube.com/embed/${video.videoId}`;
                    
                    html += `
                        <div class="glass-card p-4 rounded-3xl flex flex-col gap-3 group">
                            <div class="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/50 shadow-inner">
                                <iframe src="${embedLink}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
                            </div>
                            <div class="px-2 pb-1">
                                <span class="text-[9px] text-sky-400 font-bold uppercase tracking-widest">${video.fan || 'Umumiy'}</span>
                                <h3 class="text-white font-black text-sm mt-1 leading-tight line-clamp-2">${video.mavzu || 'Mavzusiz video'}</h3>
                                <p class="text-[10px] text-zinc-500 font-bold mt-2 uppercase tracking-widest"><i data-lucide="user" class="w-3 h-3 inline"></i> ${video.muallif || 'Orzu Education'}</p>
                            </div>
                        </div>
                    `;
                    count++;
                });
                html += `</div>`;
                
                // Asosiy ekrandagi statistikaning raqamini yangilash
                const statVideo = document.querySelectorAll('#tab-dashboard .text-4xl')[0];
                if(statVideo) statVideo.innerText = count;

                container.innerHTML = html;
                if(typeof lucide !== 'undefined') lucide.createIcons();
            })
            .catch(error => {
                console.error("API xatosi:", error);
                container.innerHTML = `<p class="text-red-500 font-bold text-center mt-10">Server bilan ulanishda xatolik!</p>`;
            });
    }
};
window.VideosModule = VideosModule;