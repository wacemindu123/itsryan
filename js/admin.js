/* =============================================
   ADMIN JAVASCRIPT - Free Tech for Small Businesses
   ============================================= */

// =============================================
// UTILITY FUNCTIONS
// =============================================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// =============================================
// SUBMISSIONS MANAGEMENT
// =============================================

async function loadSubmissions() {
  const container = document.getElementById('table-container');
  container.innerHTML = '<div class="loading">Loading submissions...</div>';

  try {
    const response = await fetch('/api/submissions');
    if (!response.ok) throw new Error('Failed to fetch');
    
    const submissions = await response.json();
    
    // Update stats
    document.getElementById('total-submissions').textContent = submissions.length;
    
    // Calculate today's submissions
    const today = new Date().toDateString();
    const todayCount = submissions.filter(sub => 
      new Date(sub.created_at).toDateString() === today
    ).length;
    document.getElementById('today-submissions').textContent = todayCount;
    
    // Calculate this week's submissions
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCount = submissions.filter(sub => 
      new Date(sub.created_at) >= weekAgo
    ).length;
    document.getElementById('this-week').textContent = weekCount;

    // Build table
    if (submissions.length === 0) {
      container.innerHTML = '<div class="loading">No submissions yet</div>';
      return;
    }

    // Desktop table
    const table = `
      <table>
        <thead>
          <tr>
            <th class="checkbox-cell">✓</th>
            <th>Date</th>
            <th>Name</th>
            <th>Email</th>
            <th>Business</th>
            <th>Scaling Challenge</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${submissions.map(sub => `
            <tr class="${sub.contacted ? 'contacted-row' : ''}">
              <td class="checkbox-cell">
                <input type="checkbox" class="contact-checkbox" 
                  ${sub.contacted ? 'checked' : ''} 
                  onchange="updateContactStatus(${sub.id}, this.checked, 'submissions')"
                  title="Mark as contacted">
              </td>
              <td class="date">${new Date(sub.created_at).toLocaleString()}</td>
              <td>${escapeHtml(sub.name)}</td>
              <td>${escapeHtml(sub.email)}</td>
              <td>${escapeHtml(sub.business)}</td>
              <td class="challenge-text">${escapeHtml(sub.scaling_challenge)}</td>
              <td>
                <button class="send-btn" onclick="sendCalendly('${escapeHtml(sub.email)}', '${escapeHtml(sub.name)}', ${sub.id}, this)">
                  Send Calendly
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Mobile cards
    const mobileCards = `
      <div class="mobile-cards">
        ${submissions.map(sub => `
          <div class="mobile-card ${sub.contacted ? 'contacted-row' : ''}">
            <div class="mobile-card-header">
              <span class="mobile-card-name">
                <input type="checkbox" class="contact-checkbox" 
                  ${sub.contacted ? 'checked' : ''} 
                  onchange="updateContactStatus(${sub.id}, this.checked, 'submissions')"
                  style="margin-right: 8px;">
                ${escapeHtml(sub.name)}
              </span>
              <span class="mobile-card-date">${new Date(sub.created_at).toLocaleDateString()}</span>
            </div>
            <div class="mobile-card-row">
              <span class="mobile-card-label">Email</span>
              <span class="mobile-card-value">${escapeHtml(sub.email)}</span>
            </div>
            <div class="mobile-card-row">
              <span class="mobile-card-label">Business</span>
              <span class="mobile-card-value">${escapeHtml(sub.business)}</span>
            </div>
            <div class="mobile-card-row">
              <span class="mobile-card-label">Challenge</span>
              <span class="mobile-card-value">${escapeHtml(sub.scaling_challenge)}</span>
            </div>
            <div class="mobile-card-actions">
              <button class="send-btn" onclick="sendCalendly('${escapeHtml(sub.email)}', '${escapeHtml(sub.name)}', ${sub.id}, this)">
                Send Calendly Link
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = table + mobileCards;
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<div class="error">Failed to load submissions. Check console for details.</div>';
  }
}

// =============================================
// SEND CALENDLY EMAIL
// =============================================

