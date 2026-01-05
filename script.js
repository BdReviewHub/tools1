// ============================================
// ⚠️ ADMIN CONFIGURATION AREA
// ============================================
const CONFIG = {
    // 1. OLD SCRIPT URL (Login/Registration) - এখানে আপনার আগের লিংকটি বসান
    authScriptURL: "https://script.google.com/macros/s/AKfycbxu23YNqJbDImYa8SFexSz-1SWKRrgkjx2xEM1Dazo-jb8t1PHosE15qkK3b3zDl7g7yA/exec", 

    // 2. NEW SCRIPT URL (VIP Codes) - এখানে নতুন শিটের লিংকটি বসান
    vipScriptURL: "https://script.google.com/macros/s/AKfycbx1XbbV0fxb0u6CJLYVx1ItygI-cjCKng4fetKTRNVvd0lO-YYjCOyFH3Jgsxy03NgHxA/exec",

    // --- OTHER SETTINGS ---
    noticeText: "🚀 Welcome to ProToolsHub! 🔥 Get 50% OFF on Yearly Plan! ⚡ Instant Activation with Bkash/Nagad.",
    logoImageURL: "https://i.imgur.com/your-logo.png", 
    useImageLogo: false, 
    courses: [
        { title: "CPA Marketing", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80" },
        { title: "Ethical Hacking", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80" },
        { title: "Advance Data Entry", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80" },
        { title: "Python Automation", image: "https://images.unsplash.com/photo-1515879433056-bfab115c18e9?w=500&q=80" },
        { title: "Email Secret Master", image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=500&q=80" },
    ]
};

// ============================================
// MAIN LOGIC STARTS
// ============================================
let isLoggedIn = false;
let currentTool = null;

window.onload = function() {
    setupSite();
    checkLoginStatus();
};

function setupSite() {
    // Logo & Notice
    const imgLogo = document.getElementById('imgLogo');
    const textLogo = document.getElementById('textLogo');
    if (CONFIG.useImageLogo && CONFIG.logoImageURL) {
        imgLogo.src = CONFIG.logoImageURL; imgLogo.classList.remove('hidden'); textLogo.classList.add('hidden');
    } else { imgLogo.classList.add('hidden'); textLogo.classList.remove('hidden'); }
    
    document.getElementById('noticeText').innerText = CONFIG.noticeText;

    // Load Marquee
    const courseHTML = [...CONFIG.courses, ...CONFIG.courses].map(course => `
        <div class="marquee-item group relative">
            <img src="${course.image}" alt="${course.title}">
            <div class="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 p-3 text-center">
                <span class="font-bold text-white text-xs sm:text-sm whitespace-normal">${course.title}</span>
            </div>
        </div>
    `).join('');
    
    if(document.getElementById('publicCourseMarquee')) document.getElementById('publicCourseMarquee').innerHTML = courseHTML;
    if(document.getElementById('dashboardCourseMarquee')) document.getElementById('dashboardCourseMarquee').innerHTML = courseHTML;
}

function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('proToolsUser'));
    if (user && user.isLoggedIn) {
        isLoggedIn = true;
        document.getElementById('home-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        document.getElementById('menuPublic').classList.add('hidden');
        document.getElementById('menuPrivate').classList.remove('hidden');
        
        const navBtn = document.getElementById('navAuthBtn');
        navBtn.innerHTML = `<i class="ph ph-sign-out mr-1.5"></i> Logout`;
        navBtn.classList.replace('bg-white/10', 'bg-red-600');
        navBtn.onclick = logout;

        document.getElementById('dashUserName').innerText = user.name || "User";
        updatePlanBadge(user.plan);
    }
}

function updatePlanBadge(plan) {
    const badge = document.getElementById('userPlanBadge');
    const dashPlan = document.getElementById('dashUserPlan');
    const isPremium = (plan && plan !== 'Free');
    
    badge.innerText = isPremium ? "PREMIUM" : "FREE";
    badge.className = `hidden md:inline-block text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${isPremium ? "text-green-400 border-green-500/20 bg-green-500/10" : "text-red-400 border-red-500/20 bg-red-500/10 animate-pulse"}`;
    badge.classList.remove('hidden');
    
    dashPlan.innerText = isPremium ? `${plan} ✅` : "Locked 🔒";
    dashPlan.className = isPremium ? "text-green-400 font-bold" : "text-red-400 font-bold";

    const iconClass = isPremium ? "ph-arrow-square-out text-green-400" : "ph-lock-key text-gray-500";
    ['ua', 'email', 'validator', 'number', 'address'].forEach(id => {
        const icon = document.getElementById(`lockIcon_${id}`);
        if(icon) icon.className = `ph ${iconClass} transition`;
    });
}

// === ACCESS CHECK LOGIC (LOCK TOOLS) ===
function checkAccess(toolId) {
    const user = JSON.parse(localStorage.getItem('proToolsUser'));
    if (!user || !user.isLoggedIn) {
        alert("Please Login First!"); return;
    }
    // If Plan is Free, Show Lock Modal
    if (!user.plan || user.plan === 'Free') {
        document.getElementById('lockModal').classList.remove('hidden');
    } else {
        loadTool(toolId);
    }
}

// === REDEEM CODE LOGIC (Uses NEW Script) ===
function redeemVipCode() {
    const codeInput = document.getElementById('vipCodeInput');
    const code = codeInput.value.trim();
    const user = JSON.parse(localStorage.getItem('proToolsUser'));
    
    if (!user || !user.isLoggedIn) { alert("Please login first!"); return; }
    if (!code) { alert("⚠️ Please enter a code!"); return; }

    const btn = document.querySelector('#vipCodeInput + button');
    const originalText = btn.innerText;
    btn.innerText = "Verifying...";
    btn.disabled = true;

    const data = new URLSearchParams();
    data.append('action', 'redeem');
    data.append('email', user.email);
    data.append('code', code);

    fetch(CONFIG.vipScriptURL, { method: 'POST', body: data })
    .then(res => res.json())
    .then(result => {
        if (result.result === 'success') {
            alert(`✅ Success! Plan Updated to: ${result.newPlan}`);
            user.plan = result.newPlan;
            localStorage.setItem('proToolsUser', JSON.stringify(user));
            updatePlanBadge(result.newPlan);
            document.getElementById('lockModal').classList.add('hidden');
            codeInput.value = "";
        } else {
            alert("❌ " + result.message);
        }
    })
    .catch(err => { alert("❌ Network/Server Error!"); console.error(err); })
    .finally(() => { btn.innerText = originalText; btn.disabled = false; });
}

function loadTool(toolId) {
    currentTool = toolId;
    const consoleDiv = document.getElementById('toolConsole');
    const title = document.getElementById('activeToolName');
    const output = document.getElementById('consoleOutput');
    consoleDiv.classList.remove('hidden');
    output.innerHTML = ``; 
    window.scrollTo({ top: consoleDiv.offsetTop - 100, behavior: 'smooth' });
    const titles = { 'ua': 'User Agent Gen', 'email': 'Bulk Email Gen', 'validator': 'Email Validator', 'number': 'Number Gen', 'address': 'Address Gen' };
    title.innerHTML = `<i class="ph ph-terminal"></i> ${titles[toolId]}`;
    output.innerHTML = `> Access Granted. Initializing ${titles[toolId]}...<br>> Ready.`;
}

function generateData() {
    const output = document.getElementById('consoleOutput');
    if(!currentTool) return;
    output.innerHTML += `<br><span class="text-yellow-400">> Processing...</span>`;
    output.scrollTop = output.scrollHeight;
    setTimeout(() => {
        let res = "";
        if(currentTool==='ua') res = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36";
        if(currentTool==='email') res = `marketer${Math.floor(Math.random()*999)}@gmail.com`;
        if(currentTool==='number') res = `+880 17${Math.floor(Math.random()*99999999)}`;
        if(currentTool==='address') res = `123, Park Avenue, NY 100${Math.floor(Math.random()*99)}`;
        output.innerHTML += `<br><span class="text-white font-bold">> [SUCCESS]: ${res}</span>`;
        output.scrollTop = output.scrollHeight;
    }, 700);
}

// === AUTH LOGIC (Uses OLD Script) ===
function showSection(sectionId) {
    if(sectionId === 'dashboard' && isLoggedIn) {
        document.getElementById('home-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        window.scrollTo(0,0);
    }
}
function scrollToPricing() { document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' }); }
function openAuthModal(planInfo = 'Free') {
    if(isLoggedIn) return;
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('selectedPlan').value = planInfo;
    if (planInfo !== 'Free') switchTab('register'); else switchTab('login');
}
function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('authMessage').classList.add('hidden');
}
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    if (tab === 'login') {
        loginForm.classList.remove('hidden'); registerForm.classList.add('hidden');
        tabLogin.className = "flex-1 py-4 text-sm font-bold text-white border-b-2 border-purple-500 bg-white/5";
        tabRegister.className = "flex-1 py-4 text-sm font-bold text-gray-400 hover:text-white";
    } else {
        loginForm.classList.add('hidden'); registerForm.classList.remove('hidden');
        tabRegister.className = "flex-1 py-4 text-sm font-bold text-white border-b-2 border-purple-500 bg-white/5";
        tabLogin.className = "flex-1 py-4 text-sm font-bold text-gray-400 hover:text-white";
    }
}
function handleAuth(event, action) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const msgDiv = document.getElementById('authMessage');
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "Processing..."; btn.disabled = true; msgDiv.classList.add('hidden');
    const data = new URLSearchParams(); data.append('action', action);
    for (const pair of formData) data.append(pair[0], pair[1]);
    
    // Uses AUTH SCRIPT URL
    fetch(CONFIG.authScriptURL, { method: 'POST', body: data }).then(res => res.json()).then(result => {
        msgDiv.classList.remove('hidden');
        if (result.result === 'success') {
            msgDiv.className = "px-8 pb-6 text-center text-xs font-bold text-green-400"; msgDiv.innerText = result.message;
            if (action === 'login') {
                const userData = { isLoggedIn: true, name: result.userData?.name, email: result.userData?.email, plan: result.userData?.plan || "Free" };
                localStorage.setItem('proToolsUser', JSON.stringify(userData));
                setTimeout(() => { closeAuthModal(); location.reload(); }, 1000);
            } else {
                form.reset();
                setTimeout(() => { switchTab('login'); msgDiv.innerText = "Payment Sent! Please Login."; }, 2000);
            }
        } else {
            msgDiv.className = "px-8 pb-6 text-center text-xs font-bold text-red-400"; msgDiv.innerText = result.message;
        }
    }).catch(err => { msgDiv.innerText = "Connection Failed."; }).finally(() => { btn.innerText = originalText; btn.disabled = false; });
}
function logout() { localStorage.removeItem('proToolsUser'); location.reload(); }
