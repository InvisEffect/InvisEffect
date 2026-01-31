/* =======================
   SUPABASE SETUP
======================= */
const supabaseUrl = "https://mcygwruypdbfagdxdpxc.supabase.co";
const supabaseKey = "sb_publishable__sVSahxR1O1fqnhko-tx4A_aMjh6Kjt";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let currentUser = null;
let blockedTerms = [];
let lastSendTime = 0;
const COOLDOWN_MS = 2000;

const showView = (index) => {
    const contents = document.querySelectorAll('#content');
    contents.forEach((c, i) => c.style.display = (i === index) ? 'block' : 'none');
};

/* =======================
   FILTERING LOGIC
======================= */
async function loadBlockedWords() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/en');
        const text = await res.text();
        blockedTerms = text.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
    } catch (e) {
        blockedTerms = ["spam", "badword"];
    }
}

const containsBadWords = (text) => {
    const lowerText = text.toLowerCase();
    return blockedTerms.find(term => new RegExp(`\\b${term}\\b`, 'i').test(lowerText));
};

/* =======================
   AUTH LOGIC
======================= */
window.toggleAuthMode = function () {
    const isLogin = document.getElementById('signup-only').style.display === "flex";
    document.getElementById('auth-title').innerText = isLogin ? "login to chat" : "request access";
    document.getElementById('signup-only').style.display = isLogin ? "none" : "flex";
    document.getElementById('loginBtn').style.display = isLogin ? "block" : "none";
    document.getElementById('signupBtn').style.display = isLogin ? "none" : "block";
    document.getElementById('toggle-link').innerText = isLogin ? "sign up" : "back to login";

    const inst = document.getElementById('auth-instructions');
    if (inst) {
        inst.innerHTML = isLogin
            ? "welcome back. enter your credentials."
            : "new here? fill the form. admins will review your request.";
    }
};

window.handleLogin = async function () {
    const sId = document.getElementById('field-sid').value.trim();
    const pass = document.getElementById('field-pass').value.trim();
    const msgLabel = document.getElementById('status-msg');
    const reasonBox = document.getElementById('rejection-reason');

    if (reasonBox) reasonBox.style.display = 'none';

    const { data: profile } = await supabaseClient
        .from('profiles').select('*').eq('student_id', sId).eq('password', pass).single();

    if (profile) {
        if (profile.is_approved) {
            localStorage.setItem('chat_session', JSON.stringify(profile));
            launchChat(profile);
        } else if (profile.status_message && profile.status_message.includes("denied:")) {
            msgLabel.innerText = "access denied: " + profile.status_message.split("denied:")[1].trim();
            msgLabel.style.color = "#ff4444";
            if (reasonBox) {
                reasonBox.innerText = profile.status_message.toLowerCase();
                reasonBox.style.display = 'block';
            }
        } else {
            msgLabel.innerText = "wait for admin approval.";
            msgLabel.style.color = "#ffbb33";
        }
    } else {
        msgLabel.innerText = "student id or password is incorrect.";
        msgLabel.style.color = "#ff4444";
    }
};

window.handleSignup = async function () {
    const fields = {
        student_id: document.getElementById('field-sid').value.trim(),
        username: document.getElementById('field-user').value.trim(),
        real_name: document.getElementById('field-name').value.trim(),
        password: document.getElementById('field-pass').value.trim()
    };

    if (containsBadWords(fields.username)) return alert("that username is not allowed.");

    const { error } = await supabaseClient.from('profiles').insert([{
        ...fields, is_approved: false, role: "USER"
    }]);

    document.getElementById('status-msg').innerText = error ? "error: id already exists." : "request sent. check back later.";
};

/* =======================
   CHAT SYSTEM
======================= */
function launchChat(user) {
    currentUser = user;
    showView(1);
    const adminBtn = document.getElementById('adminSidebarBtn');
    if (adminBtn) adminBtn.style.display = user.role && ['ADMIN', 'EXEC'].includes(user.role) ? "flex" : "none";
    loadMessages();
    setupSubscriptions();
}

