const categorySelect = document.getElementById('categorySelect');
const dynamicForm = document.getElementById('dynamicForm');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');
const toast = document.getElementById('toast');

let selectedItemType = 'thread'; // default for items category

const itemTypes = [
  { key: 'thread', label: 'Thread' },
  { key: 'cdSequence', label: 'CD Sequence' },
  { key: 'roleFussing', label: 'Role Fussing' },
  { key: 'bobbin', label: 'Bobbin' },
  { key: 'cone', label: 'Cone' },
  { key: 'colySequence', label: 'Coly Sequence' },
];

function showToast(msg, isError = false) {
  toast.textContent = msg;
  toast.style.background = isError ? '#fb7185' : '#34d399';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function buildItemTypeSelector() {
  let html = '<div class="item-type-selector">';
  itemTypes.forEach(type => {
    html += `<button type="button" class="item-type-btn ${selectedItemType === type.key ? 'active' : ''}" data-type="${type.key}">${type.label}</button>`;
  });
  html += '</div>';
  return html;
}

function buildItemsForm() {
  let html = buildItemTypeSelector();
  // Common fields for all items
  html += `
    <div class="form-group">
      <label>In / Out</label>
      <div class="toggle-container">
        <label class="toggle-option"><input type="radio" name="inOut" value="in" checked> In</label>
        <label class="toggle-option"><input type="radio" name="inOut" value="out"> Out</label>
      </div>
    </div>
  `;

  if (selectedItemType === 'cone') {
    html += `
      <div class="form-group">
        <label>Quantity</label>
        <input type="number" id="itemQty" placeholder="Qty" required>
      </div>
      <div class="form-group">
        <label>Grade Number</label>
        <input type="text" id="itemGrade" placeholder="Grade" required>
      </div>
      <div class="form-group">
        <label>Person Name</label>
        <input type="text" id="itemPerson" placeholder="Person Name" required>
      </div>
      <div class="form-group">
        <label>Color</label>
        <input type="text" id="itemColor" placeholder="Color">
      </div>`;
  } else {
    html += `
      <div class="form-group">
        <label>Quantity</label>
        <input type="number" id="itemQty" placeholder="Qty" required>
      </div>
      <div class="form-group">
        <label>Person Name</label>
        <input type="text" id="itemPerson" placeholder="Person Name" required>
      </div>
      <div class="form-group">
        <label>Color (optional)</label>
        <input type="text" id="itemColor" placeholder="Color">
      </div>`;
  }
  return html;
}

function buildForm(category) {
  let html = '';
  if (category === 'items') {
    html = buildItemsForm();
  } else {
    // Non-items categories remain unchanged
    html = `
      <div class="form-group">
        <label>In / Out</label>
        <div class="toggle-container">
          <label class="toggle-option"><input type="radio" name="inOut" value="in" checked> In</label>
          <label class="toggle-option"><input type="radio" name="inOut" value="out"> Out</label>
        </div>
      </div>`;
    if (category === 'samples') {
      html += `
        <div class="form-group">
          <label>Sample Name</label>
          <input type="text" id="sampleName" required>
        </div>
        <div class="form-group">
          <label>Sample Color</label>
          <input type="text" id="sampleColor" required>
        </div>
        <div class="form-group">
          <label>Person Name</label>
          <input type="text" id="samplePerson" required>
        </div>`;
    } else if (category === 'cleaning') {
      html += `
        <div class="form-group">
          <label>Size in Guzz</label>
          <input type="text" id="sizeGuzz" required>
        </div>
        <div class="form-group">
          <label>Person Name</label>
          <input type="text" id="cleanPerson" required>
        </div>`;
    } else if (category === 'persons') {
      html += `
        <div class="form-group">
          <label>Absent Person Name</label>
          <input type="text" id="absentName" required>
        </div>
        <div class="form-group">
          <label>Reason (Optional)</label>
          <input type="text" id="absentReason">
        </div>`;
    }
  }
  dynamicForm.innerHTML = html;

  // Re-attach item type click handlers if on items category
  if (category === 'items') {
    document.querySelectorAll('.item-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedItemType = e.currentTarget.dataset.type;
        buildForm('items'); // rebuild form with new selection
      });
    });
  }
}

function collectEntry(category) {
  const entry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
  };

  if (category === 'items') {
    entry.inOut = document.querySelector('input[name="inOut"]:checked')?.value || 'in';
    entry.itemType = selectedItemType;
    entry.quantity = document.getElementById('itemQty')?.value || null;
    entry.personName = document.getElementById('itemPerson')?.value || null;
    entry.color = document.getElementById('itemColor')?.value || null;
    if (selectedItemType === 'cone') {
      entry.gradeNumber = document.getElementById('itemGrade')?.value || null;
    }
  } else {
    entry.inOut = document.querySelector('input[name="inOut"]:checked')?.value || 'in';
    if (category === 'samples') {
      entry.sampleName = document.getElementById('sampleName').value;
      entry.sampleColor = document.getElementById('sampleColor').value;
      entry.personName = document.getElementById('samplePerson').value;
    } else if (category === 'cleaning') {
      entry.sizeGuzz = document.getElementById('sizeGuzz').value;
      entry.personName = document.getElementById('cleanPerson').value;
    } else if (category === 'persons') {
      entry.name = document.getElementById('absentName').value;
      entry.reason = document.getElementById('absentReason').value || null;
    }
  }
  return entry;
}

saveBtn.addEventListener('click', async () => {
  const category = categorySelect.value;
  const entry = collectEntry(category);
  saveStatus.textContent = 'Saving...';
  try {
    const res = await fetch('/api/save-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, entry }),
    });
    if (res.ok) {
      showToast('✓ Entry saved successfully!');
      saveStatus.textContent = '';
      buildForm(category);
    } else {
      const err = await res.json();
      showToast('✗ ' + (err.error || 'Unknown error'), true);
      saveStatus.textContent = 'Failed to save.';
    }
  } catch (e) {
    showToast('✗ Network error', true);
    saveStatus.textContent = 'Network error.';
  }
});

categorySelect.addEventListener('change', (e) => {
  buildForm(e.target.value);
});

// Initialize with default category
buildForm('items');