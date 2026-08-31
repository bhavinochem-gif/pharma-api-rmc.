// State Management
let priceMaster = {};
let stageCount = 0;

// Internal common solvent density database (g/mL)
const SOLVENT_DENSITIES = {
  "water": 1.000,
  "methanol": 0.792,
  "ethanol": 0.789,
  "isopropanol": 0.786,
  "ipa": 0.786,
  "acetone": 0.784,
  "dichloromethane": 1.326,
  "dcm": 1.326,
  "mdc": 1.326,
  "toluene": 0.867,
  "ethyl acetate": 0.902,
  "ea": 0.902,
  "etac": 0.902,
  "tetrahydrofuran": 0.886,
  "thf": 0.886,
  "acetonitrile": 0.786,
  "acn": 0.786,
  "n,n-dimethylformamide": 0.944,
  "dmf": 0.944,
  "dimethyl sulfoxide": 1.100,
  "dmso": 1.100,
  "hexane": 0.655,
  "n-hexane": 0.655,
  "heptane": 0.684,
  "n-heptane": 0.684,
  "pyridine": 0.982,
  "triethylamine": 0.726,
  "tea": 0.726,
  "acetic acid": 1.049,
  "diethyl ether": 0.713,
  "ether": 0.713,
  "chloroform": 1.489
};

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", () => {
  addNewStage("Stage-1: Key Intermediate Synthesis");
  setupEventListeners();
  refreshIcons();
});

function setupEventListeners() {
  document.getElementById("btnAddStage").addEventListener("click", () => {
    addNewStage(`Stage-${stageCount + 1}`);
  });
  document.getElementById("apiBatchSize").addEventListener("input", recalculateAll);
  document.getElementById("priceMasterFile").addEventListener("change", handleExcelUpload);
  document.getElementById("btnExport").addEventListener("click", exportToExcel);
}

// Upload & Parse Excel Master (No SAP Code)
function handleExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const dataList = document.getElementById("rmMasterList");
    dataList.innerHTML = "";
    priceMaster = {};

    jsonData.forEach((row) => {
      const name = (row["Name of Raw Material"] || row["Name"] || row["RM Name"] || row["Material"] || "").toString().trim();
      const cas = (row["CAS No"] || row["CAS No."] || row["CAS"] || "").toString().trim();
      const mw = parseFloat(row["Molecular Weight"] || row["MW"] || 0);
      const density = parseFloat(row["Density"] || 0);
      const rate = parseFloat(row["Rate/Kg"] || row["Rate"] || row["Price"] || 0);

      if (name) {
        priceMaster[name.toLowerCase()] = { name, cas, mw, density, rate };
        const option = document.createElement("option");
        option.value = name;
        dataList.appendChild(option);
      }
    });

    document.getElementById("uploadLabel").innerText = `Loaded (${jsonData.length} items)`;
    alert(`Loaded ${jsonData.length} Raw Materials from Excel.`);
  };
  reader.readAsArrayBuffer(file);
}

