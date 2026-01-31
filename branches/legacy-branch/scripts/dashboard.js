const supabaseUrl = "https://mcygwruypdbfagdxdpxc.supabase.co";
const supabaseKey = "sb_publishable__sVSahxR1O1fqnhko-tx4A_aMjh6Kjt";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSession = urlParams.get('session');
    let saved = localStorage.getItem('chat_session');

    if (urlSession) {
        saved = atob(urlSession);
        localStorage.setItem('chat_session', saved);
    }

    if (!saved) return (window.location.href = 'chat.html');

    const localUser = JSON.parse(saved);
    const { data: profile, error } = await supabaseClient.from('profiles').select('*').eq('student_id', localUser.student_id).single();

    if (error || !profile || !profile.role || !['ADMIN', 'EXEC'].includes(profile.role)) {
        alert("unauthorized access");
        window.location.href = 'chat.html';
    } else {
        loadDashboard();
    }
}

async function loadDashboard() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSession = urlParams.get('session');
    let saved = localStorage.getItem('chat_session');

    if (urlSession) {
        saved = atob(urlSession);
        localStorage.setItem('chat_session', saved);
    }

    if (!saved) return (window.location.href = 'chat.html');

    const localUser = JSON.parse(saved);

    const { data: profile } = await supabaseClient.from('profiles').select('*').eq('student_id', localUser.student_id).single();
    const { data: allUsers, error } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) return console.error(error);

    const searchTerm = document.getElementById('userSearch').value.toLowerCase();

    // stats (lowercase)
    document.getElementById('stat-pending').innerText = allUsers.filter(u => !u.is_approved && !u.status_message?.includes("denied:")).length;
    document.getElementById('stat-total').innerText = allUsers.length;

    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = '';

    allUsers.forEach(user => {
        // Determine which role to display
        const role = (user.role || 'USER').toUpperCase();

        // Determine the CSS class based on role
        let animationClass = "";
        if (role === 'ADMIN') animationClass = "role-admin";
        else if (role === 'MOD') animationClass = "role-mod";
        else if (role === 'EXEC') animationClass = "role-exec";

        let statusHTML = '';
        if (user.is_approved) {
            statusHTML = '<span class="badge badge-approved">approved</span>';
        } else if (!user.is_approved) {
            statusHTML = '<span class="badge" style="background:#f44336; color:white;">denied</span>';
        } else {
            statusHTML = '<span class="badge badge-pending">pending</span>';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${user.student_id}</td>
        <td>${(user.real_name || 'n/a').toLowerCase()}</td>
        <td>
            <span class="${animationClass}">
                @${user.username.toLowerCase()} [${role}]
            </span>
        </td>
        <td>${statusHTML}</td>
        <td style="display:flex; gap:10px;">
            ${profile.role == "EXEC" ? `<button onclick="editUser('${user.student_id}')" style="color:#bb86fc; border:none; background:none; cursor:pointer;">edit</button>` : ''}
            ${!user.is_approved ? `<button onclick="approveUser('${user.student_id}')" style="color:#4CAF50; border:none; background:none; cursor:pointer;">approve</button>` : ''}
            <button onclick="denyUser('${user.student_id}')" style="color:#f44336; border:none; background:none; cursor:pointer;">deny</button>
            ${profile.role == "EXEC" ? `<button onclick="deleteUser('${user.student_id}')" style="color:#888; border:none; background:none; cursor:pointer;">delete</button>` : ''}
        </td>
    `;
        tbody.appendChild(row);
    });
}

/* --- user actions --- */

window.editUser = async (sId) => {
    const { data: user } = await supabaseClient.from('profiles').select('*').eq('student_id', sId).single();
    if (!user) return;

    const newUsername = prompt(`New username:`, user.username);
    const newRole = prompt(`Enter role (USER, MOD, ADMIN, VIP, EXEC):`, user.role || 'USER').toUpperCase();

    const roles = ['USER', 'MOD', 'ADMIN', 'VIP', 'EXEC'];
    if (!roles.includes(newRole)) return alert("Invalid role");

    await supabaseClient.from('profiles').update({
        username: (newUsername || user.username).toLowerCase(),
        role: newRole
    }).eq('student_id', sId);

    loadDashboard();
};

window.approveUser = async (sId) => {
    await supabaseClient.from('profiles').update({ is_approved: true, status_message: '' }).eq('student_id', sId);
    loadDashboard();
};

window.denyUser = async (sId) => {
    const reason = prompt("enter denial reason (shown to user):");
    if (reason === null) return;
    // stores as "denied: [reason]" so chat.js can pick it up
    await supabaseClient.from('profiles').update({
        is_approved: false,
        status_message: `denied: ${reason.toLowerCase()}`
    }).eq('student_id', sId);
    loadDashboard();
};

window.deleteUser = async (sId) => {
    if (confirm("delete this user permanently?")) {
        await supabaseClient.from('profiles').delete().eq('student_id', sId);
        loadDashboard();
    }
};

/* --- massive actions --- */

window.clearAllMessages = async () => {
    const code = prompt("type 'delete' to confirm clearing chat history:");
    if (code?.toLowerCase() === 'delete') {
        const { error } = await supabaseClient
            .from('messages')
            .delete()
            .not('id', 'is', null);

        if (error) alert("error: " + error.message);
        else alert("chat history cleared.");
    }
};

window.logout = () => { localStorage.removeItem('chat_session'); window.location.href = 'chat.html'; };

document.addEventListener('DOMContentLoaded', checkAdmin);