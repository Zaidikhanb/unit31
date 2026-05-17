const categoryFilter = document.getElementById('categoryFilter');
const periodFilter = document.getElementById('periodFilter');
const downloadBtn = document.getElementById('downloadBtn');
const dataContainer = document.getElementById('dataContainer');
const toast = document.getElementById('toast');

let currentData = [];

function showToast(msg, isError = false) {
  toast.textContent = msg;
  toast.style.background = isError ? '#fb7185' : '#34d399';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function getDateRange(period) {
  const now = new Date();
  const start = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  if (period === 'daily') {
    start.setHours(0,0,0,0);
  } else if (period === 'weekly') {
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0,0,0,0);
  } else if (period === 'monthly') {
    start.setDate(1);
    start.setHours(0,0,0,0);
  } else if (period === 'yearly') {
    start.setMonth(0, 1);
    start.setHours(0,0,0,0);
  } else {
    return { startDate: null, endDate: null };
  }
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

async function fetchData() {
  const category = categoryFilter.value;
  const period = periodFilter.value;
  const { startDate, endDate } = getDateRange(period);
  dataContainer.innerHTML = '<p style="color: var(--text-secondary);">Loading...</p>';
  try {
    const res = await fetch('/api/get-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, startDate, endDate }),
    });
    const data = await res.json();
    currentData = data;
    renderTable(data, category);
  } catch (e) {
    dataContainer.innerHTML = '<p style="color: var(--danger);">Error loading data</p>';
  }
}

function renderTable(data, category) {
  if (!data.length) {
    dataContainer.innerHTML = '<p style="color: var(--text-secondary);">No entries found.</p>';
    return;
  }

  let html = '<table class="data-table"><thead><tr>';
  html += '<th>Date/Time</th><th>In/Out</th>';

  if (category === 'items') {
    html += '<th>Item Type</th><th>Quantity</th><th>Person</th><th>Color</th><th>Grade</th>';
  } else if (category === 'samples') {
    html += '<th>Sample Name</th><th>Color</th><th>Person</th>';
  } else if (category === 'cleaning') {
    html += '<th>Size(Guzz)</th><th>Person</th>';
  } else if (category === 'persons') {
    html += '<th>Name</th><th>Reason</th>';
  }
  html += '<th>Actions</th></tr></thead><tbody>';

  data.forEach(entry => {
    html += '<tr>';
    html += `<td>${new Date(entry.timestamp).toLocaleString()}</td>`;
    html += `<td>${entry.inOut || '-'}</td>`;

    if (category === 'items') {
      html += `<td>${entry.itemType || ''}</td>`;
      html += `<td>${entry.quantity || '-'}</td>`;
      html += `<td>${entry.personName || '-'}</td>`;
      html += `<td>${entry.color || '-'}</td>`;
      html += `<td>${entry.gradeNumber || '-'}</td>`;
    } else if (category === 'samples') {
      html += `<td>${entry.sampleName || ''}</td><td>${entry.sampleColor || ''}</td><td>${entry.personName || ''}</td>`;
    } else if (category === 'cleaning') {
      html += `<td>${entry.sizeGuzz || ''}</td><td>${entry.personName || ''}</td>`;
    } else if (category === 'persons') {
      html += `<td>${entry.name || ''}</td><td>${entry.reason || '-'}</td>`;
    }

    html += `<td><button class="action-btn" onclick="deleteEntry('${entry.id}')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
    </button></td>`;
    html += '</tr>';
  });

  html += '</tbody></table>';
  dataContainer.innerHTML = html;
}

async function deleteEntry(id) {
  if (!confirm('Delete this entry?')) return;
  const category = categoryFilter.value;
  try {
    const res = await fetch('/api/delete-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, id }),
    });
    if (res.ok) {
      showToast('✓ Entry deleted');
      fetchData();
    } else {
      showToast('✗ Delete failed', true);
    }
  } catch (e) {
    showToast('✗ Network error', true);
  }
}

function downloadData() {
  if (!currentData.length) {
    showToast('No data to download', true);
    return;
  }
  const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${categoryFilter.value}_${periodFilter.value}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

categoryFilter.addEventListener('change', fetchData);
periodFilter.addEventListener('change', fetchData);
downloadBtn.addEventListener('click', downloadData);

fetchData();