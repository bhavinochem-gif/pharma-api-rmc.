// Global State
let priceMaster = {};
let stageCount = 0;

// Solvent Density Database (g/mL)
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
  addNewStage("Stage-1: KSM Condensation");
  setupEventListeners();
  refreshIcons();
});

function setupEventListeners() {
  document.getElementById("btnAddStage").addEventListener("click", () => {
    addNewStage(`Stage-${stageCount + 1}`);
  });
  document.getElementById("apiBatchSize").addEventListener("input", recalculateAll);
  document.getElementById("priceMasterFile").addEventListener("change", handleExcelUpload);
  document.getElementById("btnExport").addEventListener("click", () => exportFullWorkbook());
  document.getElementById("btnExportBOM").addEventListener("click", () => exportConsolidatedBOMOnly());
}

// Upload & Parse Local Excel Master
function handleExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    priceMaster = {};
    jsonData.forEach((row) => {
      const name = (row["Name"] || row["RM Name"] || row["Material"] || "").toString().trim();
      const sap = (row["SAP Code"] || row["SAP"] || "").toString().trim();
      const cas = (row["CAS No"] || row["CAS"] || "").toString().trim();
      const mw = parseFloat(row["MW"] || row["Molecular Weight"] || 0);
      const density = parseFloat(row["Density"] || 0);
      const rate = parseFloat(row["Rate"] || row["Rate/Kg"] || row["Price"] || 0);

      if (name) {
        priceMaster[name.toLowerCase()] = { name, sap, cas, mw, density, rate };
      }
    });

    document.getElementById("uploadLabel").innerText = `Loaded (${jsonData.length} items)`;
    updateDatalistOptions();
    alert(`Loaded ${jsonData.length} materials from Excel Master.`);
  };
  reader.readAsArrayBuffer(file);
}

// Refresh Datalist options (Excel Master + In-Page Stages)
function updateDatalistOptions() {
  const dataList = document.getElementById("rmMasterList");
  dataList.innerHTML = "";

  // 1. Add Excel Master items
  Object.values(priceMaster).forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.name;
    opt.label = `Master RM (Rate: ₹${item.rate})`;
    dataList.appendChild(opt);
  });

  // 2. Add Available In-Page Stages and Intermediates
  document.querySelectorAll(".stage-card").forEach((card) => {
    const stageName = card.querySelector(".stage-name-input").value.trim();
    const prodName = card.querySelector(".stage-prod-name").value.trim();
    const unitCost = card.dataset.unitCost || "0.00";

    if (stageName) {
      const opt = document.createElement("option");
      opt.value = stageName;
      opt.label = `Stage Transfer (Rate: ₹${unitCost}/kg)`;
      dataList.appendChild(opt);
    }
    if (prodName && prodName.toLowerCase() !== stageName.toLowerCase()) {
      const opt = document.createElement("option");
      opt.value = prodName;
      opt.label = `Stage Product (Rate: ₹${unitCost}/kg)`;
      dataList.appendChild(opt);
    }
  });
}

// Add New Reaction Stage
function addNewStage(defaultStageName) {
  stageCount++;
  const stageId = `stage_${Date.now()}_${stageCount}`;
  const container = document.getElementById("stagesContainer");

  const stageCard = document.createElement("div");
  stageCard.className = "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden stage-card";
  stageCard.id = stageId;
  stageCard.dataset.unitCost = "0.00";

  stageCard.innerHTML = `
    <div class="bg-slate-100 px-4 py-3 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
      <div class="flex items-center space-x-2 flex-grow max-w-md">
        <span class="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded stage-badge">Stage</span>
        <input 
          type="text" 
          value="${defaultStageName}" 
          class="stage-name-input bg-white font-semibold text-slate-700 text-xs border border-slate-300 rounded px-2 py-1 w-full focus:ring-1 focus:ring-indigo-500 outline-none" 
          placeholder="Enter Stage Name..."
          oninput="onStageMetadataChange()"
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
            <th>SAP Code</th>
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

    <div class="bg-slate-50/80 p-4 border-t border-slate-200 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
        <div class="md:col-span-2">
          <label class="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">Isolated Product / Intermediate Name</label>
          <input type="text" class="stage-prod-name w-full border rounded px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white" value="Intermediate Product ${stageCount}" oninput="onStageMetadataChange()" />
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
          <input type="number" step="any" class="stage-actual-qty w-full border rounded px-2 py-1 text-xs font-bold text-indigo-700 bg-white text-right" value="50.00" oninput="recalculateAll()" />
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
          <span><strong>Unaccounted Loss / ML:</strong> <span class="stage-mass-loss font-bold text-rose-600">0.00 kg</span></span>
        </div>
        <div class="flex items-center space-x-4">
          <span><strong>Stage Product Cost/Kg:</strong> <span class="stage-unit-cost font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">₹ 0.00</span></span>
          <span><strong>% w/w Yield:</strong> <span class="stage-ww-yield font-bold text-indigo-700">0.00%</span></span>
          <span><strong>Stage PMI:</strong> <span class="stage-pmi font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">0.00</span> kg/kg</span>
        </div>
      </div>
    </div>
  `;

  container.appendChild(stageCard);
  addMaterialRow(stageId); // Clean Sr. No. 1 without forced values
  updateStageBadgeNumbers();
  updateDatalistOptions();
  refreshIcons();
}

