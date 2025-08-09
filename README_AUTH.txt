# Διαφάνεια – Auth Πιλοτικό (Static + Supabase)
Βήματα:
1) Δημιούργησε Project στο https://app.supabase.com
2) Πήγαινε Project Settings → API: πάρε το **Project URL** και το **anon public key**.
3) Άνοιξε το `app.js` και βάλε τα:
   const SUPABASE_URL = "https://...supabase.co";
   const SUPABASE_ANON_KEY = "eyJhbGci...";
4) Κάνε commit/push στο GitHub (ή upload τα αρχεία).
5) Το Vercel θα κάνει αυτόματα redeploy. Τσέκαρε τις σελίδες:
   - `/auth.html` για εγγραφή/σύνδεση (magic link email)
   - `/dashboard.html` για την πιλοτή
Σημείωση: τα metadata `full_name` (ιδιωτικό) και `hide_name` (προεπιλογή false) αποθηκεύονται στον χρήστη.