// Add New Reaction Stage Card
function addNewStage(defaultStageName) {
  stageCount++;
  const stageId = `stage_${Date.now()}_${stageCount}`;
  const container = document.getElementById("stagesContainer");

  const stageCard = document.createElement("div");
  stageCard.className = "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden stage-card";
  stageCard.id = stageId;

  stageCard.innerHTML = `
    <div class="bg-slate-100 px-4 py-3 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
      <div class="flex items-center space-x-2 flex-grow max-w-md">
        <span class="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded stage-badge">Stage</span>
        <input 
          type="text" 
          value="${defaultStageName}" 
          class="stage-name-input bg-white font-semibold text-slate-700 text-sm border border-slate-300 rounded px-2 py-1 w-full focus:ring-1 focus:ring-indigo-500 outline-none" 
          placeholder="Enter Stage Name..."
          oninput="handleStageNameChange()"
        />
      </div>
      <div class="flex items-center space-x-2">
        <button onclick="addMaterialRow('${stageId}')" class="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition">
          <i data-lucide="plus" class="w-3.5 h-3.5 mr-1"></i> Add Material
        </button>
        <button onclick="removeStage('${stageId}')" class="text-rose-500 hover:text-rose-700 p-1.5 rounded transition">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>

    <div class="table-scroll">
      <table class="rmc-table" id="table_${stageId}">
        <thead>
          <tr>
            <th>Sr.</th>
            <th>CAS No.</th>
            <th style="min-width: 170px;">Name of Raw Material</th>
            <th>Density<br/>(g/mL)</th>
            <th>Ratio Type</th>
            <th>Mole / Vol<br/>Ratio</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>MW<br/>(g/mol)</th>
            <th>Moles</th>
            <th>Qty/Kg API</th>
            <th>% Solvent<br/>Rec.</th>
            <th>Qty/Kg API<br/>(with Rec.)</th>
            <th>Rate<br/>(₹/Unit)</th>
            <th>Cost<br/>(w/o Rec.)</th>
            <th>Cost<br/>(with Rec.)</th>
            <th>% Cont.<br/>(w/o Rec.)</th>
            <th>% Cont.<br/>(with Rec.)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200"></tbody>
      </table>
    </div>

    <div class="bg-slate-100/90 px-4 py-2.5 border-t border-b border-slate-200 flex flex-wrap justify-between items-center text-xs">
      <span class="font-bold text-slate-700 uppercase tracking-wide flex items-center">
        <i data-lucide="calculator" class="w-3.5 h-3.5 mr-1 text-indigo-600"></i> Stage Cost Subtotals
      </span>
      <div class="flex items-center space-x-6">
        <div>
          <span class="text-slate-500 font-medium">Stage Cost (w/o Rec.):</span>
          <span class="stage-subtotal-wo-rec font-bold text-slate-800 ml-1">₹ 0.00</span>
          <span class="text-[10px] text-slate-400">/kg API</span>
        </div>
        <div>
          <span class="text-emerald-700 font-medium">Stage Cost (with Rec.):</span>
          <span class="stage-subtotal-w-rec font-bold text-emerald-700 ml-1">₹ 0.00</span>
          <span class="text-[10px] text-emerald-600">/kg API</span>
        </div>
        <div>
          <span class="text-indigo-700 font-medium">Stage Cost Contribution:</span>
          <span class="stage-subtotal-cont-rec font-bold text-indigo-800 ml-1">0.00%</span>
        </div>
      </div>
    </div>

    <div class="bg-slate-50/80 p-4 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
        <div class="md:col-span-2">
          <label class="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">Isolated Product / Intermediate Name</label>
          <input type="text" class="stage-prod-name w-full border rounded px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white" value="Intermediate Output" oninput="handleStageNameChange()" />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">Product MW (g/mol)</label>
          <div class="flex items-center space-x-1">
            <input type="number" step="any" class="stage-prod-mw w-full border rounded px-2 py-1 text-xs font-semibold text-slate-700 bg-white text-right" value="0" oninput="recalculateAll()" />
            <button type="button" title="Auto-fetch Product MW online" onclick="fetchProductMWOnline(this)" class="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">Actual Output (kg)</label>
          <input type="number" step="any" class="stage-actual-qty w-full border rounded px-2 py-1 text-xs font-bold text-indigo-700 bg-white text-right" value="80.00" oninput="recalculateAll()" />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-500 uppercase mb-0.5">Theor. Output (kg)</label>
          <div class="stage-theor-qty text-xs font-bold text-slate-700 py-1 px-2 bg-slate-100 border border-slate-200 rounded text-right">0.00 kg</div>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-500 uppercase mb-0.5">% Molar Yield</label>
          <div class="stage-molar-yield-container">
            <span class="stage-molar-yield yield-badge yield-med">0.00%</span>
          </div>
        </div>
      </div>

      <div class="pt-2 border-t border-slate-200/60 flex flex-wrap justify-between items-center text-xs text-slate-600 gap-3">
        <div class="flex items-center space-x-4">
          <span><strong>Total Mass In:</strong> <span class="stage-mass-in font-bold text-slate-800">0.00 kg</span></span>
          <span><strong>Recovered Solvents:</strong> <span class="stage-mass-rec font-bold text-emerald-700">0.00 kg</span></span>
          <span><strong>Unaccounted Loss:</strong> <span class="stage-mass-loss font-bold text-rose-600">0.00 kg</span></span>
        </div>
        <div class="flex items-center space-x-4">
          <span><strong>% w/w Yield:</strong> <span class="stage-ww-yield font-bold text-indigo-700">0.00%</span></span>
          <span><strong>Stage PMI:</strong> <span class="stage-pmi font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">0.00</span> kg/kg</span>
        </div>
      </div>
    </div>
  `;

  container.appendChild(stageCard);
  addMaterialRow(stageId); // Add Sr. No. 1 reference row
  updateStageNumbersAndCascade();
  refreshIcons();
}

