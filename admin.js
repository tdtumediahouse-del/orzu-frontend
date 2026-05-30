const API_URL = window.API_URL || "https://orzu-backend.vercel.app/api";

const swalConfig = {
    background: 'rgba(15, 23, 42, 0.95)',
    backdrop: 'rgba(0,0,0,0.8)',
    color: '#f8fafc',
    confirmButtonColor: '#0ea5e9',
    cancelButtonColor: '#ef4444',
    customClass: {
        popup: 'border border-white/10 rounded-3xl backdrop-blur-xl',
        confirmButton: 'text-white font-bold rounded-xl px-6 py-3',
        cancelButton: 'text-white font-bold rounded-xl px-6 py-3'
    }
};

let allUsersData = {}; // Global O'quvchilar Bazasi

document.addEventListener("DOMContentLoaded", () => {
    if(typeof lucide !== 'undefined') lucide.createIcons();
    if(sessionStorage.getItem('ORZU_Admin_Token')) {
        showDashboard();
    }
    
    // O'quvchilarni jonli qidirish uchun
    const searchInput = document.getElementById('search-user-input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderUsersTable(allUsersData, e.target.value.trim().toLowerCase());
        });
    }
});

// ==================== 🔐 AVTORIZATSIYA ====================
function checkAdminLogin() {
    const pass = document.getElementById('admin-pass-input').value;
    if(!pass) return Swal.fire({...swalConfig, icon: 'warning', title: 'Diqqat', text: "Parolni kiriting!"});

    Swal.fire({...swalConfig, title: "Tekshirilmoqda...", didOpen: () => Swal.showLoading()});
    
    fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
    }).then(res => res.json()).then(data => {
        if(data.status === 'ok') {
            sessionStorage.setItem('ORZU_Admin_Token', data.token);
            Swal.close();
            showDashboard();
        } else {
            Swal.fire({ ...swalConfig, icon: 'error', title: 'Xato', text: data.detail || "Parol noto'g'ri!" });
        }
    }).catch(err => {
        Swal.fire({ ...swalConfig, icon: 'error', title: 'Xatolik', text: "Server bilan ulanish yo'q!" });
    });
}

function logoutAdmin() {
    sessionStorage.removeItem('ORZU_Admin_Token');
    window.location.reload();
}

function showDashboard() {
    document.getElementById('admin-login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard-screen').classList.remove('hidden');
    loadLists();
}

function openAdminTab(tabId, btnEl) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('active', 'bg-white/10', 'text-white');
        el.classList.add('text-zinc-400');
    });
    document.getElementById(tabId).classList.remove('hidden');
    btnEl.classList.add('active', 'bg-white/10', 'text-white');
    btnEl.classList.remove('text-zinc-400');
}

function loadLists() {
    loadSchedules();
    loadVideos();
    loadCerts();
    loadUsers(); // YANGI: O'quvchilarni yuklash chaqirildi!
}

function apiRequest(endpoint, method, data = null) {
    const options = {
        method: method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': sessionStorage.getItem('ORZU_Admin_Token')
        }
    };
    if(data) options.body = JSON.stringify(data);
    return fetch(`${API_URL}${endpoint}`, options).then(res => res.json());
}

// ==================== 👥 O'QUVCHILAR VA STATISTIKA (YANGI) ====================
function loadUsers() {
    apiRequest('/users', 'GET').then(res => {
        if(res.status === 'ok' && res.data) {
            allUsersData = res.data;
            calculateStats(res.data);
            renderUsersTable(res.data);
        } else {
            document.getElementById('users-table-body').innerHTML = '<tr><td colspan="6" class="py-8 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">Ma\'lumot topilmadi.</td></tr>';
        }
    });
}

function calculateStats(data) {
    let total = 0, students = 0, referrals = 0;
    Object.values(data).forEach(u => {
        // Faqat ismini kiritib tugatganlarni sanaymiz
        if(u.step === 'registered') {
            total++;
            if(u.is_student) students++;
            if(u.referrals_count) referrals += u.referrals_count;
        }
    });
    document.getElementById('stat-total-users').innerText = total;
    document.getElementById('stat-students').innerText = students;
    document.getElementById('stat-referrals').innerText = referrals;
}

