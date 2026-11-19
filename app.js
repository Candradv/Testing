// ─── MOBILE NAV ──────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

navToggle.addEventListener('click', () => {
  nav.classList.toggle('nav--open');
  const isOpen = nav.classList.contains('nav--open');
  navToggle.setAttribute('aria-expanded', isOpen);
  navToggle.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
});

// Close nav when a link is clicked (mobile)
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('nav--open'));
});

// ─── HEADER SCROLL SHADOW ─────────────────────────────────
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10
    ? '0 2px 20px rgba(0,0,0,.5)'
    : 'none';
}, { passive: true });

// ─── ASPIRASI FORM ────────────────────────────────────────
const STORAGE_KEY = 'karhutla_aspirasi';

const defaultAspirasi = [
  {
    id: 'default-1',
    nama: 'Siti Rahayuni',
    provinsi: 'Kalimantan Tengah',
    pesan: 'Saya tinggal di Palangkaraya. Sudah 3 minggu anak-anak kami tidak bisa sekolah karena asap. Ini tidak manusiawi. Pemerintah harus bertindak sekarang, bukan hanya saat kamera menyorot!',
    waktu: '2 jam yang lalu',
  },
  {
    id: 'default-2',
    nama: 'Bapak Markus Djaja',
    provinsi: 'Kalimantan Tengah',
    pesan: 'Hutan adat kami sudah terbakar 2 kali dalam 5 tahun terakhir. Siapa yang bertanggung jawab? Perusahaan-perusahaan itu tidak pernah dihukum. Kami yang menanggung semuanya.',
    waktu: '5 jam yang lalu',
  },
  {
    id: 'default-3',
    nama: 'dr. Andi Prasetyo',
    provinsi: 'Riau',
    pesan: 'Sebagai dokter, saya melihat langsung balita masuk IGD setiap hari selama musim karhutla. ISPA akut, pneumonia, sesak napas. Ini krisis kesehatan serius. Penegakan hukum pada pembakar lahan harus diperkuat sekarang juga.',
    waktu: '1 hari yang lalu',
  },
  {
    id: 'default-4',
    nama: 'Yuliana',
    provinsi: 'Sumatera Selatan',
    pesan: 'Stop bakar lahan! Kami yang tinggal di desa merasakan dampaknya paling besar, tapi kami paling tidak punya suara. Tahun ini kebun kami ikut terbakar. Siapa yang ganti rugi?',
    waktu: '2 hari yang lalu',
  },
  {
    id: 'default-5',
    nama: 'Kelompok Mahasiswa UNLAM',
    provinsi: 'Kalimantan Selatan',
    pesan: 'Kami menuntut transparansi data karhutla secara realtime. Publik berhak tahu siapa korporasi yang terlibat dalam pembakaran lahan. Rilis nama perusahaannya!',
    waktu: '3 hari yang lalu',
  },
];

function loadAspirasi() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultAspirasi;
  try {
    const parsed = JSON.parse(stored);
    return [...parsed, ...defaultAspirasi];
  } catch {
    return defaultAspirasi;
  }
}

function saveAspirasi(list) {
  // Only save user-submitted ones (not defaults)
  const userSubmitted = list.filter(a => !a.id.startsWith('default-'));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userSubmitted));
}

function formatTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit yang lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam yang lalu`;
  return `${Math.floor(hrs / 24)} hari yang lalu`;
}

function renderAspirasiCard(item) {
  const card = document.createElement('div');
  card.className = 'aspirasi-card';
  card.dataset.id = item.id;

  const waktu = item.waktu || formatTime(item.timestamp);
  const initials = (item.nama || 'Anonim')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');

  card.innerHTML = `
    <div class="aspirasi-card__header">
      <span class="aspirasi-card__name">${escapeHtml(item.nama || 'Anonim')}</span>
      <div class="aspirasi-card__meta">
        ${item.provinsi ? `<span class="aspirasi-card__prov">${escapeHtml(item.provinsi)}</span>` : ''}
        <span class="aspirasi-card__time">${escapeHtml(waktu)}</span>
      </div>
    </div>
    <p class="aspirasi-card__text">${escapeHtml(item.pesan)}</p>
  `;
  return card;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderAllAspirasi() {
  const list = loadAspirasi();
  const container = document.getElementById('aspirasiList');
  container.innerHTML = '';
  list.forEach(item => container.appendChild(renderAspirasiCard(item)));
}

// ─── FORM SUBMIT ──────────────────────────────────────────
const form = document.getElementById('aspirasiForm');
const pesanInput = document.getElementById('pesan');
const charCount = document.getElementById('charCount');
const formError = document.getElementById('formError');
const submitBtn = document.getElementById('submitBtn');

pesanInput.addEventListener('input', () => {
  const len = pesanInput.value.length;
  charCount.textContent = `${len} / 500`;
  charCount.style.color = len > 450 ? '#e85d04' : '';
  if (formError && !formError.hidden) formError.hidden = true;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const pesan = pesanInput.value.trim();
  if (!pesan) {
    formError.hidden = false;
    pesanInput.focus();
    return;
  }

  const newItem = {
    id: `user-${Date.now()}`,
    nama: document.getElementById('nama').value.trim() || 'Anonim',
    provinsi: document.getElementById('provinsi').value,
    pesan,
    timestamp: new Date().toISOString(),
  };

  // Save and re-render
  const stored = localStorage.getItem(STORAGE_KEY);
  let userList = [];
  try { userList = stored ? JSON.parse(stored) : []; } catch { userList = []; }
  userList.unshift(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userList));

  // Insert at top of wall
  const container = document.getElementById('aspirasiList');
  const card = renderAspirasiCard({ ...newItem, waktu: 'Baru saja' });
  container.insertBefore(card, container.firstChild);
  container.scrollTop = 0;

  // Reset form
  form.reset();
  charCount.textContent = '0 / 500';

  // Feedback on button
  submitBtn.textContent = 'Aspirasi berhasil dikirim!';
  submitBtn.style.background = '#2ea043';
  submitBtn.disabled = true;
  setTimeout(() => {
    submitBtn.textContent = 'Kirimkan Suara Sekarang';
    submitBtn.style.background = '';
    submitBtn.disabled = false;
  }, 3000);
});

// ─── INIT ─────────────────────────────────────────────────
renderAllAspirasi();