function removeStage(stageId) {
  const stage = document.getElementById(stageId);
  if (stage) {
    stage.remove();
    updateStageNumbersAndCascade();
    recalculateAll();
  }
}

// Stage numbering and automatic previous intermediate cascade
function updateStageNumbersAndCascade() {
  const stageCards = document.querySelectorAll(".stage-card");
  stageCards.forEach((card, index) => {
    const stageNum = index + 1;
    card.querySelector(".stage-badge").innerText = `Stage ${stageNum}`;

    const firstRow = card.querySelector("tbody tr:first-child");
    if (firstRow) {
      const rmInput = firstRow.querySelector(".rm-name");
      const mwInput = firstRow.querySelector(".mw");
      const qtyInput = firstRow.querySelector(".qty");

      if (index === 0) {
        if (rmInput.dataset.autolinked === "true") {
          rmInput.value = "";
          rmInput.dataset.autolinked = "false";
          rmInput.readOnly = false;
        }
      } else {
        const prevCard = stageCards[index - 1];
        const prevProdName = prevCard.querySelector(".stage-prod-name").value.trim() || `Intermediate Stage-${index}`;
        const prevProdMW = parseFloat(prevCard.querySelector(".stage-prod-mw").value) || 0;
        const prevActualQty = parseFloat(prevCard.querySelector(".stage-actual-qty").value) || 0;

        rmInput.value = prevProdName;
        rmInput.dataset.autolinked = "true";
        if (prevProdMW > 0) mwInput.value = prevProdMW;
        if (prevActualQty > 0) qtyInput.value = prevActualQty;
      }
    }
  });
}

function handleStageNameChange() {
  updateStageNumbersAndCascade();
  recalculateAll();
}

