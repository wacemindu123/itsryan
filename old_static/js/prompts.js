/* =============================================
   PROMPT LIBRARY - Free Tech for Small Businesses
   ============================================= */

// Prompt data fetched from API
let prompts = [];
let currentPromptId = null;

// =============================================
// LOAD PROMPTS FROM API
// =============================================

async function loadPrompts() {
  const grid = document.getElementById('promptGrid');
  if (!grid) return;
  
  grid.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Loading prompts...</div>';

  try {
    const response = await fetch('/api/prompts');
    if (!response.ok) throw new Error('Failed to fetch');
    
    prompts = await response.json();
    renderPrompts();
  } catch (error) {
    console.error('Error loading prompts:', error);
    grid.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No prompts available yet. Check back soon!</div>';
  }
}

// =============================================
// RENDER PROMPT CARDS
// =============================================

function renderPrompts() {
  const grid = document.getElementById('promptGrid');
  if (!grid) return;
  
  if (prompts.length === 0) {
    grid.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No prompts available yet. Check back soon!</div>';
    return;
  }

  grid.innerHTML = prompts.map(prompt => `
    <div class="prompt-card">
      <span class="prompt-card-icon">${prompt.icon || '📝'}</span>
      <h3>${escapeHtml(prompt.title)}</h3>
      <p class="prompt-card-description">${escapeHtml(prompt.description)}</p>
      <div class="prompt-card-tags">
        ${(prompt.tags || []).map(tag => `<span class="prompt-tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
      <div class="prompt-card-actions">
        <button class="prompt-btn prompt-btn-copy" onclick="copyPrompt(${prompt.id}, event)">Copy</button>
        <button class="prompt-btn prompt-btn-view" onclick="viewPrompt(${prompt.id})">View Full</button>
      </div>
    </div>
  `).join('');
}

// =============================================
// COPY PROMPT TO CLIPBOARD
// =============================================

async function copyPrompt(id, event) {
  const prompt = prompts.find(p => p.id === id);
  if (!prompt) return;

  try {
    await navigator.clipboard.writeText(prompt.content);
    const btn = event.target;
    btn.textContent = 'Copied!';
    btn.classList.add('copy-success');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copy-success');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard');
  }
}

// =============================================
// VIEW FULL PROMPT IN MODAL
// =============================================

function viewPrompt(id) {
  const prompt = prompts.find(p => p.id === id);
  if (!prompt) return;

  currentPromptId = id;
  document.getElementById('promptModalTitle').textContent = prompt.title;
  document.getElementById('promptModalBody').textContent = prompt.content;
  document.getElementById('promptModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// =============================================
// CLOSE PROMPT MODAL
// =============================================

function closePromptModal() {
  document.getElementById('promptModal').style.display = 'none';
  document.body.style.overflow = '';
  currentPromptId = null;
}

// =============================================
// COPY FROM MODAL
// =============================================

async function copyPromptFromModal() {
  if (!currentPromptId) return;
  const prompt = prompts.find(p => p.id === currentPromptId);
  if (!prompt) return;

  try {
    await navigator.clipboard.writeText(prompt.content);
    const btn = document.getElementById('modalCopyBtn');
    btn.textContent = 'Copied!';
    btn.classList.add('copy-success');
    setTimeout(() => {
      btn.textContent = 'Copy to Clipboard';
      btn.classList.remove('copy-success');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard');
  }
}

// =============================================
// MODAL EVENT LISTENERS
// =============================================

// Close modal on outside click
document.addEventListener('DOMContentLoaded', function() {
  const promptModal = document.getElementById('promptModal');
  if (promptModal) {
    promptModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closePromptModal();
      }
    });
  }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closePromptModal();
  }
});

// =============================================
// UTILITY FUNCTIONS
// =============================================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
