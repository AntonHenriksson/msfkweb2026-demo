const list = document.getElementById('news-list');
const isDemo = location.hostname.endsWith('github.io');

const demoArticles = [
  { id: 99, title: 'Premiärfiske i Bredagyl', body: 'Lördag 18 april är det äntligen dags för årets fiskepremiär i Bredagyl! Välkomna till klubbsjön.', createdAt: Date.UTC(2026, 3, 1), published: true, imagePath: null },
  { id: 98, title: 'Årsmöte', body: 'Alla medlemmar hälsas hjärtligt välkomna till årsmötet i klubblokalen. Kaffe och fika serveras!', createdAt: Date.UTC(2026, 0, 25), published: true, imagePath: null },
];

// Fee card flip functionality
function initFeeCardFlip() {
  const feeCards = document.querySelectorAll('.fee-card');
  
  feeCards.forEach(card => {
    // Click on card to flip
    card.addEventListener('click', (e) => {
      // Don't flip if clicking the back button
      if (e.target.closest('.flip-back')) return;
      card.classList.toggle('flipped');
    });
    
    // Handle back button
    const backBtn = card.querySelector('.flip-back');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.remove('flipped');
      });
    }
    
    // Keyboard accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });
}

async function load() {
  try {
    const res = await fetch('api/news');
    if (!res.ok) throw new Error('fetch failed');
    const articles = await res.json();
    render(articles);
  } catch (err) {
    if (isDemo) {
      render(demoArticles);
    } else {
      list.innerHTML = '<p class="empty">Kunde inte ladda nyheter.</p>';
    }
  }
}

function render(articles) {
  if (!articles.length) {
    list.innerHTML = '<p class="empty">Inga nyheter ännu. Kom tillbaka snart!</p>';
    return;
  }
  list.innerHTML = articles.map((a) => `
    <article class="news-card">
      ${a.imagePath ? `<img src="${a.imagePath}" alt="">` : ''}
      <div class="news-body">
        <time>${formatDate(a.createdAt)}</time>
        <h3>${escapeHtml(a.title)}</h3>
        <div class="content">${escapeHtml(a.body)}</div>
      </div>
    </article>
  `).join('');
}

function formatDate(ms) {
  return new Date(ms).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

load();

initFeeCardFlip();