function removeStage(stageId) {
  const stage = document.getElementById(stageId);
  if (stage) {
    stage.remove();
    updateStageBadgeNumbers();
    updateDatalistOptions();
    recalculateAll();
  }
}

function updateStageBadgeNumbers() {
  document.querySelectorAll(".stage-card").forEach((card, index) => {
    card.querySelector(".stage-badge").innerText = `Stage ${index + 1}`;
  });
}

function onStageMetadataChange() {
  updateDatalistOptions();
  recalculateAll();
}

// Add Raw Material Row
function addMaterialRow(stageId) {
  const tbody = document.querySelector(`#table_${stageId} tbody`);
  const rowCount = tbody.children.length + 1;
  const isFirstRow = rowCount === 1;
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="text-center font-bold text-slate-500 sr-no">${rowCount}</td>
    <td><input type="text" class="sap-code w-20" placeholder="SAP Code" /></td>
    <td><input type="text" class="cas-no w-24" placeholder="CAS No." /></td>
    <td>
      <div class="flex items-center space-x-1">
        <input 
          type="text" 
          list="rmMasterList" 
          class="rm-name w-36 font-medium" 
          placeholder="Type RM or Stage..." 
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
        class="mole-vol-ratio w-16 text-right ${isFirstRow ? 'bg-slate-100 font-bold' : ''}" 
        value="1.00" 
        ${isFirstRow ? 'readonly' : ''} 
        oninput="recalculateAll()" 
      />
    </td>
    <td>
      <input 
        type="number" 
        step="any" 
        class="qty w-20 text-right font-medium ${!isFirstRow ? 'calc-highlight' : ''}" 
        value="${isFirstRow ? '50.0' : '0'}" 
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

// In-Page Stage & Material Auto-Fill Engine
function autoFillRM(input) {
  const row = input.closest("tr");
  const currentCard = input.closest(".stage-card");
  const val = input.value.trim().toLowerCase();
  if (!val) return;

  // 1. Check if user typed an existing STAGE NAME or INTERMEDIATE NAME on this page
  let matchedStage = null;
  document.querySelectorAll(".stage-card").forEach((card) => {
    if (card === currentCard) return;

    const stageName = card.querySelector(".stage-name-input").value.trim().toLowerCase();
    const prodName = card.querySelector(".stage-prod-name").value.trim().toLowerCase();

    if (val === stageName || val === prodName) {
      matchedStage = card;
    }
  });

  if (matchedStage) {
    const stageBadgeText = matchedStage.querySelector(".stage-badge").innerText;
    const prodMw = parseFloat(matchedStage.querySelector(".stage-prod-mw").value) || 0;
    const stageCostPerKg = parseFloat(matchedStage.dataset.unitCost) || 0;

    row.querySelector(".sap-code").value = `IN-HOUSE-${stageBadgeText.replace(/\s+/g, '')}`;
    row.querySelector(".cas-no").value = "In-house Int.";
    if (prodMw > 0) row.querySelector(".mw").value = prodMw;
    row.querySelector(".rate").value = stageCostPerKg.toFixed(2);
    row.querySelector(".density").value = "1.0";
    row.classList.add("stage-lookup-badge");
    row.dataset.isInHouse = "true";

    recalculateAll();
    return;
  }

  row.dataset.isInHouse = "false";
  row.classList.remove("stage-lookup-badge");

  // 2. Check local uploaded Excel Master Sheet
  if (priceMaster[val]) {
    const item = priceMaster[val];
    row.querySelector(".sap-code").value = item.sap || "";
    row.querySelector(".cas-no").value = item.cas || "";
    row.querySelector(".mw").value = item.mw || 0;
    if (item.density > 0) row.querySelector(".density").value = item.density;
    row.querySelector(".rate").value = item.rate || 0;
  }

  // 3. Check internal solvent density database
  if (SOLVENT_DENSITIES[val]) {
    row.querySelector(".density").value = SOLVENT_DENSITIES[val];
    row.querySelector(".ratio-type").value = "volume";
    row.querySelector(".unit-select").value = "L";
  }

  recalculateAll();
}

// Reverse Yield Cascade: Auto-Scales Batch to Target API Quantity
function scaleAllStagesToTarget() {
  const targetApiKg = parseFloat(document.getElementById("apiBatchSize").value) || 0;
  if (targetApiKg <= 0) {
    alert("Please enter a valid target API batch size (e.g., 50 kg).");
    return;
  }

  const stageCards = Array.from(document.querySelectorAll(".stage-card"));
  if (stageCards.length === 0) return;

  let requiredOutputForStage = targetApiKg;

  for (let i = stageCards.length - 1; i >= 0; i--) {
    const card = stageCards[i];
    const actualQtyInput = card.querySelector(".stage-actual-qty");
    const refRow = card.querySelector("tbody tr:first-child");
    if (!refRow) continue;

    const currentRefQty = parseFloat(refRow.querySelector(".qty").value) || 1;
    const currentActualOut = parseFloat(actualQtyInput.value) || 1;

    if (currentActualOut <= 0) continue;

    const stageMultiplier = requiredOutputForStage / currentActualOut;

    actualQtyInput.value = requiredOutputForStage.toFixed(3);

    const newRefQty = currentRefQty * stageMultiplier;
    refRow.querySelector(".qty").value = newRefQty.toFixed(3);

    requiredOutputForStage = newRefQty;
  }

  recalculateAll();
  alert(`All stages successfully scaled via reverse-yield cascade to produce ${targetApiKg} kg API.`);
}

// Auto Fetch Product MW online
async function fetchProductMWOnline(btn) {
  const card = btn.closest(".stage-card");
  const prodName = card.querySelector(".stage-prod-name").value.trim();
  if (!prodName) return alert("Please enter product name first.");

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
      alert(`No record found for "${prodName}".`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    btn.innerHTML = originalIcon;
    refreshIcons();
  }
}

// Auto Fetch CAS, MW and Density online via PubChem REST API
async function fetchOnlineChemData(btn, inputElement) {
  const row = inputElement.closest("tr");
  const rmName = inputElement.value.trim();
  if (!rmName) return alert("Please enter a Raw Material name first.");

  const originalIcon = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-indigo-600"></i>`;
  refreshIcons();

  try {
    const encodedName = encodeURIComponent(rmName);
    const synRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodedName}/synonyms/JSON`);
    let casNo = "";
    if (synRes.ok) {
      const synData = await synRes.json();
      const synonyms = synData?.InformationList?.Information?.[0]?.Synonym || [];
      const casRegex = /^[1-9]\d{1,6}-\d{2}-\d$/;
      const match = synonyms.find((item) => casRegex.test(item.trim()));
      if (match) casNo = match.trim();
    }

    const propRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodedName}/property/MolecularWeight/JSON`);
    let mw = 0;
    if (propRes.ok) {
      const propData = await propRes.json();
      mw = propData?.PropertyTable?.Properties?.[0]?.MolecularWeight || 0;
    }

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
    console.error(err);
    alert("Online search failed. Please enter details manually.");
  } finally {
    btn.innerHTML = originalIcon;
    refreshIcons();
  }
}

