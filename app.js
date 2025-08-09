// Διαφάνεια – Supabase Auth + Υποβολή
// Βάλε εδώ τα στοιχεία του Supabase (Settings → API)
const SUPABASE_URL = "https://rsdtthgofhzsgmbtqsfw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZHR0aGdvZmh6c2dtYnRxc2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTQ1MTEsImV4cCI6MjA3MDMzMDUxMX0._o95T7yfgp5oi_sqcBtxdoHmRJVNKLzKKGvFvAP6a20";

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

// Υποβολή είδησης
const btnSubmit = document.getElementById('btnSubmit');
if (btnSubmit) {
  btnSubmit.onclick = async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      alert('Πρέπει να συνδεθείς πρώτα.');
      return;
    }
    const title = document.getElementById('title').value.trim();
    const body = document.getElementById('body').value.trim();
    const source = document.getElementById('source').value.trim();
    const hideName = document.getElementById('hideName').checked;
    const fileInput = document.getElementById('image');
    let image_url = null;

    if (!title || !body) {
      alert('Συμπλήρωσε τίτλο και κείμενο.');
      return;
    }

    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      let { error: uploadError } = await supabaseClient.storage
        .from('images')
        .upload(filePath, file);
      if (uploadError) {
        alert('Σφάλμα ανεβάσματος εικόνας');
        return;
      }
      const { data } = supabaseClient.storage.from('images').getPublicUrl(filePath);
      image_url = data.publicUrl;
    }

    const { error } = await supabaseClient.from('posts').insert([{
      title,
      body,
      source_url: source || null,
      image_url,
      author_id: user.id,
      hide_name: hideName
    }]);

    if (error) {
      alert('Σφάλμα: ' + error.message);
    } else {
      alert('Η είδηση καταχωρήθηκε!');
      window.location.href = 'dashboard.html';
    }
  };
}
