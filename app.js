// State Management
let priceMaster = {}; // Key: RM Name / SAP Code -> Details
let stageCount = 0;

// Initialize Lucide Icons
function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", () => {
  addNewStage("Stage-1: Intermediate Synthesis");
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

// Upload & Parse Excel Master
function handleExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const dataList = document.getElementById("rmMasterList");
    dataList.innerHTML = "";
    priceMaster = {};

    jsonData.forEach((row) => {
      // Normalizing column lookups
      const name = (row["Name"] || row["RM Name"] || row["Material"] || "").toString().trim();
      const sap = (row["SAP Code"] || row["SAP"] || "").toString().trim();
      const cas = (row["CAS No"] || row["CAS"] || "").toString().trim();
      const mw = parseFloat(row["MW"] || row["Molecular Weight"] || 0);
      const rate = parseFloat(row["Rate"] || row["Rate/Kg"] || row["Price"] || 0);

      if (name) {
        priceMaster[name.toLowerCase()] = { name, sap, cas, mw, rate };
        const option = document.createElement("option");
        option.value = name;
        dataList.appendChild(option);
      }
    });

    document.getElementById("uploadLabel").innerText = `Loaded (${jsonData.length} items)`;
    alert(`Successfully loaded ${jsonData.length} Raw Materials from Excel.`);
  };
  reader.readAsArrayBuffer(file);
}

// Add New Reaction Stage
function addNewStage(stageTitle) {
  stageCount++;
  const stageId = `stage_${stageCount}`;
  const container = document.getElementById("stagesContainer");

  const stageCard = document.createElement("div");
  stageCard.className = "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden stage-card";
  stageCard.id = stageId;

  stageCard.innerHTML = `
    <div class="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <span class="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">Stage ${stageCount}</span>
        <input type="text" value="${stageTitle}" class="bg-transparent font-semibold text-slate-700 text-sm border-none focus:ring-0 outline-none" />
      </div>
      <div class="flex items-center space-x-2">
        <button onclick="addMaterialRow('${stageId}')" class="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition">
          <i data-lucide="plus" class="w-3.5 h-3.5 mr-1"></i> Add Material
        </button>
        <button onclick="removeStage('${stageId}')" class="text-rose-500 hover:text-rose-700 p-1 rounded transition">
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
            <th style="min-width: 160px;">Name of Raw Material</th>
            <th>Qty (kg)</th>
            <th>MW</th>
            <th>Moles</th>
            <th>Mole Ratio</th>
            <th>Qty/Kg API</th>
            <th>% Solvent Rec.</th>
            <th>Qty/Kg (with Rec.)</th>
            <th>Rate (₹/$)</th>
            <th>Cost (w/o Rec.)</th>
            <th>Cost (with Rec.)</th>
            <th>% Cont. (w/o Rec.)</th>
            <th>% Cont. (with Rec.)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200"></tbody>
      </table>
    </div>
  `;

  container.appendChild(stageCard);
  addMaterialRow(stageId); // Add initial empty row
  refreshIcons();
}

function removeStage(stageId) {
  const stage = document.getElementById(stageId);
  if (stage) {
    stage.remove();
    recalculateAll();
  }
}

