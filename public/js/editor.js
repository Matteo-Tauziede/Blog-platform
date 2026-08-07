// public/js/editor.js
// Powers the live Markdown preview on the new/edit post forms.
// Relies on the `marked` library being loaded from a CDN in the page.

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('content');
  const preview = document.getElementById('markdown-preview');
  const tabWriteBtn = document.getElementById('tab-write');
  const tabPreviewBtn = document.getElementById('tab-preview');
  const writePane = document.getElementById('write-pane');
  const previewPane = document.getElementById('preview-pane');

  if (!textarea || !preview) return;

  function renderPreview() {
    if (typeof marked === 'undefined') {
      preview.textContent = textarea.value;
      return;
    }
    preview.innerHTML = marked.parse(textarea.value || '*Nothing to preview yet…*');
  }

  textarea.addEventListener('input', renderPreview);
  renderPreview();

  // Simple Write/Preview tab toggle for smaller screens.
  if (tabWriteBtn && tabPreviewBtn) {
    tabWriteBtn.addEventListener('click', () => {
      writePane.classList.remove('hidden');
      previewPane.classList.add('hidden');
      tabWriteBtn.classList.add('tab-active');
      tabPreviewBtn.classList.remove('tab-active');
    });
    tabPreviewBtn.addEventListener('click', () => {
      renderPreview();
      previewPane.classList.remove('hidden');
      writePane.classList.add('hidden');
      tabPreviewBtn.classList.add('tab-active');
      tabWriteBtn.classList.remove('tab-active');
    });
  }
});

// Confirm before deleting posts or comments.
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (form.matches('[data-confirm]')) {
    const msg = form.getAttribute('data-confirm') || 'Are you sure?';
    if (!confirm(msg)) {
      e.preventDefault();
    }
  }
});