// Add Raw Material Row (No SAP Code)
function addMaterialRow(stageId) {
  const tbody = document.querySelector(`#table_${stageId} tbody`);
  const rowCount = tbody.children.length + 1;
  const isFirstRow = rowCount === 1;
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="text-center font-bold text-slate-500 sr-no">${rowCount}</td>
    <td><input type="text" class="cas-no w-24" placeholder="CAS No." /></td>
    <td>
      <div class="flex items-center space-x-1">
        <input 
          type="text" 
          list="rmMasterList" 
          class="rm-name w-40 font-medium" 
          placeholder="Select/Enter RM" 
          onchange="autoFillRM(this)" 
        />
        <button 
          type="button" 
          title="Auto-fetch CAS, MW & Density online" 
          onclick="fetchOnlineChemData(this, this.previousElementSibling)" 
          class="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition"
        >
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </td>
    <td><input type="number" step="any" class="density w-16 text-right" value="1.0" oninput="recalculateAll()" /></td>
    <td>
      <select class="ratio-type text-xs" onchange="recalculateAll()">
        <option value="mole">Mole Ratio</option>
        <option value="volume">Vol Ratio (V/W)</option>
      </select>
    </td>
    <td>
      <input 
        type="number" 
        step="any" 
        class="mole-vol-ratio w-16 text-right ${isFirstRow ? 'bg-slate-100 font-bold text-slate-600' : ''}" 
        value="1.00" 
        ${isFirstRow ? 'readonly title="Fixed at 1.00 (Reference Substrate)"' : ''} 
        oninput="recalculateAll()" 
      />
    </td>
    <td>
      <input 
        type="number" 
        step="any" 
        class="qty w-20 text-right font-medium ${!isFirstRow ? 'calc-highlight' : ''}" 
        value="${isFirstRow ? '100' : '0'}" 
        oninput="recalculateAll()" 
      />
    </td>
    <td>
      <select class="unit-select text-xs font-semibold" onchange="recalculateAll()">
        <option value="kg" selected>Kg</option>
        <option value="L">L</option>
        <option value="g">g</option>
      </select>
    </td>
    <td><input type="number" step="any" class="mw w-16 text-right" value="0" oninput="recalculateAll()" /></td>
    <td class="read-only-cell moles">0.00</td>
    <td class="read-only-cell qty-per-kg">0.0000</td>
    <td><input type="number" step="any" class="rec-percent w-14 text-right" value="0" min="0" max="100" oninput="recalculateAll()" /></td>
    <td class="read-only-cell qty-per-kg-rec">0.0000</td>
    <td><input type="number" step="any" class="rate w-16 text-right font-medium" value="0" oninput="recalculateAll()" /></td>
    <td class="read-only-cell cost-wo-rec">0.00</td>
    <td class="read-only-cell cost-w-rec">0.00</td>
    <td class="read-only-cell cont-wo-rec">0.00%</td>
    <td class="read-only-cell cont-w-rec">0.00%</td>
    <td class="text-center">
      ${isFirstRow ? '<span class="text-xs text-slate-300">Ref</span>' : '<button onclick="removeRow(this)" class="text-slate-400 hover:text-rose-600 transition"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>'}
    </td>
  `;

  tbody.appendChild(row);
  updateStageNumbersAndCascade();
  recalculateAll();
  refreshIcons();
}

function removeRow(btn) {
  const row = btn.closest("tr");
  const tbody = row.closest("tbody");
  row.remove();

  Array.from(tbody.querySelectorAll(".sr-no")).forEach((td, index) => {
    td.innerText = index + 1;
  });
  recalculateAll();
}

// Auto-fill RM from local Excel Master
function autoFillRM(input) {
  const row = input.closest("tr");
  const val = input.value.trim().toLowerCase();

  // 1. Check Excel Master
  if (priceMaster[val]) {
    const item = priceMaster[val];
    row.querySelector(".cas-no").value = item.cas || "";
    row.querySelector(".mw").value = item.mw || 0;
    if (item.density > 0) row.querySelector(".density").value = item.density;
    row.querySelector(".rate").value = item.rate || 0;
  }

  // 2. Check internal solvent density database
  if (SOLVENT_DENSITIES[val]) {
    row.querySelector(".density").value = SOLVENT_DENSITIES[val];
    row.querySelector(".ratio-type").value = "volume";
    row.querySelector(".unit-select").value = "L";
  }

  recalculateAll();
}

// Auto Fetch Product MW online via PubChem
async function fetchProductMWOnline(btn) {
  const card = btn.closest(".stage-card");
  const prodName = card.querySelector(".stage-prod-name").value.trim();
  if (!prodName) {
    alert("Please enter product/intermediate name first.");
    return;
  }

  const originalIcon = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-indigo-600"></i>`;
  refreshIcons();

  try {
    const encodedName = encodeURIComponent(prodName);
    const propRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodedName}/property/MolecularWeight/JSON`);
    if (propRes.ok) {
      const propData = await propRes.json();
      const mw = propData?.PropertyTable?.Properties?.[0]?.MolecularWeight || 0;
      if (mw > 0) {
        card.querySelector(".stage-prod-mw").value = parseFloat(mw).toFixed(2);
        recalculateAll();
      }
    } else {
      alert(`No online record found for "${prodName}".`);
    }
  } catch (err) {
    console.error("PubChem Error:", err);
  } finally {
    btn.innerHTML = originalIcon;
    refreshIcons();
  }
}

// Auto Fetch CAS, MW and Density online via PubChem REST API
async function fetchOnlineChemData(btn, inputElement) {
  const row = inputElement.closest("tr");
  const rmName = inputElement.value.trim();

  if (!rmName) {
    alert("Please enter a Raw Material name first.");
    return;
  }

  const originalIcon = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-indigo-600"></i>`;
  refreshIcons();

  try {
    const encodedName = encodeURIComponent(rmName);

    // Fetch Synonyms for CAS No
    const synRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodedName}/synonyms/JSON`);
    let casNo = "";
    if (synRes.ok) {
      const synData = await synRes.json();
      const synonyms = synData?.InformationList?.Information?.[0]?.Synonym || [];
      const casRegex = /^[1-9]\d{1,6}-\d{2}-\d$/;
      const match = synonyms.find((item) => casRegex.test(item.trim()));
      if (match) casNo = match.trim();
    }

    // Fetch Molecular Weight
    const propRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodedName}/property/MolecularWeight/JSON`);
    let mw = 0;
    if (propRes.ok) {
      const propData = await propRes.json();
      mw = propData?.PropertyTable?.Properties?.[0]?.MolecularWeight || 0;
    }

    // Check Local density library
    let density = SOLVENT_DENSITIES[rmName.toLowerCase()] || 0;

    if (casNo) row.querySelector(".cas-no").value = casNo;
    if (mw > 0) row.querySelector(".mw").value = parseFloat(mw).toFixed(2);
    if (density > 0) {
      row.querySelector(".density").value = density;
      row.querySelector(".ratio-type").value = "volume";
      row.querySelector(".unit-select").value = "L";
    }

    if (!casNo && mw === 0 && density === 0) {
      alert(`No online record found for "${rmName}". Enter details manually.`);
    } else {
      recalculateAll();
    }
  } catch (err) {
    console.error("PubChem API Error:", err);
    alert("Failed to fetch online details. Please enter manually.");
  } finally {
    btn.innerHTML = originalIcon;
    refreshIcons();
  }
}

