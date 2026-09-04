// Storage Key for Local Persistence
const STORAGE_KEY = "pharma_api_rmc_autosave_state_v2";

// Global State
let priceMaster = {};
let stageCount = 0;
let autoSaveTimeout = null;

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
  setupEventListeners();

  const loaded = loadFromLocalStorage();
  if (!loaded) {
    addNewStage("Stage-1: KSM Condensation");
  }
  refreshIcons();
});

function setupEventListeners() {
  document.getElementById("btnAddStage").addEventListener("click", () => {
    addNewStage(`Stage-${stageCount + 1}`);
    triggerAutoSave();
  });

  document.getElementById("apiBatchSize").addEventListener("input", () => {
    recalculateAll();
    triggerAutoSave();
  });

  document.getElementById("projectName").addEventListener("input", triggerAutoSave);
  document.getElementById("priceMasterFile").addEventListener("change", handleExcelUpload);
  document.getElementById("rmcImportFile").addEventListener("change", handleRmcSheetUpload);
  document.getElementById("btnExport").addEventListener("click", () => exportFullWorkbook());
  document.getElementById("btnExportBOM").addEventListener("click", () => exportConsolidatedBOMOnly());

  document.getElementById("stagesContainer").addEventListener("input", () => {
    triggerAutoSave();
  });
  document.getElementById("stagesContainer").addEventListener("change", () => {
    triggerAutoSave();
  });
}

// ----------------- RMC WORKBOOK IMPORT REVERSE-PARSER -----------------

function handleRmcSheetUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes("stage")) || workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        alert("Unable to find costing data in the uploaded workbook.");
        return;
      }

      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      if (!rows || rows.length < 4) {
        alert("The uploaded file does not match the expected RMC sheet structure.");
        return;
      }

      let parsedProjectName = "";
      let parsedBatchSize = "";

      if (rows[0] && rows[0][0]) {
        const titleStr = String(rows[0][0]);
        const match = titleStr.match(/^(.*?)\s*-\s*STAGE-WISE RAW MATERIAL/i);
        parsedProjectName = match ? match[1].trim() : titleStr.replace(/report/i, "").trim();
      }

      if (rows[1] && rows[1][0]) {
        const metaStr = String(rows[1][0]);
        const batchMatch = metaStr.match(/Target API Batch Size:\s*([\d.]+)/i);
        if (batchMatch) parsedBatchSize = batchMatch[1].trim();
      }

      const parsedStages = [];
      let currentStage = null;
      let inTable = false;

      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const cell0 = String(row[0] || "").trim();

        if (cell0.startsWith("STAGE:")) {
          const stageName = cell0.replace(/^STAGE:\s*/i, "").trim();
          currentStage = {
            stageName: stageName,
            prodName: "",
            prodMw: 0,
            actualQty: parsedBatchSize || "",
            materials: []
          };
          parsedStages.push(currentStage);
          inTable = false;
          continue;
        }

        if (cell0.startsWith("Product:") && currentStage) {
          const prodMatch = cell0.match(/Product:\s*(.*?)\s*\|\s*MW:\s*([\d.]+)\s*g\/mol\s*\|\s*Actual:\s*([\d.]+)\s*kg/i);
          if (prodMatch) {
            currentStage.prodName = prodMatch[1].trim();
            currentStage.prodMw = prodMatch[2].trim();
            currentStage.actualQty = prodMatch[3].trim();
          }
          continue;
        }

        if (cell0 === "Sr." && currentStage) {
          inTable = true;
          continue;
        }

        if (cell0.startsWith("OVERALL FINISHED")) {
          break;
        }

        if (inTable && currentStage) {
          const srNum = parseInt(cell0);
          if (isNaN(srNum)) {
            inTable = false;
            continue;
          }

          const cas = String(row[1] || "").trim();
          const name = String(row[2] || "").trim();
          const density = row[3] !== "" ? row[3] : 1.0;
          const ratioTypeRaw = String(row[4] || "").toLowerCase();
          const ratioType = ratioTypeRaw.includes("vol") ? "volume" : "mole";
          const moleVolRatio = row[5] !== "" ? row[5] : 1.0;
          const qty = row[6] !== "" ? row[6] : 0;
          const unit = String(row[7] || "kg").trim();
          const mw = row[8] !== "" ? row[8] : 0;
          const recPercent = row[11] !== "" ? row[11] : 0;
          const rateWo = row[13] !== "" ? row[13] : 0;
          const rateWith = row[14] !== "" ? row[14] : 0;

          currentStage.materials.push({
            cas,
            name,
            density,
            ratioType,
            moleVolRatio,
            qty,
            unit,
            mw,
            recPercent,
            rateWo,
            rateWith,
            isInHouse: cas.toLowerCase().includes("in-house")
          });
        }
      }

      if (parsedStages.length === 0) {
        alert("Could not identify any reaction stages. Verify that this file was exported by this tool.");
        return;
      }

      renderStagesFromState({
        projectName: parsedProjectName,
        apiBatchSize: parsedBatchSize,
        stages: parsedStages
      });

      triggerAutoSave();
      alert(`RMC Sheet loaded successfully! Restored ${parsedStages.length} reaction stages.`);
    } catch (err) {
      console.error("RMC Import Error:", err);
      alert("Error parsing RMC sheet. Please ensure it is a valid, uncorrupted Excel workbook.");
    }
  };
  reader.readAsArrayBuffer(file);
}

