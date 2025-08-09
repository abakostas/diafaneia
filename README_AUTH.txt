# Διαφάνεια – Πιλοτικό με Υποβολή
Ανεβάστε όλα τα αρχεία στο ίδιο GitHub repo.
ΠΡΙΝ το deploy, ανοίξτε το app.js και βάλτε:
const SUPABASE_URL = "https://...supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGci..."

Στο Supabase:
- SQL Editor: δημιουργήστε τον πίνακα `posts` όπως δώσαμε
- Storage: bucket `images` με public read policy
- Auth → URL Configuration: Site URL = https://diafaneia.vercel.app