// Master Process Chemistry, Yield, Subtotals & Stoichiometry Engine
function recalculateAll() {
  const apiBatchSize = parseFloat(document.getElementById("apiBatchSize").value) || 1;
  const stageCards = document.querySelectorAll(".stage-card");

  let grandTotalCostWithoutRec = 0;
  let grandTotalCostWithRec = 0;
  let globalTotalInputMassKg = 0;

  stageCards.forEach((stageCard) => {
    const rows = Array.from(stageCard.querySelectorAll("tbody tr"));
    if (rows.length === 0) return;

    // 1. Process Reference Material (Sr. No. 1)
    const refRow = rows[0];
    const refQtyInput = parseFloat(refRow.querySelector(".qty").value) || 0;
    const refUnit = refRow.querySelector(".unit-select").value;
    const refDensity = parseFloat(refRow.querySelector(".density").value) || 1.0;
    const refMw = parseFloat(refRow.querySelector(".mw").value) || 0;

    // Convert Sr. No. 1 Qty to mass in Kg
    let refQtyInKg = refQtyInput;
    if (refUnit === "L") refQtyInKg = refQtyInput * refDensity;
    else if (refUnit === "g") refQtyInKg = refQtyInput / 1000;

    // Sr. No. 1 Moles and Self Mole Ratio (Moles/Moles = 1.00)
    const refMoles = refMw > 0 ? (refQtyInKg * 1000) / refMw : 0;
    refRow.querySelector(".moles").innerText = refMoles.toFixed(2);
    refRow.querySelector(".mole-vol-ratio").value = "1.00";

    let stageTotalMassInKg = 0;
    let stageTotalRecoveredKg = 0;
    let stageSubtotalWoRec = 0;
    let stageSubtotalWRec = 0;

    // 2. Compute Sr. No. 2 onwards based on selected Ratio Type
    rows.forEach((row, index) => {
      const isFirst = index === 0;
      const unit = row.querySelector(".unit-select").value;
      const density = parseFloat(row.querySelector(".density").value) || 1.0;
      const mw = parseFloat(row.querySelector(".mw").value) || 0;
      const ratioType = row.querySelector(".ratio-type").value;
      const ratioVal = parseFloat(row.querySelector(".mole-vol-ratio").value) || 0;
      const recPercent = parseFloat(row.querySelector(".rec-percent").value) || 0;
      const rate = parseFloat(row.querySelector(".rate").value) || 0;

      let qty = parseFloat(row.querySelector(".qty").value) || 0;

      if (!isFirst) {
        if (ratioType === "mole") {
          // Stoichiometric Calculation: Moles = Ref Moles * Mole Ratio
          const targetMoles = refMoles * ratioVal;
          const targetMassKg = mw > 0 ? (targetMoles * mw) / 1000 : 0;

          if (unit === "kg") qty = targetMassKg;
          else if (unit === "L") qty = density > 0 ? targetMassKg / density : targetMassKg;
          else if (unit === "g") qty = targetMassKg * 1000;
        } else if (ratioType === "volume") {
          // Volume (V/W) Ratio: Liters = Ref Starting Mass (kg) * Vol Ratio
          const targetVolLiters = refQtyInKg * ratioVal;

          if (unit === "L") qty = targetVolLiters;
          else if (unit === "kg") qty = targetVolLiters * density;
          else if (unit === "g") qty = targetVolLiters * density * 1000;
        }
        row.querySelector(".qty").value = qty.toFixed(3);
      }

      // Convert current row quantity to effective mass (kg)
      let rowQtyKg = qty;
      if (unit === "L") rowQtyKg = qty * density;
      else if (unit === "g") rowQtyKg = qty / 1000;

      stageTotalMassInKg += rowQtyKg;
      stageTotalRecoveredKg += rowQtyKg * (recPercent / 100);

      // Row Moles
      const rowMoles = mw > 0 ? (rowQtyKg * 1000) / mw : 0;
      row.querySelector(".moles").innerText = rowMoles.toFixed(2);

      // Quantities per Kg of Finished API
      const qtyPerKg = rowQtyKg / apiBatchSize;
      const qtyPerKgRec = qtyPerKg * (1 - recPercent / 100);

      // Costs
      const costWithoutRec = (qty / apiBatchSize) * rate;
      const costWithRec = costWithoutRec * (1 - recPercent / 100);

      row.querySelector(".qty-per-kg").innerText = qtyPerKg.toFixed(4);
      row.querySelector(".qty-per-kg-rec").innerText = qtyPerKgRec.toFixed(4);
      row.querySelector(".cost-wo-rec").innerText = costWithoutRec.toFixed(2);
      row.querySelector(".cost-w-rec").innerText = costWithRec.toFixed(2);

      stageSubtotalWoRec += costWithoutRec;
      stageSubtotalWRec += costWithRec;
      grandTotalCostWithoutRec += costWithoutRec;
      grandTotalCostWithRec += costWithRec;
    });

    globalTotalInputMassKg += stageTotalMassInKg;

    // Update Stage Cost Subtotals
    stageCard.querySelector(".stage-subtotal-wo-rec").innerText = `₹ ${stageSubtotalWoRec.toFixed(2)}`;
    stageCard.querySelector(".stage-subtotal-w-rec").innerText = `₹ ${stageSubtotalWRec.toFixed(2)}`;

    // 3. Stage-Wise Yield & Mass Balance Calculations
    const prodMW = parseFloat(stageCard.querySelector(".stage-prod-mw").value) || 0;
    const actualOutKg = parseFloat(stageCard.querySelector(".stage-actual-qty").value) || 0;

    // Theoretical Yield (kg) = (Ref Moles * Product MW) / 1000
    const theorOutKg = (refMoles > 0 && prodMW > 0) ? (refMoles * prodMW) / 1000 : 0;
    const actualMoles = (actualOutKg > 0 && prodMW > 0) ? (actualOutKg * 1000) / prodMW : 0;
    const molarYieldPct = refMoles > 0 ? (actualMoles / refMoles) * 100 : 0;
    const wwYieldPct = refQtyInKg > 0 ? (actualOutKg / refQtyInKg) * 100 : 0;
    const massLossKg = Math.max(0, stageTotalMassInKg - (actualOutKg + stageTotalRecoveredKg));
    const stagePMI = actualOutKg > 0 ? stageTotalMassInKg / actualOutKg : 0;

    // Update Stage Yield & Mass Balance UI
    stageCard.querySelector(".stage-theor-qty").innerText = `${theorOutKg.toFixed(2)} kg`;
    
    const molarYieldBadge = stageCard.querySelector(".stage-molar-yield");
    molarYieldBadge.innerText = `${molarYieldPct.toFixed(2)}%`;
    molarYieldBadge.className = `stage-molar-yield yield-badge ${molarYieldPct >= 85 ? 'yield-high' : molarYieldPct >= 70 ? 'yield-med' : 'yield-low'}`;

    stageCard.querySelector(".stage-ww-yield").innerText = `${wwYieldPct.toFixed(2)}%`;
    stageCard.querySelector(".stage-mass-in").innerText = `${stageTotalMassInKg.toFixed(2)} kg`;
    stageCard.querySelector(".stage-mass-rec").innerText = `${stageTotalRecoveredKg.toFixed(2)} kg`;
    stageCard.querySelector(".stage-mass-loss").innerText = `${massLossKg.toFixed(2)} kg`;
    stageCard.querySelector(".stage-pmi").innerText = stagePMI.toFixed(2);
  });

  // 4. Compute Percentage Cost Contributions (Row-wise and Stage-wise)
  stageCards.forEach((stageCard) => {
    let stageCostWithRecSum = 0;
    stageCard.querySelectorAll("tbody tr").forEach((row) => {
      const costWo = parseFloat(row.querySelector(".cost-wo-rec").innerText) || 0;
      const costW = parseFloat(row.querySelector(".cost-w-rec").innerText) || 0;
      stageCostWithRecSum += costW;

      const contWo = grandTotalCostWithoutRec > 0 ? (costWo / grandTotalCostWithoutRec) * 100 : 0;
      const contW = grandTotalCostWithRec > 0 ? (costW / grandTotalCostWithRec) * 100 : 0;

      row.querySelector(".cont-wo-rec").innerText = `${contWo.toFixed(2)}%`;
      row.querySelector(".cont-w-rec").innerText = `${contW.toFixed(2)}%`;
    });

    const stageContPct = grandTotalCostWithRec > 0 ? (stageCostWithRecSum / grandTotalCostWithRec) * 100 : 0;
    stageCard.querySelector(".stage-subtotal-cont-rec").innerText = `${stageContPct.toFixed(2)}%`;
  });

  // 5. Update Global Summary Dashboard
  const totalSavings = grandTotalCostWithoutRec - grandTotalCostWithRec;
  const savingsPct = grandTotalCostWithoutRec > 0 ? (totalSavings / grandTotalCostWithoutRec) * 100 : 0;
  const cumulativePMI = apiBatchSize > 0 ? globalTotalInputMassKg / apiBatchSize : 0;

  document.getElementById("totalCostWithoutRec").innerText = `₹ ${grandTotalCostWithoutRec.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("totalCostWithRec").innerText = `₹ ${grandTotalCostWithRec.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("totalSavings").innerText = `₹ ${totalSavings.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("savingsPercentage").innerText = `${savingsPct.toFixed(2)}% total savings`;
  document.getElementById("cumulativePMI").innerText = cumulativePMI.toFixed(2);
}

// Export formatted Excel (No SAP Code)
function exportToExcel() {
  const projectName = document.getElementById("projectName").value || "Pharma_API_RMC";
  const wb = XLSX.utils.book_new();
  const exportData = [];

  document.querySelectorAll(".stage-card").forEach((stageCard) => {
    const stageName = stageCard.querySelector(".stage-name-input").value;
    const prodName = stageCard.querySelector(".stage-prod-name").value;
    const prodMw = stageCard.querySelector(".stage-prod-mw").value;
    const actualKg = stageCard.querySelector(".stage-actual-qty").value;
    const theorKg = stageCard.querySelector(".stage-theor-qty").innerText;
    const molarYield = stageCard.querySelector(".stage-molar-yield").innerText;
    const wwYield = stageCard.querySelector(".stage-ww-yield").innerText;
    const stageCostWo = stageCard.querySelector(".stage-subtotal-wo-rec").innerText;
    const stageCostW = stageCard.querySelector(".stage-subtotal-w-rec").innerText;
    const stageCont = stageCard.querySelector(".stage-subtotal-cont-rec").innerText;

    exportData.push({ "Stage / Material": `=== ${stageName.toUpperCase()} ===` });
    exportData.push({
      "Stage / Material": `Product: ${prodName} \vert{} MW:${prodMw} g/mol | Actual Out: ${actualKg} kg \vert{} Theor Out:${theorKg} | % Molar Yield: ${molarYield} \vert{} \% w/w:${wwYield}`
    });
    exportData.push({
      "Stage / Material": `STAGE SUBTOTAL: Cost w/o Rec: ${stageCostWo} | Cost with Rec: ${stageCostW} \vert{} Stage Contribution:${stageCont}`
    });

    const rows = stageCard.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      exportData.push({
        "Sr. No.": row.querySelector(".sr-no").innerText,
        "CAS No.": row.querySelector(".cas-no").value,
        "Name of RM": row.querySelector(".rm-name").value,
        "Density (g/mL)": row.querySelector(".density").value,
        "Ratio Type": row.querySelector(".ratio-type").value,
        "Mole / Vol Ratio": row.querySelector(".mole-vol-ratio").value,
        "Qty": row.querySelector(".qty").value,
        "Unit": row.querySelector(".unit-select").value,
        "MW (g/mol)": row.querySelector(".mw").value,
        "Moles": row.querySelector(".moles").innerText,
        "Qty/Kg API": row.querySelector(".qty-per-kg").innerText,
        "% Solvent Rec": row.querySelector(".rec-percent").value,
        "Qty/Kg API (with Rec)": row.querySelector(".qty-per-kg-rec").innerText,
        "Rate": row.querySelector(".rate").value,
        "Cost (w/o Rec)": row.querySelector(".cost-wo-rec").innerText,
        "Cost (with Rec)": row.querySelector(".cost-w-rec").innerText,
        "% Cont (w/o Rec)": row.querySelector(".cont-wo-rec").innerText,
        "% Cont (with Rec)": row.querySelector(".cont-w-rec").innerText,
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  XLSX.utils.book_append_sheet(wb, ws, "RMC_Report");
  XLSX.writeFile(wb, `${projectName.replace(/\s+/g, "_")}_RMC_Costing.xlsx`);
}