async function loadMessages() {
    const { data: msgs } = await supabaseClient
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

    const display = document.getElementById('regular-messages');
    const pinnedDisplay = document.getElementById('pinned-messages');

    if (!display) return;

    display.innerHTML = '';
    if (pinnedDisplay) pinnedDisplay.innerHTML = '<p style="opacity:0.5; font-size:12px; margin-bottom:10px;">pinned messages</p>';

    msgs?.forEach(msg => renderMessage(msg, (msg.is_pinned && pinnedDisplay) ? pinnedDisplay : display));

    setTimeout(() => {
        document.getElementById('messages').scrollTop = display.scrollHeight;
    }, 50);
}

function renderMessage(msg, container) {
    const div = document.createElement('div');
    div.className = 'message-row';

    const isStaff = currentUser && ['MOD', 'ADMIN', 'EXEC'].includes(currentUser.role);

    const role = msg.role ? msg.role.toUpperCase() : 'USER';
    let roleClass = `role-${role.toLowerCase()}`;

    let roleStyle = "";
    if (role === 'ADMIN') roleStyle = "color:#ff4444;";
    if (role === 'MOD') roleStyle = "color:#ff00ff;";

    let roleBadge = role !== 'USER' ? `<span class="${roleClass}" style="${roleStyle} margin-right:5px;">[${role}]</span>` : "";

    div.innerHTML = `
        <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
            <div style="flex: 1;">
                ${roleBadge}
                <span style="color:#bb86fc; font-weight:bold;">${msg.username}:</span> 
                <span style="color:#eee; margin-left:5px;">${msg.message}</span>
            </div>
            ${isStaff ? `
                <button onclick="togglePin('${msg.id}', ${msg.is_pinned})" style="background:none; border:none; cursor:pointer;">${msg.is_pinned ? '📍' : '📌'}</button>
                <button onclick="deleteMessage('${msg.id}')" style="background:none; border:none; color:#ff4444; cursor:pointer;">✕</button> ` : ''}
        </div>`;
    container.appendChild(div);
}

/* =======================
   ADMIN ACTIONS
======================= */
window.togglePin = async (id, status) => await supabaseClient.from('messages').update({ is_pinned: !status }).eq('id', id);

window.deleteMessage = async (id) => {
    if (confirm("delete permanently?")) await supabaseClient.from('messages').delete().eq('id', id);
};

window.openAdminPanel = () => {
    const session = localStorage.getItem('chat_session');
    if (session) window.location.href = `dashboard.html?session=${btoa(session)}`;
};

/* =======================
   CORE SCRIPT
======================= */
window.sendMessage = async function () {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    const now = Date.now();

    if (!text || !currentUser || !/[a-zA-Z]/.test(text)) return;
    if (now - lastSendTime < COOLDOWN_MS) return alert("slow down.");
    if (containsBadWords(text)) return alert("message blocked.");

    input.value = '';
    lastSendTime = now;

    await supabaseClient.from('messages').insert([{
        student_id: currentUser.student_id,
        username: currentUser.username,
        message: text,
        role: currentUser.role,
    }]);
};

function setupSubscriptions() {
    supabaseClient
        .channel('chat')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, loadMessages)
        .subscribe();
}

window.logout = () => { localStorage.removeItem('chat_session'); location.reload(); };

document.addEventListener('DOMContentLoaded', async () => {
    loadBlockedWords();
    const saved = localStorage.getItem('chat_session');
    if (saved) {
        const local = JSON.parse(saved);
        const { data: fresh } = await supabaseClient.from('profiles').select('*').eq('student_id', local.student_id).single();
        (fresh && fresh.is_approved) ? launchChat(fresh) : logout();
    } else showView(0);

    document.getElementById('sendBtn').onclick = window.sendMessage;
    document.getElementById('messageInput').onkeypress = (e) => { if (e.key === 'Enter') window.sendMessage(); };
});