// ----------------- AUTO-SAVE & SESSION RESTORATION ENGINE -----------------

function triggerAutoSave() {
  const indicator = document.getElementById("autoSaveIndicator");
  if (indicator) {
    indicator.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 mr-1 animate-spin text-amber-400"></i> Saving...`;
    indicator.className = "inline-flex items-center text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full transition-all";
    refreshIcons();
  }

  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    saveToLocalStorage();
    if (indicator) {
      indicator.innerHTML = `<i data-lucide="check" class="w-3 h-3 mr-1 text-emerald-400"></i> Auto-saved`;
      indicator.className = "inline-flex items-center text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full transition-all";
      refreshIcons();
    }
  }, 400);
}

function saveToLocalStorage() {
  const stageCards = document.querySelectorAll(".stage-card");
  const stagesData = [];

  stageCards.forEach((card) => {
    const stageName = card.querySelector(".stage-name-input").value;
    const prodName = card.querySelector(".stage-prod-name").value;
    const prodMw = card.querySelector(".stage-prod-mw").value;
    const actualQty = card.querySelector(".stage-actual-qty").value;

    const materials = [];
    const rows = card.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      materials.push({
        cas: row.querySelector(".cas-no").value,
        name: row.querySelector(".rm-name").value,
        density: row.querySelector(".density").value,
        ratioType: row.querySelector(".ratio-type").value,
        moleVolRatio: row.querySelector(".mole-vol-ratio").value,
        qty: row.querySelector(".qty").value,
        unit: row.querySelector(".unit-select").value,
        mw: row.querySelector(".mw").value,
        recPercent: row.querySelector(".rec-percent").value,
        rateWo: row.querySelector(".rate-wo-rec").value,
        rateWith: row.querySelector(".rate-with-rec").value,
        isInHouse: row.dataset.isInHouse === "true"
      });
    });

    stagesData.push({
      stageName,
      prodName,
      prodMw,
      actualQty,
      materials
    });
  });

  const fullState = {
    projectName: document.getElementById("projectName").value,
    apiBatchSize: document.getElementById("apiBatchSize").value,
    priceMaster: priceMaster,
    stages: stagesData
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState));
  } catch (err) {
    console.error("Local storage error:", err);
  }
}

function loadFromLocalStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const state = JSON.parse(raw);
    if (!state || !state.stages || state.stages.length === 0) return false;

    if (state.priceMaster) {
      priceMaster = state.priceMaster;
      const count = Object.keys(priceMaster).length;
      if (count > 0) {
        document.getElementById("uploadLabel").innerText = `Loaded (${count} items)`;
      }
    }

    renderStagesFromState(state);
    return true;
  } catch (err) {
    console.error("Error restoring autosaved state:", err);
    return false;
  }
}

function renderStagesFromState(state) {
  if (state.projectName !== undefined) document.getElementById("projectName").value = state.projectName;
  if (state.apiBatchSize !== undefined) document.getElementById("apiBatchSize").value = state.apiBatchSize;

  const container = document.getElementById("stagesContainer");
  container.innerHTML = "";
  stageCount = 0;

  state.stages.forEach((savedStage) => {
    const stageId = addNewStage(savedStage.stageName || "Reaction Stage");
    const card = document.getElementById(stageId);
    if (!card) return;

    card.querySelector(".stage-prod-name").value = savedStage.prodName || "";
    card.querySelector(".stage-prod-mw").value = savedStage.prodMw || "0";
    card.querySelector(".stage-actual-qty").value = savedStage.actualQty || "";

    const tbody = card.querySelector("tbody");
    tbody.innerHTML = "";

    if (savedStage.materials && savedStage.materials.length > 0) {
      savedStage.materials.forEach((mat, idx) => {
        addMaterialRow(stageId);
        const currentRow = tbody.children[idx];
        if (!currentRow) return;

        currentRow.querySelector(".cas-no").value = mat.cas || "";
        currentRow.querySelector(".rm-name").value = mat.name || "";
        currentRow.querySelector(".density").value = mat.density || "1.0";
        currentRow.querySelector(".ratio-type").value = mat.ratioType || "mole";
        currentRow.querySelector(".mole-vol-ratio").value = mat.moleVolRatio || "1.00";
        currentRow.querySelector(".qty").value = mat.qty || "0";
        currentRow.querySelector(".unit-select").value = mat.unit || "kg";
        currentRow.querySelector(".mw").value = mat.mw || "0";
        currentRow.querySelector(".rec-percent").value = mat.recPercent || "0";
        currentRow.querySelector(".rate-wo-rec").value = mat.rateWo || "0";
        currentRow.querySelector(".rate-with-rec").value = mat.rateWith || "0";

        if (mat.isInHouse) {
          currentRow.dataset.isInHouse = "true";
          currentRow.classList.add("stage-lookup-badge");
        }
      });
    } else {
      addMaterialRow(stageId);
    }
  });

  updateStageBadgeNumbers();
  updateDatalistOptions();
  recalculateAll();
}