async function sendCalendly(email, name, submissionId, button) {
  button.disabled = true;
  button.textContent = 'Sending...';
  
  try {
    const response = await fetch('/api/send-calendly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name })
    });
    
    if (response.ok) {
      button.textContent = 'Sent ✓';
      button.style.background = '#34c759';
      // Auto-check the contacted checkbox
      await updateContactStatus(submissionId, true, 'submissions');
      // Reload to reflect the change
      setTimeout(() => loadSubmissions(), 1000);
    } else {
      throw new Error('Failed to send');
    }
  } catch (error) {
    console.error('Error:', error);
    button.textContent = 'Failed';
    button.style.background = '#ff3b30';
    setTimeout(() => {
      button.textContent = 'Send Calendly';
      button.style.background = '';
      button.disabled = false;
    }, 2000);
  }
}

// =============================================
// UPDATE CONTACT STATUS
// =============================================

async function updateContactStatus(id, contacted, table) {
  try {
    const response = await fetch('/api/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, contacted, table })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update status');
    }
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Failed to update contact status');
  }
}

// =============================================
// CLASS SIGNUPS MANAGEMENT
// =============================================

async function loadClassSignups() {
  const container = document.getElementById('class-table-container');
  container.innerHTML = '<div class="loading">Loading class signups...</div>';

  try {
    const response = await fetch('/api/class-signups');
    if (!response.ok) throw new Error('Failed to fetch');
    
    const signups = await response.json();
    
    // Update stats
    document.getElementById('total-class-signups').textContent = signups.length;
    
    const inPersonCount = signups.filter(s => s.format === 'in-person').length;
    const virtualCount = signups.filter(s => s.format === 'virtual').length;
    document.getElementById('in-person-count').textContent = inPersonCount;
    document.getElementById('virtual-count').textContent = virtualCount;

    // Build table
    if (signups.length === 0) {
      container.innerHTML = '<div class="loading">No class signups yet</div>';
      return;
    }

    // Desktop table
    const table = `
      <table>
        <thead>
          <tr>
            <th class="checkbox-cell">✓</th>
            <th>Date</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Business</th>
            <th>Format</th>
            <th>Experience</th>
          </tr>
        </thead>
        <tbody>
          ${signups.map(s => `
            <tr class="${s.contacted ? 'contacted-row' : ''}">
              <td class="checkbox-cell">
                <input type="checkbox" class="contact-checkbox" 
                  ${s.contacted ? 'checked' : ''} 
                  onchange="updateContactStatus(${s.id}, this.checked, 'class_signups')"
                  title="Mark as contacted">
              </td>
              <td class="date">${new Date(s.created_at).toLocaleString()}</td>
              <td>${escapeHtml(s.name)}</td>
              <td>${escapeHtml(s.email)}</td>
              <td>${escapeHtml(s.phone)}</td>
              <td>${escapeHtml(s.business || '-')}</td>
              <td>${escapeHtml(s.format)}</td>
              <td>${escapeHtml(s.experience)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Mobile cards
    const mobileCards = `
      <div class="mobile-cards">
        ${signups.map(s => `
          <div class="mobile-card ${s.contacted ? 'contacted-row' : ''}">
            <div class="mobile-card-header">
              <span class="mobile-card-name">
                <input type="checkbox" class="contact-checkbox" 
                  ${s.contacted ? 'checked' : ''} 
                  onchange="updateContactStatus(${s.id}, this.checked, 'class_signups')"
                  style="margin-right: 8px;">
                ${escapeHtml(s.name)}
              </span>
              <span class="mobile-card-date">${new Date(s.created_at).toLocaleDateString()}</span>
            </div>
            <div class="mobile-card-row">
              <span class="mobile-card-label">Email</span>
              <span class="mobile-card-value">${escapeHtml(s.email)}</span>
            </div>
            <div class="mobile-card-row">
              <span class="mobile-card-label">Phone</span>
              <span class="mobile-card-value">${escapeHtml(s.phone)}</span>
            </div>
            <div class="mobile-card-row">
              <span class="mobile-card-label">Business</span>
              <span class="mobile-card-value">${escapeHtml(s.business || '-')}</span>
            </div>
            <div class="mobile-card-row">
              <span class="mobile-card-label">Format</span>
              <span class="mobile-card-value">${escapeHtml(s.format)}</span>
            </div>
            <div class="mobile-card-row">
              <span class="mobile-card-label">Experience</span>
              <span class="mobile-card-value">${escapeHtml(s.experience)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = table + mobileCards;
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<div class="error">Failed to load class signups.</div>';
  }
}

// =============================================
// PROMPT MANAGEMENT
// =============================================

let editingPromptId = null;

async function loadPrompts() {
  const container = document.getElementById('promptsList');
  container.innerHTML = '<div class="loading">Loading prompts...</div>';

  try {
    const response = await fetch('/api/prompts');
    if (!response.ok) throw new Error('Failed to fetch');
    
    const prompts = await response.json();

    if (prompts.length === 0) {
      container.innerHTML = '<div class="loading">No prompts yet. Add your first prompt above!</div>';
      return;
    }

    container.innerHTML = prompts.map(prompt => `
      <div class="prompt-card-admin" data-id="${prompt.id}">
        <div class="prompt-card-info">
          <div class="prompt-card-title">
            <span>${prompt.icon || '📝'}</span>
            ${escapeHtml(prompt.title)}
          </div>
          <div class="prompt-card-desc">${escapeHtml(prompt.description)}</div>
          <div class="prompt-card-tags">
            ${(prompt.tags || []).map(tag => `<span class="prompt-tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
          <div class="prompt-preview">${escapeHtml(prompt.content.substring(0, 200))}...</div>
        </div>
        <div class="prompt-card-actions">
          <button class="btn-edit" onclick="editPrompt(${prompt.id})">Edit</button>
          <button class="btn-delete" onclick="deletePrompt(${prompt.id}, '${escapeHtml(prompt.title).replace(/'/g, "\\'")}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<div class="error">Failed to load prompts. Make sure the prompts table exists in Supabase.</div>';
  }
}

async function savePrompt() {
  const title = document.getElementById('promptTitle').value.trim();
  const icon = document.getElementById('promptIcon').value.trim() || '📝';
  const description = document.getElementById('promptDescription').value.trim();
  const tagsInput = document.getElementById('promptTags').value.trim();
  const content = document.getElementById('promptContent').value.trim();

  if (!title || !description || !content) {
    alert('Please fill in Title, Description, and Content');
    return;
  }

  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

  const promptData = { title, icon, description, tags, content };

  try {
    let response;
    if (editingPromptId) {
      // Update existing prompt
      promptData.id = editingPromptId;
      response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData)
      });
    } else {
      // Create new prompt
      response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData)
      });
    }

    if (!response.ok) throw new Error('Failed to save');

    // Reset form
    cancelEdit();
    loadPrompts();
    alert(editingPromptId ? 'Prompt updated!' : 'Prompt created!');
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to save prompt. Please try again.');
  }
}