function renderUsersTable(data, filterText = '') {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    let count = 0;
    
    Object.keys(data).forEach(key => {
        const u = data[key];
        if(u.step !== 'registered') return; // Ro'yxatdan to'liq o'tmaganlarni jadvalga qo'shmaymiz
        
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        const phone = u.phone || 'Kiritilmagan';
        
        // Qidiruv tizimi
        if(filterText && !fullName.toLowerCase().includes(filterText) && !phone.includes(filterText)) return;
        
        count++;
        const statusText = u.is_student ? `<span class="text-emerald-400 font-bold">O'quvchi (${u.group})</span>` : `<span class="text-sky-400 font-bold">Mehmon</span>`;
        const pinText = u.pin ? `<span class="text-indigo-400 font-bold tracking-widest">${u.pin}</span>` : `<span class="text-zinc-500 text-[10px] uppercase">Yo'q</span>`;
        const score = u.score || 0;
        
        const tr = document.createElement('tr');
        tr.className = "hover:bg-white/5 transition-colors border-b border-white/5 last:border-0";
        tr.innerHTML = `
            <td class="py-4 px-4 font-bold text-white">${fullName}</td>
            <td class="py-4 px-4 text-zinc-300 font-mono text-xs">${phone}</td>
            <td class="py-4 px-4 text-xs">${statusText}</td>
            <td class="py-4 px-4 text-center font-black text-emerald-400">${score}</td>
            <td class="py-4 px-4 text-center">${pinText}</td>
            <td class="py-4 px-4 text-right">
                <button onclick="openUserEditModal('${key}', '${fullName.replace(/'/g, "\\'")}', ${score})" class="btn-3d px-3 py-1.5 text-[10px] font-black tracking-widest text-sky-400 uppercase flex inline-flex items-center gap-1">
                    TAHRIR <i data-lucide="edit-3" class="w-3 h-3"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if(count === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">Foydalanuvchi topilmadi.</td></tr>';
    }
    if(window.lucide) window.lucide.createIcons();
}

function openUserEditModal(id, name, score) {
    document.getElementById('edit-user-id').value = id;
    document.getElementById('edit-user-name').innerText = name;
    document.getElementById('edit-user-score').value = score;
    document.getElementById('edit-user-pin').value = ''; // Eski parolni ko'rsatmaydi, yangisini kutadi
    document.getElementById('user-edit-modal').classList.remove('hidden');
}

function saveUserChanges() {
    const id = document.getElementById('edit-user-id').value;
    const score = parseInt(document.getElementById('edit-user-score').value) || 0;
    const pin = document.getElementById('edit-user-pin').value.trim();
    
    if(pin && pin.length !== 4) return Swal.fire({...swalConfig, icon: 'warning', title: 'Xato', text: 'PIN 4 ta raqam bo\'lishi shart!'});
    
    Swal.fire({...swalConfig, title: "Saqlanmoqda...", didOpen: () => Swal.showLoading()});
    
    let data = { score: score };
    if(pin) data.pin = pin; // Parol kiritilgan bo'lsagina uni backendga jo'natamiz
    
    apiRequest(`/users/${id}`, 'PUT', data).then(res => {
        if(res.status === 'ok') {
            document.getElementById('user-edit-modal').classList.add('hidden');
            Swal.fire({...swalConfig, icon: 'success', title: 'Saqlandi!', timer: 1500, showConfirmButton: false});
            loadUsers(); // Jonli jadvalni yangilash
        } else {
            Swal.fire({...swalConfig, icon: 'error', title: 'Xato', text: res.detail || "Saqlashda xatolik"});
        }
    }).catch(err => {
        Swal.fire({...swalConfig, icon: 'error', title: 'Xatolik', text: "Server bilan aloqa yo'q"});
    });
}

// ==================== 📅 1. JADVALLAR MANTIG'I ====================
function saveSchedule() {
    let group = document.getElementById('sch-group').value.trim();
    let teacher = document.getElementById('sch-teacher').value.trim();
    let days = document.getElementById('sch-days').value.trim();
    let time = document.getElementById('sch-time').value.trim();
    let room = document.getElementById('sch-room').value;
    let phone = document.getElementById('sch-phone').value.trim();
    let photo = document.getElementById('sch-photo').value.trim() || './rasmlar/logo.png';
    let level = document.getElementById('sch-level').value.trim();

    if(!group || !teacher || !days || !time || !room) {
        return Swal.fire({...swalConfig, icon:'warning', title: "Ma'lumotlarni to'ldiring!"});
    }

    Swal.fire({...swalConfig, title: "Saqlanmoqda...", didOpen: () => Swal.showLoading()});
    let data = { groupName: group, teacher: teacher, days: days, time: time, room: room, phone: phone, photo: photo, level: level };
    
    apiRequest('/schedules', 'POST', data).then(res => {
        if(res.status === 'ok') {
            Swal.fire({...swalConfig, icon: 'success', title: 'Saqlandi!', timer: 1500, showConfirmButton: false});
            ['sch-group', 'sch-teacher', 'sch-days', 'sch-time', 'sch-room', 'sch-phone', 'sch-photo', 'sch-level'].forEach(id => document.getElementById(id).value = '');
            loadSchedules();
        }
    });
}

function loadSchedules() {
    fetch(`${API_URL}/schedules`).then(res => res.json()).then(res => {
        let select = document.getElementById('del-sch-select');
        select.innerHTML = '<option value="" class="bg-slate-900">-- Jadvalni tanlang --</option>';
        if(res.status === 'ok' && res.data) {
            Object.keys(res.data).forEach(key => {
                let s = res.data[key];
                select.innerHTML += `<option value="${key}" class="bg-slate-900">[${s.days}] ${s.groupName} - ${s.teacher}</option>`;
            });
        }
    });
}

function deleteSchedule() {
    let id = document.getElementById('del-sch-select').value;
    if(!id) return Swal.fire({...swalConfig, icon: 'warning', title: "Jadvalni tanlang!"});
    
    Swal.fire({...swalConfig, title: "O'chirasizmi?", icon: 'warning', showCancelButton: true, confirmButtonText: "Ha"}).then(res => {
        if(res.isConfirmed) {
            apiRequest(`/schedules/${id}`, 'DELETE').then(() => {
                Swal.fire({...swalConfig, icon:'success', title:"O'chirildi", timer:1000});
                loadSchedules();
            });
        }
    });
}

// ==================== 🎥 2. VIDEO DARSLAR MANTIG'I ====================
function saveVideo() {
    let fan = document.getElementById('vid-fan').value.trim();
    let mavzu = document.getElementById('vid-mavzu').value.trim();
    let link = document.getElementById('vid-link').value.trim();
    let muallif = document.getElementById('vid-muallif').value.trim() || 'O\'qituvchi';

    if(!fan || !mavzu || !link) return Swal.fire({...swalConfig, icon:'warning', title: "Joylarni to'ldiring!"});

    let videoId = link.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    if (!videoId) return Swal.fire({...swalConfig, icon: 'error', title: "YouTube havolasi xato!"});

    Swal.fire({...swalConfig, title: "Saqlanmoqda...", didOpen: () => Swal.showLoading()});
    let data = { fan: fan, mavzu: mavzu, videoId: videoId[1], originalLink: link, muallif: muallif };
    
    apiRequest('/videos', 'POST', data).then(res => {
        if(res.status === 'ok') {
            Swal.fire({...swalConfig, icon: 'success', title: 'Saqlandi!', timer: 1500, showConfirmButton: false});
            ['vid-mavzu', 'vid-link'].forEach(id => document.getElementById(id).value = '');
            loadVideos();
        }
    });
}

function loadVideos() {
    fetch(`${API_URL}/videos`).then(res => res.json()).then(res => {
        let select = document.getElementById('del-vid-select');
        select.innerHTML = '<option value="" class="bg-slate-900">-- Videoni tanlang --</option>';
        if(res.status === 'ok' && res.data) {
            Object.keys(res.data).forEach(key => {
                let v = res.data[key];
                select.innerHTML += `<option value="${key}" class="bg-slate-900">[${v.fan}] ${v.mavzu}</option>`;
            });
        }
    });
}

function deleteVideo() {
    let id = document.getElementById('del-vid-select').value;
    if(!id) return Swal.fire({...swalConfig, icon: 'warning', title: "Videoni tanlang!"});
    
    Swal.fire({...swalConfig, title: "O'chirasizmi?", icon: 'warning', showCancelButton: true, confirmButtonText: "Ha"}).then(res => {
        if(res.isConfirmed) {
            apiRequest(`/videos/${id}`, 'DELETE').then(() => {
                Swal.fire({...swalConfig, icon:'success', title:"O'chirildi", timer:1000});
                loadVideos();
            });
        }
    });
}

// ==================== 🎓 3. SERTIFIKATLAR MANTIG'I ====================
function saveCert() {
    let name = document.getElementById('cert-name').value.trim();
    let cId = document.getElementById('cert-id').value.trim();
    let course = document.getElementById('cert-course').value.trim();
    let img = document.getElementById('cert-img').value.trim();

    if(!name || !cId || !course || !img) return Swal.fire({...swalConfig, icon:'warning', title: "Ma'lumotlarni to'ldiring!"});

    Swal.fire({...swalConfig, title: "Saqlanmoqda...", didOpen: () => Swal.showLoading()});
    let data = { studentName: name, certId: cId, course: course, imageURL: img };
    
    apiRequest('/certificates', 'POST', data).then(res => {
        if(res.status === 'ok') {
            Swal.fire({...swalConfig, icon: 'success', title: 'Saqlandi!', timer: 1500, showConfirmButton: false});
            ['cert-name', 'cert-id', 'cert-img'].forEach(id => document.getElementById(id).value = '');
            loadCerts();
        }
    });
}

function loadCerts() {
    fetch(`${API_URL}/certificates`).then(res => res.json()).then(res => {
        let select = document.getElementById('del-cert-select');
        select.innerHTML = '<option value="" class="bg-slate-900">-- Sertifikatni tanlang --</option>';
        if(res.status === 'ok' && res.data) {
            Object.keys(res.data).forEach(key => {
                let c = res.data[key];
                select.innerHTML += `<option value="${key}" class="bg-slate-900">ID: ${c.certId} | ${c.studentName}</option>`;
            });
        }
    });
}

function deleteCert() {
    let id = document.getElementById('del-cert-select').value;
    if(!id) return Swal.fire({...swalConfig, icon: 'warning', title: "Sertifikatni tanlang!"});
    
    Swal.fire({...swalConfig, title: "O'chirasizmi?", icon: 'warning', showCancelButton: true, confirmButtonText: "Ha"}).then(res => {
        if(res.isConfirmed) {
            apiRequest(`/certificates/${id}`, 'DELETE').then(() => {
                Swal.fire({...swalConfig, icon:'success', title:"O'chirildi", timer:1000});
                loadCerts();
            });
        }
    });
}
