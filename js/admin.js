const listEl = document.getElementById('list');
const editor = document.getElementById('editor');
const editorTitle = document.getElementById('editor-title');
const fieldId = document.getElementById('field-id');
const fieldTitle = document.getElementById('field-title');
const fieldBody = document.getElementById('field-body');
const fieldPublished = document.getElementById('field-published');
const fieldImage = document.getElementById('field-image');
const imgPreview = document.getElementById('img-preview');
const editorStatus = document.getElementById('editor-status');

let articles = [];

document.getElementById('new-btn').addEventListener('click', () => openEditor(null));
document.getElementById('cancel-btn').addEventListener('click', closeEditor);
document.getElementById('save-btn').addEventListener('click', save);
document.getElementById('logout-btn').addEventListener('click', logout);
fieldImage.addEventListener('change', () => {
  imgPreview.style.display = 'block';
  imgPreview.src = URL.createObjectURL(fieldImage.files[0]);
});

async function load() {
  try {
    const res = await fetch('api/admin/news');
    if (res.status === 401) { location.href = 'adminlogin.html'; return; }
    if (!res.ok) throw new Error('fetch failed');
    articles = await res.json();
    renderList();
  } catch (err) {
    listEl.innerHTML = '<p class="empty">Kunde inte ladda nyheter.</p>';
  }
}

function renderList() {
  if (!articles.length) {
    listEl.innerHTML = '<p class="empty">Inga artiklar ännu. Klicka på "Ny artikel".</p>';
    return;
  }
  listEl.innerHTML = articles.map((a) => `
    <div class="news-row">
      <div>
        <strong>${escapeHtml(a.title)}</strong>
        <div class="meta">${formatDate(a.createdAt)}
          <span class="badge ${a.published ? 'pub' : 'draft'}">${a.published ? 'Publicerad' : 'Utkast'}</span>
        </div>
      </div>
      <div>
        <button class="btn" onclick="editArticle(${a.id})">Redigera</button>
        <button class="btn danger" onclick="deleteArticle(${a.id})">Ta bort</button>
      </div>
    </div>
  `).join('');
}

function openEditor(article) {
  fieldId.value = article ? article.id : '';
  fieldTitle.value = article ? article.title : '';
  fieldBody.value = article ? article.body : '';
  fieldPublished.checked = article ? article.published : true;
  fieldImage.value = '';
  imgPreview.style.display = 'none';
  imgPreview.src = '';
  editorTitle.textContent = article ? 'Redigera artikel' : 'Ny artikel';
  editorStatus.textContent = '';
  editor.classList.add('show');
  fieldTitle.focus();
}

function closeEditor() {
  editor.classList.remove('show');
  editorStatus.textContent = '';
}

async function save() {
  const title = fieldTitle.value.trim();
  const body = fieldBody.value.trim();
  if (!title || !body) { editorStatus.textContent = 'Rubrik och text krävs.'; return; }

  const payload = {
    title,
    body,
    published: fieldPublished.checked,
  };

  const id = fieldId.value;
  editorStatus.textContent = 'Sparar…';
  try {
    const res = await fetch(id ? `api/admin/news/${id}` : 'api/admin/news', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) { location.href = 'adminlogin.html'; return; }
    if (!res.ok) throw new Error('save failed');
    const saved = await res.json();

    if (fieldImage.files.length) {
      const file = fieldImage.files[0];
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const imgRes = await fetch(`api/admin/news/${saved.id}/image?ext=${encodeURIComponent(ext)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: file,
      });
      if (imgRes.status === 401) { location.href = 'adminlogin.html'; return; }
      if (!imgRes.ok) throw new Error('image upload failed');
    }

    closeEditor();
    await load();
  } catch (err) {
    editorStatus.textContent = 'Något gick fel vid sparandet.';
  }
}

async function deleteArticle(id) {
  const a = articles.find((x) => x.id === id);
  if (!a || !confirm(`Ta bort "${a.title}"?`)) return;
  const res = await fetch(`api/admin/news/${id}`, { method: 'DELETE' });
  if (res.status === 401) { location.href = 'adminlogin.html'; return; }
  await load();
}

async function logout() {
  await fetch('api/auth/logout', { method: 'POST' });
  location.href = 'adminlogin.html';
}

function formatDate(ms) {
  return new Date(ms).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

window.editArticle = openEditor;
window.deleteArticle = deleteArticle;

load();
