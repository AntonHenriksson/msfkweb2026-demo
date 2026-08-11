const list = document.getElementById('news-list');
const isDemo = location.hostname.endsWith('github.io');

const demoArticles = [
  { id: 99, title: 'Premiärfiske i Bredagyl', body: 'Lördag 18 april är det äntligen dags för årets fiskepremiär i Bredagyl! Välkomna till klubbsjön.', createdAt: Date.now() - 86400000, published: true, imagePath: null },
  { id: 98, title: 'Årsmöte', body: 'Alla medlemmar hälsas hjärtligt välkomna till årsmötet i klubblokalen. Kaffe och fika serveras!', createdAt: Date.now() - 172800000, published: true, imagePath: null },
];

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