function resetProjectData() {
  const confirmReset = confirm("Are you sure you want to clear this project and start fresh? All typed data in this session will be removed.");
  if (!confirmReset) return;

  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ----------------- EXCEL PRICE MASTER & PARSING -----------------

function normalizeHeaderKey(str) {
  if (!str) return "";
  return str.toString().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function handleExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        alert("The uploaded Excel workbook has no sheets.");
        return;
      }

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rawRows.length === 0) {
        alert("The uploaded sheet appears to be empty. Please verify row contents.");
        return;
      }

      priceMaster = {};
      let matchedCount = 0;

      rawRows.forEach((row) => {
        const normalized = {};
        Object.keys(row).forEach((k) => {
          normalized[normalizeHeaderKey(k)] = row[k];
        });

        const name = (
          normalized["nameofrawmaterial"] ||
          normalized["rawmaterialname"] ||
          normalized["rmname"] ||
          normalized["name"] ||
          normalized["rawmaterial"] ||
          normalized["material"] ||
          normalized["item"] ||
          ""
        ).toString().trim();

        const cas = (
          normalized["casno"] ||
          normalized["casnumber"] ||
          normalized["cas"] ||
          normalized["casregistry"] ||
          ""
        ).toString().trim();

        const mw = parseFloat(
          normalized["molecularweight"] ||
          normalized["molweight"] ||
          normalized["mw"] ||
          normalized["molwt"] ||
          0
        ) || 0;

        const density = parseFloat(
          normalized["density"] ||
          normalized["spgravity"] ||
          normalized["specificgravity"] ||
          normalized["sg"] ||
          0
        ) || 0;

        const rate = parseFloat(
          normalized["ratekg"] ||
          normalized["rate"] ||
          normalized["pricekg"] ||
          normalized["price"] ||
          normalized["unitprice"] ||
          normalized["costkg"] ||
          normalized["cost"] ||
          0
        ) || 0;

        if (name) {
          priceMaster[name.toLowerCase()] = { name, cas, mw, density, rate };
          matchedCount++;
        }
      });

      if (matchedCount === 0) {
        alert("Failed to find valid Raw Material columns. Please click 'Download Template' to view expected column titles.");
        return;
      }

      document.getElementById("uploadLabel").innerText = `Loaded (${matchedCount} items)`;
      updateDatalistOptions();
      recalculateAll();
      triggerAutoSave();
      alert(`Success! Loaded ${matchedCount} Raw Materials into the Price Master.`);
    } catch (err) {
      console.error("Excel Upload Error:", err);
      alert("Error parsing file. Ensure it is a valid .xlsx or .csv format.");
    }
  };
  reader.readAsArrayBuffer(file);
}

