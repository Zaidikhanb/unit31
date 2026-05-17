const categorySelect = document.getElementById('categorySelect');
const dynamicForm = document.getElementById('dynamicForm');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');
const toast = document.getElementById('toast');

function showToast(msg, isError = false) {
  toast.textContent = msg;
  toast.style.background = isError ? '#ff416c' : '#00c853';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Build form based on category
function buildForm(category) {
  let html = '';
  // Common In/Out toggle
  const inOutHTML = `
    <div class="form-group">
      <label>In / Out</label>
      <div class="toggle-container">
        <label class="toggle-option"><input type="radio" name="inOut" value="in" checked> In</label>
        <label class="toggle-option"><input type="radio" name="inOut" value="out"> Out</label>
      </div>
    </div>`;

  if (category === 'items') {
    html = inOutHTML + `
      <div class="grid-2col">
        <div class="form-group">
          <label>Thread Ask Quantity</label>
          <input type="number" id="threadQty" placeholder="Qty">
          <input type="text" id="threadPerson" placeholder="Person Name">
          <input type="text" id="threadColor" placeholder="Color (optional)">
        </div>
        <div class="form-group">
          <label>CD Sequence</label>
          <input type="number" id="cdQty" placeholder="Qty">
          <input type="text" id="cdPerson" placeholder="Person Name">
          <input type="text" id="cdColor" placeholder="Color (optional)">
        </div>
        <div class="form-group">
          <label>Role Fussing</label>
          <input type="number" id="roleQty" placeholder="Qty">
          <input type="text" id="rolePerson" placeholder="Person Name">
          <input type="text" id="roleColor" placeholder="Color (optional)">
        </div>
        <div class="form-group">
          <label>Bobbin</label>
          <input type="number" id="bobbinQty" placeholder="Qty">
          <input type="text" id="bobbinPerson" placeholder="Person Name">
          <input type="text" id="bobbinColor" placeholder="Color">
        </div>
        <div class="form-group">
          <label>Cone (Optional)</label>
          <input type="number" id="coneQty" placeholder="Quantity">
          <input type="text" id="coneGrade" placeholder="Grade Number">
          <input type="text" id="conePerson" placeholder="Person Name">
          <input type="text" id="coneColor" placeholder="Color">
        </div>
        <div class="form-group">
          <label>Coly Sequence</label>
          <input type="number" id="colyQty" placeholder="Qty">
          <input type="text" id="colyPerson" placeholder="Person Name">
          <input type="text" id="colyColor" placeholder="Color">
        </div>
      </div>`;
  } else if (category === 'samples') {
    html = inOutHTML + `
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
    html = inOutHTML + `
      <div class="form-group">
        <label>Size (Guzz)</label>
        <input type="text" id="sizeGuzz" required>
      </div>
      <div class="form-group">
        <label>Person Name</label>
        <input type="text" id="cleanPerson" required>
      </div>`;
  } else if (category === 'persons') {
    html = inOutHTML + `
      <div class="form-group">
        <label>Absent Person Name</label>
        <input type="text" id="absentName" required>
      </div>
      <div class="form-group">
        <label>Reason (Optional)</label>
        <input type="text" id="absentReason">
      </div>`;
  }
  dynamicForm.innerHTML = html;
}

// Collect data from form
function collectEntry(category) {
  const inOut = document.querySelector('input[name="inOut"]:checked')?.value || 'in';
  const entry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    inOut,
  };

  if (category === 'items') {
    entry.thread = {
      quantity: document.getElementById('threadQty')?.value || null,
      personName: document.getElementById('threadPerson')?.value || null,
      color: document.getElementById('threadColor')?.value || null,
    };
    // similar for others (simplified for brevity; full code will contain all)
    // In production, include all sub-objects:
    entry.cdSequence = { quantity: document.getElementById('cdQty')?.value, personName: document.getElementById('cdPerson')?.value, color: document.getElementById('cdColor')?.value };
    entry.roleFussing = { quantity: document.getElementById('roleQty')?.value, personName: document.getElementById('rolePerson')?.value, color: document.getElementById('roleColor')?.value };
    entry.bobbin = { quantity: document.getElementById('bobbinQty')?.value, personName: document.getElementById('bobbinPerson')?.value, color: document.getElementById('bobbinColor')?.value };
    entry.cone = { quantity: document.getElementById('coneQty')?.value, gradeNumber: document.getElementById('coneGrade')?.value, personName: document.getElementById('conePerson')?.value, color: document.getElementById('coneColor')?.value };
    entry.colySequence = { quantity: document.getElementById('colyQty')?.value, personName: document.getElementById('colyPerson')?.value, color: document.getElementById('colyColor')?.value };
  } else if (category === 'samples') {
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
  return entry;
}

// Save handler
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
      showToast('Entry saved successfully!');
      saveStatus.textContent = '';
      // reset form
      buildForm(category);
    } else {
      const err = await res.json();
      showToast('Error: ' + (err.error || 'Unknown'), true);
      saveStatus.textContent = 'Failed to save.';
    }
  } catch (e) {
    showToast('Network error', true);
  }
});

// Initialize
categorySelect.addEventListener('change', (e) => buildForm(e.target.value));
buildForm(categorySelect.value);