async function editPrompt(id) {
  try {
    const response = await fetch('/api/prompts');
    if (!response.ok) throw new Error('Failed to fetch');
    
    const prompts = await response.json();
    const prompt = prompts.find(p => p.id === id);

    if (!prompt) {
      alert('Prompt not found');
      return;
    }

    // Populate form
    document.getElementById('promptId').value = prompt.id;
    document.getElementById('promptTitle').value = prompt.title;
    document.getElementById('promptIcon').value = prompt.icon || '';
    document.getElementById('promptDescription').value = prompt.description;
    document.getElementById('promptTags').value = (prompt.tags || []).join(', ');
    document.getElementById('promptContent').value = prompt.content;

    // Update UI
    editingPromptId = id;
    document.getElementById('formTitle').textContent = 'Edit Prompt';
    document.getElementById('cancelBtn').style.display = 'inline-block';

    // Scroll to form
    document.getElementById('promptForm').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to load prompt for editing');
  }
}

async function deletePrompt(id, title) {
  if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
    return;
  }

  try {
    const response = await fetch('/api/prompts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    if (!response.ok) throw new Error('Failed to delete');

    loadPrompts();
    alert('Prompt deleted!');
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to delete prompt. Please try again.');
  }
}

function cancelEdit() {
  editingPromptId = null;
  document.getElementById('promptId').value = '';
  document.getElementById('promptTitle').value = '';
  document.getElementById('promptIcon').value = '';
  document.getElementById('promptDescription').value = '';
  document.getElementById('promptTags').value = '';
  document.getElementById('promptContent').value = '';
  document.getElementById('formTitle').textContent = 'Add New Prompt';
  document.getElementById('cancelBtn').style.display = 'none';
}

// =============================================
// INITIALIZATION
// =============================================

// Load all data on page load
loadSubmissions();
loadClassSignups();
loadPrompts();

// Auto-refresh submissions every 30 seconds
setInterval(loadSubmissions, 30000);
setInterval(loadClassSignups, 30000);