// Add Raw Material Row
function addMaterialRow(stageId) {
  const tbody = document.querySelector(`#table_${stageId} tbody`);
  const rowCount = tbody.children.length + 1;
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="text-center font-bold text-slate-500 sr-no">${rowCount}</td>
    <td><input type="text" class="sap-code w-20" placeholder="SAP" /></td>
    <td><input type="text" class="cas-no w-24" placeholder="CAS" /></td>
    <td><input type="text" list="rmMasterList" class="rm-name w-40" placeholder="Select/Enter RM" onchange="autoFillRM(this)" /></td>
    <td><input type="number" step="any" class="qty w-16 text-right" value="0" oninput="recalculateAll()" /></td>
    <td><input type="number" step="any" class="mw w-16 text-right" value="0" oninput="recalculateAll()" /></td>
    <td class="read-only-cell moles">0.00</td>
    <td><input type="number" step="any" class="mole-ratio w-14 text-right" value="1.0" oninput="recalculateAll()" /></td>
    <td class="read-only-cell qty-per-kg">0.00</td>
    <td><input type="number" step="any" class="rec-percent w-14 text-right" value="0" min="0" max="100" oninput="recalculateAll()" /></td>
    <td class="read-only-cell qty-per-kg-rec">0.00</td>
    <td><input type="number" step="any" class="rate w-16 text-right" value="0" oninput="recalculateAll()" /></td>
    <td class="read-only-cell cost-wo-rec">0.00</td>
    <td class="read-only-cell cost-w-rec">0.00</td>
    <td class="read-only-cell cont-wo-rec">0.00%</td>
    <td class="read-only-cell cont-w-rec">0.00%</td>
    <td class="text-center">
      <button onclick="removeRow(this)" class="text-slate-400 hover:text-rose-600 transition"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
    </td>
  `;

  tbody.appendChild(row);
  refreshIcons();
}

function removeRow(btn) {
  const row = btn.closest("tr");
  const tbody = row.closest("tbody");
  row.remove();

  // Reset Serial numbers
  Array.from(tbody.querySelectorAll(".sr-no")).forEach((td, index) => {
    td.innerText = index + 1;
  });
  recalculateAll();
}

// Auto-populate when selecting RM from Master Sheet
function autoFillRM(input) {
  const row = input.closest("tr");
  const val = input.value.trim().toLowerCase();

  if (priceMaster[val]) {
    const item = priceMaster[val];
    row.querySelector(".sap-code").value = item.sap || "";
    row.querySelector(".cas-no").value = item.cas || "";
    row.querySelector(".mw").value = item.mw || 0;
    row.querySelector(".rate").value = item.rate || 0;
  }
  recalculateAll();
}

// Main Calculation Engine
function recalculateAll() {
  const apiBatchSize = parseFloat(document.getElementById("apiBatchSize").value) || 1;
  const allRows = document.querySelectorAll("#stagesContainer tbody tr");

  let totalCostWithoutRec = 0;
  let totalCostWithRec = 0;

  // Pass 1: Compute Row level values and accumulate totals
  allRows.forEach((row) => {
    const qty = parseFloat(row.querySelector(".qty").value) || 0;
    const mw = parseFloat(row.querySelector(".mw").value) || 0;
    const recPercent = parseFloat(row.querySelector(".rec-percent").value) || 0;
    const rate = parseFloat(row.querySelector(".rate").value) || 0;

    // Formulas:
    // Moles = (Qty in kg * 1000) / MW
    const moles = mw > 0 ? (qty * 1000) / mw : 0;
    // Qty of RM per Kg of API = Qty / API Batch Output
    const qtyPerKg = qty / apiBatchSize;
    // Qty with Solvent Recovery
    const qtyPerKgRec = qtyPerKg * (1 - recPercent / 100);
    // Costs
    const costWithoutRec = qtyPerKg * rate;
    const costWithRec = qtyPerKgRec * rate;

    // Update cells
    row.querySelector(".moles").innerText = moles.toFixed(2);
    row.querySelector(".qty-per-kg").innerText = qtyPerKg.toFixed(4);
    row.querySelector(".qty-per-kg-rec").innerText = qtyPerKgRec.toFixed(4);
    row.querySelector(".cost-wo-rec").innerText = costWithoutRec.toFixed(2);
    row.querySelector(".cost-w-rec").innerText = costWithRec.toFixed(2);

    totalCostWithoutRec += costWithoutRec;
    totalCostWithRec += costWithRec;
  });

  // Pass 2: Calculate % Cost Contributions
  allRows.forEach((row) => {
    const costWithoutRec = parseFloat(row.querySelector(".cost-wo-rec").innerText) || 0;
    const costWithRec = parseFloat(row.querySelector(".cost-w-rec").innerText) || 0;

    const contWoRec = totalCostWithoutRec > 0 ? (costWithoutRec / totalCostWithoutRec) * 100 : 0;
    const contWRec = totalCostWithRec > 0 ? (costWithRec / totalCostWithRec) * 100 : 0;

    row.querySelector(".cont-wo-rec").innerText = `${contWoRec.toFixed(2)}%`;
    row.querySelector(".cont-w-rec").innerText = `${contWRec.toFixed(2)}%`;
  });

  // Pass 3: Update Dashboard Totals
  const totalSavings = totalCostWithoutRec - totalCostWithRec;
  const savingsPct = totalCostWithoutRec > 0 ? (totalSavings / totalCostWithoutRec) * 100 : 0;
  const totalBatchCost = totalCostWithRec * apiBatchSize;

  document.getElementById("totalCostWithoutRec").innerText = `₹ ${totalCostWithoutRec.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("totalCostWithRec").innerText = `₹ ${totalCostWithRec.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("totalSavings").innerText = `₹ ${totalSavings.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("savingsPercentage").innerText = `${savingsPct.toFixed(2)}% total savings`;
  document.getElementById("totalBatchCost").innerText = `₹ ${totalBatchCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Export Summary to Excel
function exportToExcel() {
  const projectName = document.getElementById("projectName").value || "Pharma_API_RMC";
  const wb = XLSX.utils.book_new();
  const exportData = [];

  document.querySelectorAll(".stage-card").forEach((stageCard) => {
    const stageName = stageCard.querySelector("input[type='text']").value;
    exportData.push({ "Stage / Material": `--- ${stageName} ---` });

    const rows = stageCard.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      exportData.push({
        "Sr. No.": row.querySelector(".sr-no").innerText,
        "SAP Code": row.querySelector(".sap-code").value,
        "CAS No.": row.querySelector(".cas-no").value,
        "Name of RM": row.querySelector(".rm-name").value,
        "Qty (kg)": row.querySelector(".qty").value,
        "MW": row.querySelector(".mw").value,
        "Moles": row.querySelector(".moles").innerText,
        "Mole Ratio": row.querySelector(".mole-ratio").value,
        "Qty/Kg API": row.querySelector(".qty-per-kg").innerText,
        "% Solvent Rec": row.querySelector(".rec-percent").value,
        "Qty/Kg (with Rec)": row.querySelector(".qty-per-kg-rec").innerText,
        "Rate": row.querySelector(".rate").value,
        "Cost (w/o Rec)": row.querySelector(".cost-wo-rec").innerText,
        "Cost (with Rec)": row.querySelector(".cost-w-rec").innerText,
        "% Cont (w/o Rec)": row.querySelector(".cont-wo-rec").innerText,
        "% Cont (with Rec)": row.querySelector(".cont-w-rec").innerText,
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  XLSX.utils.book_append_sheet(wb, ws, "RMC_Calculation");
  XLSX.writeFile(wb, `${projectName.replace(/\s+/g, "_")}_RMC_Sheet.xlsx`);
}