// Master Stoichiometry & Cost Calculation Engine
function recalculateAll() {
  const apiBatchSize = parseFloat(document.getElementById("apiBatchSize").value) || 1;
  const stageCards = Array.from(document.querySelectorAll(".stage-card"));

  let grandTotalCostWithoutRec = 0;
  let grandTotalCostWithRec = 0;
  let globalTotalInputMassKg = 0;

  stageCards.forEach((stageCard) => {
    const rows = Array.from(stageCard.querySelectorAll("tbody tr"));
    if (rows.length === 0) return;

    // Refresh rates for rows referencing upstream in-page stages
    rows.forEach((row) => {
      const val = row.querySelector(".rm-name").value.trim().toLowerCase();
      if (!val) return;

      stageCards.forEach((otherCard) => {
        if (otherCard === stageCard) return;
        const otherStageName = otherCard.querySelector(".stage-name-input").value.trim().toLowerCase();
        const otherProdName = otherCard.querySelector(".stage-prod-name").value.trim().toLowerCase();

        if (val === otherStageName || val === otherProdName) {
          const freshUnitCost = parseFloat(otherCard.dataset.unitCost) || 0;
          if (freshUnitCost > 0) {
            row.querySelector(".rate").value = freshUnitCost.toFixed(2);
          }
        }
      });
    });

    // Reference Material (Sr. No. 1)
    const refRow = rows[0];
    const refQtyInput = parseFloat(refRow.querySelector(".qty").value) || 0;
    const refUnit = refRow.querySelector(".unit-select").value;
    const refDensity = parseFloat(refRow.querySelector(".density").value) || 1.0;
    const refMw = parseFloat(refRow.querySelector(".mw").value) || 0;

    let refQtyInKg = refQtyInput;
    if (refUnit === "L") refQtyInKg = refQtyInput * refDensity;
    else if (refUnit === "g") refQtyInKg = refQtyInput / 1000;

    const refMoles = refMw > 0 ? (refQtyInKg * 1000) / refMw : 0;
    refRow.querySelector(".moles").innerText = refMoles.toFixed(2);
    refRow.querySelector(".mole-vol-ratio").value = "1.00";

    let stageTotalMassInKg = 0;
    let stageTotalRecoveredKg = 0;
    let stageNetCostWithRec = 0;

    // Subsequent RMs (Sr. No. 2+)
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
          const targetMoles = refMoles * ratioVal;
          const targetMassKg = mw > 0 ? (targetMoles * mw) / 1000 : 0;
          if (unit === "kg") qty = targetMassKg;
          else if (unit === "L") qty = density > 0 ? targetMassKg / density : targetMassKg;
          else if (unit === "g") qty = targetMassKg * 1000;
        } else if (ratioType === "volume") {
          const targetVolLiters = refQtyInKg * ratioVal;
          if (unit === "L") qty = targetVolLiters;
          else if (unit === "kg") qty = targetVolLiters * density;
          else if (unit === "g") qty = targetVolLiters * density * 1000;
        }
        row.querySelector(".qty").value = qty.toFixed(3);
      }

      let rowQtyKg = qty;
      if (unit === "L") rowQtyKg = qty * density;
      else if (unit === "g") rowQtyKg = qty / 1000;

      stageTotalMassInKg += rowQtyKg;
      stageTotalRecoveredKg += rowQtyKg * (recPercent / 100);

      const rowMoles = mw > 0 ? (rowQtyKg * 1000) / mw : 0;
      row.querySelector(".moles").innerText = rowMoles.toFixed(2);

      const qtyPerKg = rowQtyKg / apiBatchSize;
      const qtyPerKgRec = qtyPerKg * (1 - recPercent / 100);

      const costWithoutRec = (qty / apiBatchSize) * rate;
      const costWithRec = costWithoutRec * (1 - recPercent / 100);

      row.querySelector(".qty-per-kg").innerText = qtyPerKg.toFixed(4);
      row.querySelector(".qty-per-kg-rec").innerText = qtyPerKgRec.toFixed(4);
      row.querySelector(".cost-wo-rec").innerText = costWithoutRec.toFixed(2);
      row.querySelector(".cost-w-rec").innerText = costWithRec.toFixed(2);

      const isInHouse = row.dataset.isInHouse === "true";
      if (!isInHouse) {
        grandTotalCostWithoutRec += costWithoutRec;
        grandTotalCostWithRec += costWithRec;
      }

      stageNetCostWithRec += (qty * rate) * (1 - recPercent / 100);
    });

    globalTotalInputMassKg += stageTotalMassInKg;

    // Stage Yield, Mass Balance & Unit Cost
    const prodMW = parseFloat(stageCard.querySelector(".stage-prod-mw").value) || 0;
    const actualOutKg = parseFloat(stageCard.querySelector(".stage-actual-qty").value) || 0;

    const theorOutKg = (refMoles > 0 && prodMW > 0) ? (refMoles * prodMW) / 1000 : 0;
    const actualMoles = (actualOutKg > 0 && prodMW > 0) ? (actualOutKg * 1000) / prodMW : 0;

    const molarYieldPct = refMoles > 0 ? (actualMoles / refMoles) * 100 : 0;
    const wwYieldPct = refQtyInKg > 0 ? (actualOutKg / refQtyInKg) * 100 : 0;

    const massLossKg = Math.max(0, stageTotalMassInKg - (actualOutKg + stageTotalRecoveredKg));
    const stagePMI = actualOutKg > 0 ? stageTotalMassInKg / actualOutKg : 0;

    const stageUnitCost = actualOutKg > 0 ? stageNetCostWithRec / actualOutKg : 0;
    stageCard.dataset.unitCost = stageUnitCost.toFixed(2);

    stageCard.querySelector(".stage-theor-qty").innerText = `${theorOutKg.toFixed(2)} kg`;
    const molarYieldBadge = stageCard.querySelector(".stage-molar-yield");
    molarYieldBadge.innerText = `${molarYieldPct.toFixed(2)}%`;
    molarYieldBadge.className = `stage-molar-yield yield-badge ${molarYieldPct >= 85 ? 'yield-high' : molarYieldPct >= 70 ? 'yield-med' : 'yield-low'}`;

    stageCard.querySelector(".stage-ww-yield").innerText = `${wwYieldPct.toFixed(2)}%`;
    stageCard.querySelector(".stage-unit-cost").innerText = `₹ ${stageUnitCost.toFixed(2)}/kg`;
    stageCard.querySelector(".stage-mass-in").innerText = `${stageTotalMassInKg.toFixed(2)} kg`;
    stageCard.querySelector(".stage-mass-rec").innerText = `${stageTotalRecoveredKg.toFixed(2)} kg`;
    stageCard.querySelector(".stage-mass-loss").innerText = `${massLossKg.toFixed(2)} kg`;
    stageCard.querySelector(".stage-pmi").innerText = stagePMI.toFixed(2);
  });

  // Calculate Percentage Cost Contributions
  document.querySelectorAll(".stage-card tbody tr").forEach((row) => {
    const costWo = parseFloat(row.querySelector(".cost-wo-rec").innerText) || 0;
    const costW = parseFloat(row.querySelector(".cost-w-rec").innerText) || 0;

    const contWo = grandTotalCostWithoutRec > 0 ? (costWo / grandTotalCostWithoutRec) * 100 : 0;
    const contW = grandTotalCostWithRec > 0 ? (costW / grandTotalCostWithRec) * 100 : 0;

    row.querySelector(".cont-wo-rec").innerText = `${contWo.toFixed(2)}%`;
    row.querySelector(".cont-w-rec").innerText = `${contW.toFixed(2)}%`;
  });

  // Global Dashboard Totals
  const totalSavings = grandTotalCostWithoutRec - grandTotalCostWithRec;
  const savingsPct = grandTotalCostWithoutRec > 0 ? (totalSavings / grandTotalCostWithoutRec) * 100 : 0;
  const cumulativePMI = apiBatchSize > 0 ? globalTotalInputMassKg / apiBatchSize : 0;

  document.getElementById("totalCostWithoutRec").innerText = `₹ ${grandTotalCostWithoutRec.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("totalCostWithRec").innerText = `₹ ${grandTotalCostWithRec.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("totalSavings").innerText = `₹ ${totalSavings.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("savingsPercentage").innerText = `${savingsPct.toFixed(2)}% total savings`;
  document.getElementById("cumulativePMI").innerText = cumulativePMI.toFixed(2);
}

// Aggregation Engine: Consolidates Raw Materials across all stages
function getConsolidatedBOMData() {
  const consolidated = {};
  const stageCards = document.querySelectorAll(".stage-card");

  stageCards.forEach((card, stageIdx) => {
    const stageName = card.querySelector(".stage-name-input").value.trim() || `Stage ${stageIdx + 1}`;
    const rows = card.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      const rawName = row.querySelector(".rm-name").value.trim();
      if (!rawName) return;

      const sap = row.querySelector(".sap-code").value.trim();
      const cas = row.querySelector(".cas-no").value.trim();
      const unit = row.querySelector(".unit-select").value;
      const density = parseFloat(row.querySelector(".density").value) || 1.0;
      const qty = parseFloat(row.querySelector(".qty").value) || 0;
      const recPercent = parseFloat(row.querySelector(".rec-percent").value) || 0;
      const rate = parseFloat(row.querySelector(".rate").value) || 0;
      const isInHouse = row.dataset.isInHouse === "true" || cas.toLowerCase().includes("in-house");

      // Unique identifier by Name and Unit
      const key = `${rawName.toLowerCase()}___${unit.toLowerCase()}`;

      if (!consolidated[key]) {
        consolidated[key] = {
          name: rawName,
          sap: sap,
          cas: cas,
          unit: unit,
          density: density,
          isInHouse: isInHouse,
          grossQty: 0,
          recoveredQty: 0,
          netQty: 0,
          rate: rate,
          costWithoutRec: 0,
          costWithRec: 0,
          stagesUsed: new Set()
        };
      }

      const item = consolidated[key];
      const recoveredAmt = qty * (recPercent / 100);
      const netAmt = qty - recoveredAmt;

      item.grossQty += qty;
      item.recoveredQty += recoveredAmt;
      item.netQty += netAmt;
      item.costWithoutRec += (qty * rate);
      item.costWithRec += (netAmt * rate);
      item.stagesUsed.add(stageName);

      if (sap && !item.sap) item.sap = sap;
      if (cas && !item.cas) item.cas = cas;
      if (rate > 0) item.rate = rate;
    });
  });

  return Object.values(consolidated);
}

// Generate the Styled Consolidated Sheet
function buildConsolidatedSheet(wb, projectName, apiBatchSize) {
  const bomData = getConsolidatedBOMData();

  const styles = {
    title: {
      font: { name: "Arial", sz: 13, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "064E3B" } }, // Emerald 900
      alignment: { horizontal: "center", vertical: "center" }
    },
    meta: {
      font: { name: "Arial", sz: 9, bold: true, color: { rgb: "1E293B" } },
      fill: { fgColor: { rgb: "F1F5F9" } },
      alignment: { vertical: "center" }
    },
    tableHeader: {
      font: { name: "Arial", sz: 8.5, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "065F46" } }, // Emerald 800
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: { bottom: { style: "medium", color: { rgb: "000000" } } }
    },
    dataText: { font: { name: "Arial", sz: 8 }, alignment: { vertical: "center" } },
    dataNum: { font: { name: "Arial", sz: 8 }, alignment: { horizontal: "right", vertical: "center" } },
    dataTotal: {
      font: { name: "Arial", sz: 9, bold: true, color: { rgb: "064E3B" } },
      fill: { fgColor: { rgb: "ECFDF5" } },
      alignment: { horizontal: "right", vertical: "center" },
      border: { top: { style: "thin", color: { rgb: "065F46" } }, bottom: { style: "double", color: { rgb: "065F46" } } }
    },
    inHouseBadge: {
      font: { name: "Arial", sz: 7.5, italic: true, color: { rgb: "15803D" } },
      fill: { fgColor: { rgb: "F0FDF4" } }
    }
  };

  const wsData = [];
  const merges = [];

  // Title & Batch Spec
  wsData.push([`${projectName.toUpperCase()} - CONSOLIDATED RAW MATERIAL BILL OF MATERIALS (BOM)`]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } });

  wsData.push([`Target API Batch Size: ${apiBatchSize} kg`, `Date Generated: ${new Date().toLocaleDateString()}`, "", "", "", "", "", "", "", "", "", ""]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 3 } });
  merges.push({ s: { r: 1, c: 4 }, e: { r: 1, c: 11 } });
  wsData.push([]);

  // Headers
  const headers = [
    "Sr.", "SAP Code", "CAS No.", "Raw Material Description", "Type",
    "Total Gross Qty Required", "Unit", "Total Recovered Qty",
    "Net Fresh Qty Required", "Rate (₹/Unit)", "Total Cost w/o Rec (₹)", "Total Cost with Rec (₹)", "Stages Consumed In"
  ];
  wsData.push(headers);

  let grandTotalCostWo = 0;
  let grandTotalCostW = 0;

  bomData.forEach((item, idx) => {
    const typeLabel = item.isInHouse ? "In-House Intermediate" : (SOLVENT_DENSITIES[item.name.toLowerCase()] ? "Solvent" : "Raw Material / Reagent");

    if (!item.isInHouse) {
      grandTotalCostWo += item.costWithoutRec;
      grandTotalCostW += item.costWithRec;
    }

    wsData.push([
      idx + 1,
      item.sap || "-",
      item.cas || "-",
      item.name,
      typeLabel,
      parseFloat(item.grossQty.toFixed(3)),
      item.unit,
      parseFloat(item.recoveredQty.toFixed(3)),
      parseFloat(item.netQty.toFixed(3)),
      parseFloat(item.rate.toFixed(2)),
      parseFloat(item.costWithoutRec.toFixed(2)),
      parseFloat(item.costWithRec.toFixed(2)),
      Array.from(item.stagesUsed).join(", ")
    ]);
  });

  // Total Summary Row
  const totalRowIdx = wsData.length;
  wsData.push([
    "TOTAL PROCUREMENT EXPENDITURE (VIRGIN MATERIALS):",
    "", "", "", "", "", "", "", "", "",
    parseFloat(grandTotalCostWo.toFixed(2)),
    parseFloat(grandTotalCostW.toFixed(2)),
    ""
  ]);
  merges.push({ s: { r: totalRowIdx, c: 0 }, e: { r: totalRowIdx, c: 9 } });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!merges"] = merges;
  ws["!cols"] = [
    { wch: 6 }, { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 20 },
    { wch: 18 }, { wch: 8 }, { wch: 18 }, { wch: 18 }, { wch: 14 },
    { wch: 18 }, { wch: 18 }, { wch: 30 }
  ];

  // Apply Styles
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;

      if (R === 0) ws[cellRef].s = styles.title;
      else if (R === 1) ws[cellRef].s = styles.meta;
      else if (R === 3) ws[cellRef].s = styles.tableHeader;
      else if (R === totalRowIdx) ws[cellRef].s = styles.dataTotal;
      else {
        if (typeof ws[cellRef].v === "number") ws[cellRef].s = styles.dataNum;
        else ws[cellRef].s = styles.dataText;
      }
    }
  }

  return ws;
}

// Build the Stage-Wise Breakdown Sheet
function buildStageWiseSheet(projectName, apiBatchSize) {
  const styles = {
    title: { font: { name: "Arial", sz: 13, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "0F172A" } }, alignment: { horizontal: "center", vertical: "center" } },
    meta: { font: { name: "Arial", sz: 9, bold: true, color: { rgb: "334155" } }, fill: { fgColor: { rgb: "F1F5F9" } }, alignment: { vertical: "center" } },
    stageHeader: { font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "312E81" } }, alignment: { horizontal: "left", vertical: "center" } },
    stageSubbar: { font: { name: "Arial", sz: 8.5, bold: true, color: { rgb: "1E1B4B" } }, fill: { fgColor: { rgb: "EEF2FF" } }, alignment: { vertical: "center" } },
    tableHeader: { font: { name: "Arial", sz: 8, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1E293B" } }, alignment: { horizontal: "center", vertical: "center", wrapText: true } },
    dataText: { font: { name: "Arial", sz: 8 }, alignment: { vertical: "center" } },
    dataNum: { font: { name: "Arial", sz: 8 }, alignment: { horizontal: "right", vertical: "center" } },
    dataHighlight: { font: { name: "Arial", sz: 8, bold: true, color: { rgb: "1E40AF" } }, fill: { fgColor: { rgb: "F8FAFC" } }, alignment: { horizontal: "right", vertical: "center" } },
    summaryBanner: { font: { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "065F46" } }, alignment: { horizontal: "left", vertical: "center" } },
    summaryValue: { font: { name: "Arial", sz: 9.5, bold: true, color: { rgb: "065F46" } }, fill: { fgColor: { rgb: "ECFDF5" } }, alignment: { horizontal: "right", vertical: "center" } }
  };

  const wsData = [];
  const merges = [];

  wsData.push([`${projectName.toUpperCase()} - STAGE-WISE RAW MATERIAL COSTING REPORT`]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 18 } });

  wsData.push([`Target API Batch Size: ${apiBatchSize} kg`, `Generated Date: ${new Date().toLocaleDateString()}`, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 4 } });
  merges.push({ s: { r: 1, c: 5 }, e: { r: 1, c: 18 } });
  wsData.push([]);

  const headers = [
    "Sr.", "SAP Code", "CAS No.", "Raw Material Name", "Density (g/mL)",
    "Ratio Type", "Mole / Vol Ratio", "Qty", "Unit", "MW (g/mol)",
    "Moles", "Qty/Kg API", "% Solvent Rec.", "Qty/Kg API (with Rec.)",
    "Rate (₹/Unit)", "Cost (w/o Rec.)", "Cost (with Rec.)", "% Cont (w/o Rec.)", "% Cont (with Rec.)"
  ];

  document.querySelectorAll(".stage-card").forEach((card) => {
    const stageName = card.querySelector(".stage-name-input").value;
    const prodName = card.querySelector(".stage-prod-name").value;
    const prodMw = card.querySelector(".stage-prod-mw").value;
    const actualKg = card.querySelector(".stage-actual-qty").value;
    const theorKg = card.querySelector(".stage-theor-qty").innerText;
    const molarYield = card.querySelector(".stage-molar-yield").innerText;
    const wwYield = card.querySelector(".stage-ww-yield").innerText;
    const unitCost = card.querySelector(".stage-unit-cost").innerText;
    const stagePmi = card.querySelector(".stage-pmi").innerText;

    const stageTitleRowIndex = wsData.length;
    wsData.push([`STAGE: ${stageName.toUpperCase()}`]);
    merges.push({ s: { r: stageTitleRowIndex, c: 0 }, e: { r: stageTitleRowIndex, c: 18 } });

    const stageParamRowIndex = wsData.length;
    wsData.push([`Product: ${prodName} \vert{} MW:${prodMw} g/mol | Actual: ${actualKg} kg \vert{} Theor:${theorKg} | % Molar Yield: ${molarYield} \vert{} \% w/w:${wwYield} | Stage Cost: ${unitCost} \vert{} Stage PMI:${stagePmi}`]);
    merges.push({ s: { r: stageParamRowIndex, c: 0 }, e: { r: stageParamRowIndex, c: 18 } });

    wsData.push(headers);

    const rows = card.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      wsData.push([
        row.querySelector(".sr-no").innerText,
        row.querySelector(".sap-code").value,
        row.querySelector(".cas-no").value,
        row.querySelector(".rm-name").value,
        parseFloat(row.querySelector(".density").value) || 1.0,
        row.querySelector(".ratio-type").value === "mole" ? "Mole Ratio" : "Vol Ratio (V/W)",
        parseFloat(row.querySelector(".mole-vol-ratio").value) || 0,
        parseFloat(row.querySelector(".qty").value) || 0,
        row.querySelector(".unit-select").value,
        parseFloat(row.querySelector(".mw").value) || 0,
        parseFloat(row.querySelector(".moles").innerText) || 0,
        parseFloat(row.querySelector(".qty-per-kg").innerText) || 0,
        parseFloat(row.querySelector(".rec-percent").value) || 0,
        parseFloat(row.querySelector(".qty-per-kg-rec").innerText) || 0,
        parseFloat(row.querySelector(".rate").value) || 0,
        parseFloat(row.querySelector(".cost-wo-rec").innerText) || 0,
        parseFloat(row.querySelector(".cost-w-rec").innerText) || 0,
        row.querySelector(".cont-wo-rec").innerText,
        row.querySelector(".cont-w-rec").innerText
      ]);
    });

    wsData.push([]);
  });

  const summaryStart = wsData.length;
  wsData.push(["OVERALL FINISHED API COST & PROCESS METRICS"]);
  merges.push({ s: { r: summaryStart, c: 0 }, e: { r: summaryStart, c: 18 } });

  wsData.push(["Total RM Cost (Without Recovery):", document.getElementById("totalCostWithoutRec").innerText]);
  merges.push({ s: { r: summaryStart + 1, c: 0 }, e: { r: summaryStart + 1, c: 3 } });

  wsData.push(["Total RM Cost (With Recovery):", document.getElementById("totalCostWithRec").innerText]);
  merges.push({ s: { r: summaryStart + 2, c: 0 }, e: { r: summaryStart + 2, c: 3 } });

  wsData.push(["Solvent Recovery Savings:", `${document.getElementById("totalSavings").innerText} (${document.getElementById("savingsPercentage").innerText})`]);
  merges.push({ s: { r: summaryStart + 3, c: 0 }, e: { r: summaryStart + 3, c: 3 } });

  wsData.push(["Cumulative Process Mass Intensity (PMI):", `${document.getElementById("cumulativePMI").innerText} kg raw materials / kg finished API`]);
  merges.push({ s: { r: summaryStart + 4, c: 0 }, e: { r: summaryStart + 4, c: 3 } });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!merges"] = merges;
  ws["!cols"] = [
    { wch: 6 }, { wch: 14 }, { wch: 14 }, { wch: 28 }, { wch: 11 },
    { wch: 13 }, { wch: 12 }, { wch: 10 }, { wch: 6 }, { wch: 10 },
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];

  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;

      const val = String(ws[cellRef].v || "");
      if (R === 0) ws[cellRef].s = styles.title;
      else if (R === 1) ws[cellRef].s = styles.meta;
      else if (val.startsWith("STAGE:")) ws[cellRef].s = styles.stageHeader;
      else if (val.startsWith("Product:")) ws[cellRef].s = styles.stageSubbar;
      else if (val === "Sr." || val === "Raw Material Name" || val === "SAP Code") {
        for (let col = 0; col <= 18; col++) {
          const cRef = XLSX.utils.encode_cell({ r: R, c: col });
          if (ws[cRef]) ws[cRef].s = styles.tableHeader;
        }
      } else if (R === summaryStart) ws[cellRef].s = styles.summaryBanner;
      else if (R > summaryStart && C === 0) ws[cellRef].s = styles.meta;
      else if (R > summaryStart && C === 1) ws[cellRef].s = styles.summaryValue;
      else {
        if (typeof ws[cellRef].v === "number") ws[cellRef].s = (C === 15 || C === 16) ? styles.dataHighlight : styles.dataNum;
        else ws[cellRef].s = styles.dataText;
      }
    }
  }

  return ws;
}

// 1. Export Full Multi-Sheet Workbook (Stage-Wise Breakdown + Consolidated BOM)
function exportFullWorkbook() {
  const projectName = document.getElementById("projectName").value || "Pharma API RMC";
  const apiBatchSize = document.getElementById("apiBatchSize").value || 50;
  const wb = XLSX.utils.book_new();

  const stageWs = buildStageWiseSheet(projectName, apiBatchSize);
  XLSX.utils.book_append_sheet(wb, stageWs, "Stage_Costing_Breakdown");

  const bomWs = buildConsolidatedSheet(wb, projectName, apiBatchSize);
  XLSX.utils.book_append_sheet(wb, bomWs, "Consolidated_BOM");

  XLSX.writeFile(wb, `${projectName.replace(/\s+/g, "_")}_${apiBatchSize}kg_RMC_Full_Workbook.xlsx`);
}

// 2. Export Dedicated Consolidated BOM Sheet for Procurement
function exportConsolidatedBOMOnly() {
  const projectName = document.getElementById("projectName").value || "Pharma API RMC";
  const apiBatchSize = document.getElementById("apiBatchSize").value || 50;
  const wb = XLSX.utils.book_new();

  const bomWs = buildConsolidatedSheet(wb, projectName, apiBatchSize);
  XLSX.utils.book_append_sheet(wb, bomWs, "Consolidated_Procurement_BOM");

  XLSX.writeFile(wb, `${projectName.replace(/\s+/g, "_")}_${apiBatchSize}kg_Consolidated_BOM.xlsx`);
}