function downloadSampleRateCard() {
  const sampleData = [
    { "CAS No": "67-56-1", "Name of Raw Material": "Methanol", "Molecular Weight": 32.04, "Density": 0.792, "Rate/Kg": 42.00 },
    { "CAS No": "75-09-2", "Name of Raw Material": "Dichloromethane", "Molecular Weight": 84.93, "Density": 1.326, "Rate/Kg": 68.50 },
    { "CAS No": "108-88-3", "Name of Raw Material": "Toluene", "Molecular Weight": 92.14, "Density": 0.867, "Rate/Kg": 88.00 },
    { "CAS No": "141-78-6", "Name of Raw Material": "Ethyl Acetate", "Molecular Weight": 88.11, "Density": 0.902, "Rate/Kg": 94.00 },
    { "CAS No": "67-64-1", "Name of Raw Material": "Acetone", "Molecular Weight": 58.08, "Density": 0.784, "Rate/Kg": 72.00 },
    { "CAS No": "121-44-8", "Name of Raw Material": "Triethylamine", "Molecular Weight": 101.19, "Density": 0.726, "Rate/Kg": 210.00 },
    { "CAS No": "16940-66-2", "Name of Raw Material": "Sodium Borohydride", "Molecular Weight": 37.83, "Density": 1.070, "Rate/Kg": 850.00 },
    { "CAS No": "25952-53-8", "Name of Raw Material": "EDC HCl", "Molecular Weight": 191.70, "Density": 1.000, "Rate/Kg": 2800.00 },
    { "CAS No": "7647-01-0", "Name of Raw Material": "Hydrochloric Acid (35%)", "Molecular Weight": 36.46, "Density": 1.180, "Rate/Kg": 14.00 },
    { "CAS No": "125971-94-0", "Name of Raw Material": "Key Starting Material (KSM-1)", "Molecular Weight": 425.50, "Density": 1.000, "Rate/Kg": 6500.00 }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData);
  ws["!cols"] = [{ wch: 16 }, { wch: 32 }, { wch: 18 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, "RM_Price_Master");
  XLSX.writeFile(wb, "Standard_RM_Rate_Master_Template.xlsx");
}

function updateDatalistOptions() {
  const dataList = document.getElementById("rmMasterList");
  dataList.innerHTML = "";

  Object.values(priceMaster).forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.name;
    opt.label = `Master RM (Rate: ₹${item.rate})`;
    dataList.appendChild(opt);
  });

  document.querySelectorAll(".stage-card").forEach((card) => {
    const stageName = card.querySelector(".stage-name-input").value.trim();
    const prodName = card.querySelector(".stage-prod-name").value.trim();
    const costWo = card.dataset.unitCostWoRec || "0.00";
    const costW = card.dataset.unitCostWithRec || "0.00";

    if (prodName) {
      const opt = document.createElement("option");
      opt.value = prodName;
      opt.label = `Intermediate (w/o Rec: ₹${costWo} \vert{} with Rec: ₹${costW})`;
      dataList.appendChild(opt);
    }
    if (stageName && stageName.toLowerCase() !== prodName.toLowerCase()) {
      const opt = document.createElement("option");
      opt.value = stageName;
      opt.label = `Stage Ref (w/o Rec: ₹${costWo} \vert{} with Rec: ₹${costW})`;
      dataList.appendChild(opt);
    }
  });
}

// ----------------- STAGE MANAGEMENT -----------------

