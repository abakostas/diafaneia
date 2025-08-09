// Διαφάνεια – Supabase Auth (client-side)
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: read session and show/hide panels
async function loadSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const panel = document.getElementById('panel');
  const guest = document.getElementById('guest');
  if (!panel || !guest) return;
  if (session) {
    guest.style.display = 'none';
    panel.style.display = 'block';
    const user = session.user;
    // fetch profile metadata
    const full = user.user_metadata?.full_name || '';
    const hide = user.user_metadata?.hide_name || false;
    const fullEl = document.getElementById('fullName');
    const hideEl = document.getElementById('hideName');
    if (fullEl) fullEl.textContent = full || '(δεν έχει δηλωθεί)';
    if (hideEl) hideEl.checked = !!hide;
  } else {
    panel.style.display = 'none';
    guest.style.display = 'block';
  }
}

// Signup/Login buttons (magic link)
window.addEventListener('DOMContentLoaded', () => {
  const elSignup = document.getElementById('btnSignup');
  const elLogin = document.getElementById('btnLogin');
  const elLogout = document.getElementById('btnLogout');
  const msg = document.getElementById('msg');

  if (elSignup) elSignup.onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const full_name = document.getElementById('full_name').value.trim();
    if (!email || !full_name) { msg.textContent = 'Συμπλήρωσε όνομα και email.'; return; }
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/dashboard.html',
        data: { full_name, hide_name: false }
      }
    });
    msg.textContent = error ? ('Σφάλμα: ' + error.message) : 'Σου στείλαμε email με σύνδεσμο.';
  };

  if (elLogin) elLogin.onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const full_name = document.getElementById('full_name').value.trim() || undefined;
    if (!email) { msg.textContent = 'Βάλε email.'; return; }
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/dashboard.html',
        data: { full_name }
      }
    });
    msg.textContent = error ? ('Σφάλμα: ' + error.message) : 'Σου στείλαμε email με σύνδεσμο.';
  };

  if (elLogout) elLogout.onclick = async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  };

  const saveProfile = document.getElementById('saveProfile');
  if (saveProfile) saveProfile.onclick = async () => {
    const hide = document.getElementById('hideName').checked;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    const { error } = await supabaseClient.auth.updateUser({ data: { ...user.user_metadata, hide_name: hide } });
    if (!error) alert('Αποθηκεύτηκε.');
  };

  loadSession();
});