function addNewStage(defaultStageName) {
  stageCount++;
  const stageId = `stage_${Date.now()}_${stageCount}`;
  const container = document.getElementById("stagesContainer");

  const stageCard = document.createElement("div");
  stageCard.className = "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden stage-card";
  stageCard.id = stageId;
  stageCard.dataset.unitCostWoRec = "0.00";
  stageCard.dataset.unitCostWithRec = "0.00";

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
            <th>Rate w/o Rec.<br/>(₹/Unit)</th>
            <th>Rate with Rec.<br/>(₹/Unit)</th>
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
          <input type="number" step="any" class="stage-actual-qty w-full border rounded px-2 py-1 text-xs font-bold text-indigo-700 bg-white text-right" placeholder="e.g. 50" oninput="recalculateAll()" />
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
        <div class="flex items-center space-x-3">
          <span><strong>Cost/Kg (w/o Rec):</strong> <span class="stage-unit-cost-wo font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">₹ 0.00</span></span>
          <span><strong>Cost/Kg (with Rec):</strong> <span class="stage-unit-cost-w font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">₹ 0.00</span></span>
          <span><strong>% w/w Yield:</strong> <span class="stage-ww-yield font-bold text-indigo-700">0.00%</span></span>
          <span><strong>Stage PMI:</strong> <span class="stage-pmi font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">0.00</span> kg/kg</span>
        </div>
      </div>
    </div>
  `;

  container.appendChild(stageCard);
  addMaterialRow(stageId);
  updateStageBadgeNumbers();
  updateDatalistOptions();
  refreshIcons();
  return stageId;
}

function removeStage(stageId) {
  const stage = document.getElementById(stageId);
  if (stage) {
    stage.remove();
    updateStageBadgeNumbers();
    updateDatalistOptions();
    recalculateAll();
    triggerAutoSave();
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
  triggerAutoSave();
}

// ----------------- RAW MATERIAL ROW MANAGEMENT -----------------

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
        value="${isFirstRow ? '1.0' : '0'}" 
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
    <td><input type="number" step="any" class="rate-wo-rec w-16 text-right font-medium" value="0" oninput="onRateInput(this, 'wo')" /></td>
    <td><input type="number" step="any" class="rate-with-rec w-16 text-right font-medium text-emerald-700" value="0" oninput="onRateInput(this, 'with')" /></td>
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
  triggerAutoSave();
}

function onRateInput(inputElem, type) {
  const row = inputElem.closest("tr");
  const isInHouse = row.dataset.isInHouse === "true";

  if (!isInHouse && type === "wo") {
    row.querySelector(".rate-with-rec").value = inputElem.value;
  }
  recalculateAll();
}

function autoFillRM(input) {
  const row = input.closest("tr");
  const currentCard = input.closest(".stage-card");
  const val = input.value.trim().toLowerCase();
  if (!val) return;

  // 1. Check in-page stage cards
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
    const prodName = matchedStage.querySelector(".stage-prod-name").value.trim();
    const prodMw = parseFloat(matchedStage.querySelector(".stage-prod-mw").value) || 0;
    const stageCostWoRec = parseFloat(matchedStage.dataset.unitCostWoRec) || 0;
    const stageCostWithRec = parseFloat(matchedStage.dataset.unitCostWithRec) || 0;

    row.querySelector(".rm-name").value = prodName;
    row.querySelector(".cas-no").value = "In-house Int.";
    if (prodMw > 0) row.querySelector(".mw").value = prodMw;
    row.querySelector(".rate-wo-rec").value = stageCostWoRec.toFixed(2);
    row.querySelector(".rate-with-rec").value = stageCostWithRec.toFixed(2);
    row.querySelector(".density").value = "1.0";
    row.classList.add("stage-lookup-badge");
    row.dataset.isInHouse = "true";

    recalculateAll();
    triggerAutoSave();
    return;
  }

  row.dataset.isInHouse = "false";
  row.classList.remove("stage-lookup-badge");

  // 2. Check Master Sheet
  if (priceMaster[val]) {
    const item = priceMaster[val];
    row.querySelector(".cas-no").value = item.cas || "";
    row.querySelector(".mw").value = item.mw || 0;
    if (item.density > 0) row.querySelector(".density").value = item.density;
    row.querySelector(".rate-wo-rec").value = item.rate || 0;
    row.querySelector(".rate-with-rec").value = item.rate || 0;
  }

  // 3. Check Solvent Database
  if (SOLVENT_DENSITIES[val]) {
    row.querySelector(".density").value = SOLVENT_DENSITIES[val];
    row.querySelector(".ratio-type").value = "volume";
    row.querySelector(".unit-select").value = "L";
  }

  recalculateAll();
  triggerAutoSave();
}

// ----------------- AUTOMATED ENGINES -----------------

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
  triggerAutoSave();
  alert(`All stages scaled via reverse-yield cascade to produce ${targetApiKg} kg API.`);
}

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
        triggerAutoSave();
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
      triggerAutoSave();
    }
  } catch (err) {
    console.error(err);
    alert("Online search failed. Please enter details manually.");
  } finally {
    btn.innerHTML = originalIcon;
    refreshIcons();
  }
}

// ----------------- CALCULATION ENGINE -----------------

function recalculateAll() {
  const apiBatchSize = parseFloat(document.getElementById("apiBatchSize").value) || 1;
  const stageCards = Array.from(document.querySelectorAll(".stage-card"));

  let grandTotalCostWithoutRec = 0;
  let grandTotalCostWithRec = 0;
  let globalTotalInputMassKg = 0;

  stageCards.forEach((stageCard) => {
    const rows = Array.from(stageCard.querySelectorAll("tbody tr"));
    if (rows.length === 0) return;

    rows.forEach((row) => {
      const val = row.querySelector(".rm-name").value.trim().toLowerCase();
      if (!val) return;

      stageCards.forEach((otherCard) => {
        if (otherCard === stageCard) return;
        const otherStageName = otherCard.querySelector(".stage-name-input").value.trim().toLowerCase();
        const otherProdName = otherCard.querySelector(".stage-prod-name").value.trim().toLowerCase();

        if (val === otherStageName || val === otherProdName) {
          const freshCostWo = parseFloat(otherCard.dataset.unitCostWoRec) || 0;
          const freshCostWith = parseFloat(otherCard.dataset.unitCostWithRec) || 0;
          const freshMw = parseFloat(otherCard.querySelector(".stage-prod-mw").value) || 0;

          if (freshCostWo > 0) row.querySelector(".rate-wo-rec").value = freshCostWo.toFixed(2);
          if (freshCostWith > 0) row.querySelector(".rate-with-rec").value = freshCostWith.toFixed(2);
          if (freshMw > 0) row.querySelector(".mw").value = freshMw;
        }
      });
    });

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
    let stageTotalCostWoRec = 0;
    let stageTotalCostWithRec = 0;

    rows.forEach((row, index) => {
      const isFirst = index === 0;
      const unit = row.querySelector(".unit-select").value;
      const density = parseFloat(row.querySelector(".density").value) || 1.0;
      const mw = parseFloat(row.querySelector(".mw").value) || 0;
      const ratioType = row.querySelector(".ratio-type").value;
      const ratioVal = parseFloat(row.querySelector(".mole-vol-ratio").value) || 0;
      const recPercent = parseFloat(row.querySelector(".rec-percent").value) || 0;
      const rateWo = parseFloat(row.querySelector(".rate-wo-rec").value) || 0;
      const rateWith = parseFloat(row.querySelector(".rate-with-rec").value) || 0;

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

      const costWithoutRec = (qty / apiBatchSize) * rateWo;
      const costWithRec = (qty / apiBatchSize) * (1 - recPercent / 100) * rateWith;

      row.querySelector(".qty-per-kg").innerText = qtyPerKg.toFixed(4);
      row.querySelector(".qty-per-kg-rec").innerText = qtyPerKgRec.toFixed(4);
      row.querySelector(".cost-wo-rec").innerText = costWithoutRec.toFixed(2);
      row.querySelector(".cost-w-rec").innerText = costWithRec.toFixed(2);

      const isInHouse = row.dataset.isInHouse === "true";
      if (!isInHouse) {
        grandTotalCostWithoutRec += costWithoutRec;
        grandTotalCostWithRec += costWithRec;
      }

      stageTotalCostWoRec += (qty * rateWo);
      stageTotalCostWithRec += (qty * rateWith) * (1 - recPercent / 100);
    });

    globalTotalInputMassKg += stageTotalMassInKg;

    const prodMW = parseFloat(stageCard.querySelector(".stage-prod-mw").value) || 0;
    const actualOutKg = parseFloat(stageCard.querySelector(".stage-actual-qty").value) || 0;

    const theorOutKg = (refMoles > 0 && prodMW > 0) ? (refMoles * prodMW) / 1000 : 0;
    const actualMoles = (actualOutKg > 0 && prodMW > 0) ? (actualOutKg * 1000) / prodMW : 0;

    const molarYieldPct = refMoles > 0 ? (actualMoles / refMoles) * 100 : 0;
    const wwYieldPct = refQtyInKg > 0 ? (actualOutKg / refQtyInKg) * 100 : 0;

    const massLossKg = Math.max(0, stageTotalMassInKg - (actualOutKg + stageTotalRecoveredKg));
    const stagePMI = actualOutKg > 0 ? stageTotalMassInKg / actualOutKg : 0;

    const stageUnitCostWoRec = actualOutKg > 0 ? stageTotalCostWoRec / actualOutKg : 0;
    const stageUnitCostWithRec = actualOutKg > 0 ? stageTotalCostWithRec / actualOutKg : 0;

    stageCard.dataset.unitCostWoRec = stageUnitCostWoRec.toFixed(2);
    stageCard.dataset.unitCostWithRec = stageUnitCostWithRec.toFixed(2);

    stageCard.querySelector(".stage-theor-qty").innerText = `${theorOutKg.toFixed(2)} kg`;
    const molarYieldBadge = stageCard.querySelector(".stage-molar-yield");
    molarYieldBadge.innerText = `${molarYieldPct.toFixed(2)}%`;
    molarYieldBadge.className = `stage-molar-yield yield-badge ${molarYieldPct >= 85 ? 'yield-high' : molarYieldPct >= 70 ? 'yield-med' : 'yield-low'}`;

    stageCard.querySelector(".stage-ww-yield").innerText = `${wwYieldPct.toFixed(2)}%`;
    stageCard.querySelector(".stage-unit-cost-wo").innerText = `₹ ${stageUnitCostWoRec.toFixed(2)}/kg`;
    stageCard.querySelector(".stage-unit-cost-w").innerText = `₹ ${stageUnitCostWithRec.toFixed(2)}/kg`;
    stageCard.querySelector(".stage-mass-in").innerText = `${stageTotalMassInKg.toFixed(2)} kg`;
    stageCard.querySelector(".stage-mass-rec").innerText = `${stageTotalRecoveredKg.toFixed(2)} kg`;
    stageCard.querySelector(".stage-mass-loss").innerText = `${massLossKg.toFixed(2)} kg`;
    stageCard.querySelector(".stage-pmi").innerText = stagePMI.toFixed(2);
  });

  document.querySelectorAll(".stage-card tbody tr").forEach((row) => {
    const costWo = parseFloat(row.querySelector(".cost-wo-rec").innerText) || 0;
    const costW = parseFloat(row.querySelector(".cost-w-rec").innerText) || 0;

    const contWo = grandTotalCostWithoutRec > 0 ? (costWo / grandTotalCostWithoutRec) * 100 : 0;
    const contW = grandTotalCostWithRec > 0 ? (costW / grandTotalCostWithRec) * 100 : 0;

    row.querySelector(".cont-wo-rec").innerText = `${contWo.toFixed(2)}%`;
    row.querySelector(".cont-w-rec").innerText = `${contW.toFixed(2)}%`;
  });

  const totalSavings = grandTotalCostWithoutRec - grandTotalCostWithRec;
  const savingsPct = grandTotalCostWithoutRec > 0 ? (totalSavings / grandTotalCostWithoutRec) * 100 : 0;
  const cumulativePMI = apiBatchSize > 0 ? globalTotalInputMassKg / apiBatchSize : 0;

  document.getElementById("totalCostWithoutRec").innerText = `₹ ${grandTotalCostWithoutRec.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("totalCostWithRec").innerText = `₹ ${grandTotalCostWithRec.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("totalSavings").innerText = `₹ ${totalSavings.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("savingsPercentage").innerText = `${savingsPct.toFixed(2)}% total savings`;
  document.getElementById("cumulativePMI").innerText = cumulativePMI.toFixed(2);
}

// ----------------- EXCEL WORKBOOK GENERATION -----------------

function getConsolidatedBOMData() {
  const consolidated = {};
  const stageCards = document.querySelectorAll(".stage-card");

  stageCards.forEach((card, stageIdx) => {
    const stageName = card.querySelector(".stage-name-input").value.trim() || `Stage ${stageIdx + 1}`;
    const rows = card.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      const rawName = row.querySelector(".rm-name").value.trim();
      if (!rawName) return;

      const cas = row.querySelector(".cas-no").value.trim();
      const unit = row.querySelector(".unit-select").value;
      const density = parseFloat(row.querySelector(".density").value) || 1.0;
      const qty = parseFloat(row.querySelector(".qty").value) || 0;
      const recPercent = parseFloat(row.querySelector(".rec-percent").value) || 0;
      const rateWo = parseFloat(row.querySelector(".rate-wo-rec").value) || 0;
      const rateWith = parseFloat(row.querySelector(".rate-with-rec").value) || 0;
      const isInHouse = row.dataset.isInHouse === "true" || cas.toLowerCase().includes("in-house");

      const key = `${rawName.toLowerCase()}___${unit.toLowerCase()}`;

      if (!consolidated[key]) {
        consolidated[key] = {
          name: rawName,
          cas: cas,
          unit: unit,
          density: density,
          isInHouse: isInHouse,
          grossQty: 0,
          recoveredQty: 0,
          netQty: 0,
          rateWo: rateWo,
          rateWith: rateWith,
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
      item.costWithoutRec += (qty * rateWo);
      item.costWithRec += (netAmt * rateWith);
      item.stagesUsed.add(stageName);

      if (cas && !item.cas) item.cas = cas;
      if (rateWo > 0) item.rateWo = rateWo;
      if (rateWith > 0) item.rateWith = rateWith;
    });
  });

  return Object.values(consolidated);
}

function buildConsolidatedSheet(wb, projectName, apiBatchSize) {
  const bomData = getConsolidatedBOMData();

  const styles = {
    title: { font: { name: "Arial", sz: 13, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "064E3B" } }, alignment: { horizontal: "center", vertical: "center" } },
    meta: { font: { name: "Arial", sz: 9, bold: true, color: { rgb: "1E293B" } }, fill: { fgColor: { rgb: "F1F5F9" } }, alignment: { vertical: "center" } },
    tableHeader: { font: { name: "Arial", sz: 8.5, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "065F46" } }, alignment: { horizontal: "center", vertical: "center", wrapText: true } },
    dataText: { font: { name: "Arial", sz: 8 }, alignment: { vertical: "center" } },
    dataNum: { font: { name: "Arial", sz: 8 }, alignment: { horizontal: "right", vertical: "center" } },
    dataTotal: { font: { name: "Arial", sz: 9, bold: true, color: { rgb: "064E3B" } }, fill: { fgColor: { rgb: "ECFDF5" } }, alignment: { horizontal: "right", vertical: "center" } }
  };

  const wsData = [];
  const merges = [];

  wsData.push([`${projectName.toUpperCase()} - CONSOLIDATED RAW MATERIAL BILL OF MATERIALS (BOM)`]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } });

  wsData.push([`Target API Batch Size: ${apiBatchSize} kg`, `Date Generated: ${new Date().toLocaleDateString()}`, "", "", "", "", "", "", "", "", "", ""]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 3 } });
  merges.push({ s: { r: 1, c: 4 }, e: { r: 1, c: 11 } });
  wsData.push([]);

  const headers = [
    "Sr.", "CAS No.", "Raw Material Description", "Type",
    "Total Gross Qty Required", "Unit", "Total Recovered Qty",
    "Net Fresh Qty Required", "Rate w/o Rec (₹)", "Rate with Rec (₹)", "Total Cost w/o Rec (₹)", "Total Cost with Rec (₹)", "Stages Consumed In"
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
      item.cas || "-",
      item.name,
      typeLabel,
      parseFloat(item.grossQty.toFixed(3)),
      item.unit,
      parseFloat(item.recoveredQty.toFixed(3)),
      parseFloat(item.netQty.toFixed(3)),
      parseFloat(item.rateWo.toFixed(2)),
      parseFloat(item.rateWith.toFixed(2)),
      parseFloat(item.costWithoutRec.toFixed(2)),
      parseFloat(item.costWithRec.toFixed(2)),
      Array.from(item.stagesUsed).join(", ")
    ]);
  });

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
    { wch: 6 }, { wch: 14 }, { wch: 30 }, { wch: 20 },
    { wch: 18 }, { wch: 8 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 14 },
    { wch: 18 }, { wch: 18 }, { wch: 30 }
  ];

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
    "Sr.", "CAS No.", "Raw Material Name", "Density (g/mL)",
    "Ratio Type", "Mole / Vol Ratio", "Qty", "Unit", "MW (g/mol)",
    "Moles", "Qty/Kg API", "% Solvent Rec.", "Qty/Kg API (with Rec.)",
    "Rate w/o Rec (₹)", "Rate with Rec (₹)", "Cost (w/o Rec.)", "Cost (with Rec.)", "% Cont (w/o Rec.)", "% Cont (with Rec.)"
  ];

  document.querySelectorAll(".stage-card").forEach((card) => {
    const stageName = card.querySelector(".stage-name-input").value;
    const prodName = card.querySelector(".stage-prod-name").value;
    const prodMw = card.querySelector(".stage-prod-mw").value;
    const actualKg = card.querySelector(".stage-actual-qty").value;
    const theorKg = card.querySelector(".stage-theor-qty").innerText;
    const molarYield = card.querySelector(".stage-molar-yield").innerText;
    const wwYield = card.querySelector(".stage-ww-yield").innerText;
    const unitCostWo = card.querySelector(".stage-unit-cost-wo").innerText;
    const unitCostW = card.querySelector(".stage-unit-cost-w").innerText;
    const stagePmi = card.querySelector(".stage-pmi").innerText;

    const stageTitleRowIndex = wsData.length;
    wsData.push([`STAGE: ${stageName.toUpperCase()}`]);
    merges.push({ s: { r: stageTitleRowIndex, c: 0 }, e: { r: stageTitleRowIndex, c: 18 } });

    const stageParamRowIndex = wsData.length;
    wsData.push([`Product: ${prodName} | MW: ${prodMw} g/mol \vert{} Actual:${actualKg} kg | Theor: ${theorKg} \vert{} \% Molar Yield:${molarYield} | % w/w: ${wwYield} \vert{} Cost w/o Rec:${unitCostWo} | Cost with Rec: ${unitCostW} \vert{} Stage PMI:${stagePmi}`]);
    merges.push({ s: { r: stageParamRowIndex, c: 0 }, e: { r: stageParamRowIndex, c: 18 } });

    wsData.push(headers);

    const rows = card.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      wsData.push([
        row.querySelector(".sr-no").innerText,
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
        parseFloat(row.querySelector(".rate-wo-rec").value) || 0,
        parseFloat(row.querySelector(".rate-with-rec").value) || 0,
        parseFloat(row.querySelector(".cost-wo-rec").innerText) || 0,
        parseFloat(row.querySelector(".cost-with-rec").innerText) || 0,
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
    { wch: 6 }, { wch: 14 }, { wch: 28 }, { wch: 11 },
    { wch: 13 }, { wch: 12 }, { wch: 10 }, { wch: 6 }, { wch: 10 },
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
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
      else if (val === "Sr." || val === "Raw Material Name") {
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

function exportFullWorkbook() {
  const projectName = document.getElementById("projectName").value || "Pharma API RMC";
  const apiBatchSize = document.getElementById("apiBatchSize").value || "Target";
  const wb = XLSX.utils.book_new();

  const stageWs = buildStageWiseSheet(projectName, apiBatchSize);
  XLSX.utils.book_append_sheet(wb, stageWs, "Stage_Costing_Breakdown");

  const bomWs = buildConsolidatedSheet(wb, projectName, apiBatchSize);
  XLSX.utils.book_append_sheet(wb, bomWs, "Consolidated_BOM");

  XLSX.writeFile(wb, `${projectName.replace(/\s+/g, "_")}_${apiBatchSize}kg_RMC_Full_Workbook.xlsx`);
}

function exportConsolidatedBOMOnly() {
  const projectName = document.getElementById("projectName").value || "Pharma API RMC";
  const apiBatchSize = document.getElementById("apiBatchSize").value || "Target";
  const wb = XLSX.utils.book_new();

  const bomWs = buildConsolidatedSheet(wb, projectName, apiBatchSize);
  XLSX.utils.book_append_sheet(wb, bomWs, "Consolidated_Procurement_BOM");

  XLSX.writeFile(wb, `${projectName.replace(/\s+/g, "_")}_${apiBatchSize}kg_Consolidated_BOM.xlsx`);
}
