// Storage Key for Local Persistence
const STORAGE_KEY = "pharma_api_rmc_autosave_state_v3";

// Global State
let priceMaster = {};
let stageCount = 0;
let autoSaveTimeout = null;

// =========================================================================
// 150+ PHARMA REAGENTS, SOLVENTS, BASES, ACIDS, CATALYSTS & SALTS DATABASE
// =========================================================================
const PHARMA_CHEM_DB = {
  // --- Catalysts & Transition Metal Reagents ---
  "5% palladium on alumina": { cas: "7440-05-3", mw: 106.42, density: 1.0, isLiquid: false, aliases: ["5% pd/al2o3", "palladium on alumina 5%", "pd/al2o3 5%"] },
  "10% palladium on alumina": { cas: "7440-05-3", mw: 106.42, density: 1.0, isLiquid: false, aliases: ["10% pd/al2o3", "palladium on alumina 10%"] },
  "palladium on alumina": { cas: "7440-05-3", mw: 106.42, density: 1.0, isLiquid: false, aliases: ["pd/al2o3"] },
  "5% palladium on carbon": { cas: "7440-05-3", mw: 106.42, density: 1.0, isLiquid: false, aliases: ["5% pd/c", "pd/c 5%", "5% pd-c"] },
  "10% palladium on carbon": { cas: "7440-05-3", mw: 106.42, density: 1.0, isLiquid: false, aliases: ["10% pd/c", "pd/c 10%", "10% pd-c", "pd/c"] },
  "palladium(ii) acetate": { cas: "3375-31-3", mw: 224.51, density: 1.0, isLiquid: false, aliases: ["pd(oac)2", "palladium acetate"] },
  "tetrakis(triphenylphosphine)palladium(0)": { cas: "14221-01-3", mw: 1155.56, density: 1.0, isLiquid: false, aliases: ["pd(pph3)4", "tetrakis"] },
  "bis(triphenylphosphine)palladium(ii) dichloride": { cas: "13965-03-2", mw: 701.90, density: 1.0, isLiquid: false, aliases: ["pdcl2(pph3)2"] },
  "[1,1'-bis(diphenylphosphino)ferrocene]dichloropalladium(ii)": { cas: "72287-26-4", mw: 731.70, density: 1.0, isLiquid: false, aliases: ["pd(dppf)cl2", "pd(dppf)cl2.dcm"] },
  "tris(dibenzylideneacetone)dipalladium(0)": { cas: "51364-51-3", mw: 915.72, density: 1.0, isLiquid: false, aliases: ["pd2(dba)3"] },
  "platinum(iv) oxide": { cas: "1314-15-4", mw: 227.08, density: 1.0, isLiquid: false, aliases: ["adams catalyst", "pto2"] },
  "5% platinum on carbon": { cas: "7440-06-4", mw: 195.08, density: 1.0, isLiquid: false, aliases: ["5% pt/c", "pt/c 5%"] },
  "raney nickel": { cas: "7440-02-0", mw: 58.69, density: 1.0, isLiquid: false, aliases: ["raney ni", "active nickel"] },
  "copper(i) iodide": { cas: "7681-65-4", mw: 190.45, density: 1.0, isLiquid: false, aliases: ["cui"] },

  // --- Common Industrial Solvents ---
  "methanol": { cas: "67-56-1", mw: 32.04, density: 0.792, isLiquid: true, aliases: ["meoh", "methyl alcohol"] },
  "ethanol": { cas: "64-17-5", mw: 46.07, density: 0.789, isLiquid: true, aliases: ["etoh", "ethyl alcohol"] },
  "isopropanol": { cas: "67-63-0", mw: 60.10, density: 0.786, isLiquid: true, aliases: ["ipa", "isopropyl alcohol", "2-propanol"] },
  "n-butanol": { cas: "71-36-3", mw: 74.12, density: 0.810, isLiquid: true, aliases: ["1-butanol", "n-buoh"] },
  "tert-butanol": { cas: "75-65-0", mw: 74.12, density: 0.786, isLiquid: true, aliases: ["t-buoh", "tertiary butanol"] },
  "acetone": { cas: "67-64-1", mw: 58.08, density: 0.784, isLiquid: true, aliases: ["dimethyl ketone", "2-propanone"] },
  "methyl ethyl ketone": { cas: "78-93-3", mw: 72.11, density: 0.805, isLiquid: true, aliases: ["mek", "butan-2-one"] },
  "methyl isobutyl ketone": { cas: "108-10-1", mw: 100.16, density: 0.802, isLiquid: true, aliases: ["mibk"] },
  "dichloromethane": { cas: "75-09-2", mw: 84.93, density: 1.326, isLiquid: true, aliases: ["dcm", "mdc", "methylene dichloride"] },
  "chloroform": { cas: "67-66-3", mw: 119.38, density: 1.489, isLiquid: true, aliases: ["trichloromethane", "chcl3"] },
  "1,2-dichloroethane": { cas: "107-06-2", mw: 98.96, density: 1.253, isLiquid: true, aliases: ["edc solvent", "ethylene dichloride"] },
  "ethyl acetate": { cas: "141-78-6", mw: 88.11, density: 0.902, isLiquid: true, aliases: ["ea", "etac", "etadd"] },
  "isopropyl acetate": { cas: "108-21-4", mw: 102.13, density: 0.872, isLiquid: true, aliases: ["ipac"] },
  "methyl acetate": { cas: "79-20-9", mw: 74.08, density: 0.932, isLiquid: true, aliases: ["meac"] },
  "tetrahydrofuran": { cas: "109-99-9", mw: 72.11, density: 0.886, isLiquid: true, aliases: ["thf", "oxolane"] },
  "2-methyltetrahydrofuran": { cas: "96-47-9", mw: 86.13, density: 0.854, isLiquid: true, aliases: ["2-methf", "me-thf"] },
  "1,4-dioxane": { cas: "123-91-1", mw: 88.11, density: 1.033, isLiquid: true, aliases: ["dioxane"] },
  "diethyl ether": { cas: "60-29-7", mw: 74.12, density: 0.713, isLiquid: true, aliases: ["ether", "et2o"] },
  "methyl tert-butyl ether": { cas: "1634-04-4", mw: 88.15, density: 0.740, isLiquid: true, aliases: ["mtbe"] },
  "diisopropyl ether": { cas: "108-20-3", mw: 102.17, density: 0.725, isLiquid: true, aliases: ["dipe"] },
  "toluene": { cas: "108-88-3", mw: 92.14, density: 0.867, isLiquid: true, aliases: ["methylbenzene", "phme"] },
  "o-xylene": { cas: "95-47-6", mw: 106.16, density: 0.880, isLiquid: true, aliases: ["xylene", "xylenes"] },
  "hexane": { cas: "110-54-3", mw: 86.18, density: 0.655, isLiquid: true, aliases: ["n-hexane"] },
  "heptane": { cas: "142-82-5", mw: 100.20, density: 0.684, isLiquid: true, aliases: ["n-heptane"] },
  "cyclohexane": { cas: "110-82-7", mw: 84.16, density: 0.779, isLiquid: true, aliases: ["c-hexane"] },
  "acetonitrile": { cas: "75-05-8", mw: 41.05, density: 0.786, isLiquid: true, aliases: ["acn", "mecn"] },
  "n,n-dimethylformamide": { cas: "68-12-2", mw: 73.09, density: 0.944, isLiquid: true, aliases: ["dmf"] },
  "n,n-dimethylacetamide": { cas: "127-19-5", mw: 87.12, density: 0.937, isLiquid: true, aliases: ["dmac", "dma"] },
  "n-methyl-2-pyrrolidone": { cas: "872-50-4", mw: 99.13, density: 1.028, isLiquid: true, aliases: ["nmp"] },
  "dimethyl sulfoxide": { cas: "67-68-5", mw: 78.13, density: 1.100, isLiquid: true, aliases: ["dmso"] },
  "sulfolane": { cas: "126-33-0", mw: 120.17, density: 1.261, isLiquid: true, aliases: ["tetramethylene sulfone"] },
  "water": { cas: "7732-18-5", mw: 18.02, density: 1.000, isLiquid: true, aliases: ["purified water", "dm water", "h2o"] },

  // --- Organic & Inorganic Bases ---
  "triethylamine": { cas: "121-44-8", mw: 101.19, density: 0.726, isLiquid: true, aliases: ["tea", "et3n"] },
  "diisopropylethylamine": { cas: "7087-68-5", mw: 129.24, density: 0.755, isLiquid: true, aliases: ["dipea", "hunig's base", "hünig base"] },
  "pyridine": { cas: "110-86-1", mw: 79.10, density: 0.982, isLiquid: true, aliases: ["py"] },
  "1,8-diazabicyclo[5.4.0]undec-7-ene": { cas: "6674-22-2", mw: 152.24, density: 1.018, isLiquid: true, aliases: ["dbu"] },
  "1,5-diazabicyclo[4.3.0]non-5-ene": { cas: "3001-72-7", mw: 124.18, density: 1.005, isLiquid: true, aliases: ["dbn"] },
  "4-dimethylaminopyridine": { cas: "1122-58-3", mw: 122.17, density: 1.0, isLiquid: false, aliases: ["dmap"] },
  "n-methylmorpholine": { cas: "109-02-4", mw: 101.15, density: 0.920, isLiquid: true, aliases: ["nmm"] },
  "potassium carbonate": { cas: "584-08-7", mw: 138.21, density: 1.0, isLiquid: false, aliases: ["k2co3"] },
  "sodium carbonate": { cas: "497-19-8", mw: 105.99, density: 1.0, isLiquid: false, aliases: ["na2co3", "soda ash"] },
  "cesium carbonate": { cas: "534-17-8", mw: 325.82, density: 1.0, isLiquid: false, aliases: ["cs2co3"] },
  "sodium bicarbonate": { cas: "144-55-8", mw: 84.01, density: 1.0, isLiquid: false, aliases: ["nahco3", "baking soda"] },
  "potassium bicarbonate": { cas: "298-14-6", mw: 100.11, density: 1.0, isLiquid: false, aliases: ["khco3"] },
  "sodium hydroxide": { cas: "1310-73-2", mw: 40.00, density: 1.0, isLiquid: false, aliases: ["naoh", "caustic soda"] },
  "potassium hydroxide": { cas: "1310-58-3", mw: 56.11, density: 1.0, isLiquid: false, aliases: ["koh", "caustic potash"] },
  "sodium tert-butoxide": { cas: "865-48-5", mw: 96.10, density: 1.0, isLiquid: false, aliases: ["naotbu"] },
  "potassium tert-butoxide": { cas: "865-47-4", mw: 112.21, density: 1.0, isLiquid: false, aliases: ["kotbu"] },
  "sodium hydride": { cas: "7646-69-7", mw: 24.00, density: 1.0, isLiquid: false, aliases: ["nah", "60% nah"] },
  "lithium diisopropylamide": { cas: "4111-54-0", mw: 107.14, density: 0.790, isLiquid: true, aliases: ["lda"] },

  // --- Acids & Acid Chlorides ---
  "hydrochloric acid (35%)": { cas: "7647-01-0", mw: 36.46, density: 1.180, isLiquid: true, aliases: ["hcl", "concentrated hcl", "35% hcl", "hydrochloric acid"] },
  "sulfuric acid": { cas: "7664-93-9", mw: 98.08, density: 1.840, isLiquid: true, aliases: ["h2so4", "conc h2so4"] },
  "nitric acid": { cas: "7697-37-2", mw: 63.01, density: 1.420, isLiquid: true, aliases: ["hno3"] },
  "phosphoric acid (85%)": { cas: "7664-38-2", mw: 98.00, density: 1.685, isLiquid: true, aliases: ["h3po4", "85% h3po4"] },
  "acetic acid": { cas: "64-19-7", mw: 60.05, density: 1.049, isLiquid: true, aliases: ["gfaa", "glacial acetic acid", "acoh"] },
  "trifluoroacetic acid": { cas: "76-05-1", mw: 114.02, density: 1.489, isLiquid: true, aliases: ["tfa"] },
  "methanesulfonic acid": { cas: "75-75-2", mw: 96.11, density: 1.481, isLiquid: true, aliases: ["msa", "methanesulphonic acid"] },
  "p-toluenesulfonic acid monohydrate": { cas: "6192-52-5", mw: 190.22, density: 1.0, isLiquid: false, aliases: ["ptsa", "tsoh"] },
  "formic acid": { cas: "64-18-6", mw: 46.03, density: 1.220, isLiquid: true, aliases: ["hcooh"] },
  "thionyl chloride": { cas: "7719-09-7", mw: 118.97, density: 1.638, isLiquid: true, aliases: ["socl2"] },
  "oxalyl chloride": { cas: "79-37-8", mw: 126.93, density: 1.480, isLiquid: true, aliases: ["(cocl)2"] },
  "phosphorus oxychloride": { cas: "10025-87-3", mw: 153.33, density: 1.645, isLiquid: true, aliases: ["pocl3"] },

  // --- Coupling Reagents & Additives ---
  "1-(3-dimethylaminopropyl)-3-ethylcarbodiimide hcl": { cas: "25952-53-8", mw: 191.70, density: 1.0, isLiquid: false, aliases: ["edc hcl", "edc.hcl", "edac"] },
  "n,n'-dicyclohexylcarbodiimide": { cas: "538-75-0", mw: 206.33, density: 1.0, isLiquid: false, aliases: ["dcc"] },
  "n,n'-diisopropylcarbodiimide": { cas: "693-13-0", mw: 126.20, density: 0.806, isLiquid: true, aliases: ["dic"] },
  "1,1'-carbonyldiimidazole": { cas: "530-62-1", mw: 162.15, density: 1.0, isLiquid: false, aliases: ["cdi"] },
  "1-hydroxybenzotriazole hydrate": { cas: "123333-53-9", mw: 153.14, density: 1.0, isLiquid: false, aliases: ["hobt", "hobt.h2o"] },
  "1-hydroxy-7-azabenzotriazole": { cas: "39968-33-7", mw: 136.11, density: 1.0, isLiquid: false, aliases: ["hoat"] },
  "o-(7-azabenzotriazol-1-yl)-n,n,n',n'-tetramethyluronium hexafluorophosphate": { cas: "148893-10-1", mw: 380.23, density: 1.0, isLiquid: false, aliases: ["hatu"] },
  "o-(benzotriazol-1-yl)-n,n,n',n'-tetramethyluronium hexafluorophosphate": { cas: "94790-37-1", mw: 379.24, density: 1.0, isLiquid: false, aliases: ["hbtu"] },
  "propylphosphonic anhydride (50% in etoac)": { cas: "68957-94-8", mw: 318.18, density: 1.070, isLiquid: true, aliases: ["t3p", "t3p in etoac"] },

  // --- Reducing & Oxidizing Reagents ---
  "sodium borohydride": { cas: "16940-66-2", mw: 37.83, density: 1.0, isLiquid: false, aliases: ["nabh4"] },
  "lithium aluminium hydride": { cas: "16853-85-3", mw: 37.95, density: 1.0, isLiquid: false, aliases: ["lah", "lialh4"] },
  "sodium cyanoborohydride": { cas: "25895-60-7", mw: 62.84, density: 1.0, isLiquid: false, aliases: ["nabh3cn"] },
  "sodium triacetoxyborohydride": { cas: "56553-60-7", mw: 211.94, density: 1.0, isLiquid: false, aliases: ["stab", "na(oac)3bh"] },
  "diisobutylaluminium hydride (1.0m in tol)": { cas: "1191-15-7", mw: 142.22, density: 0.860, isLiquid: true, aliases: ["dibal", "dibal-h"] },
  "hydrogen peroxide (30%)": { cas: "7722-84-1", mw: 34.01, density: 1.110, isLiquid: true, aliases: ["h2o2", "30% h2o2"] },
  "3-chloroperbenzoic acid": { cas: "937-14-4", mw: 172.57, density: 1.0, isLiquid: false, aliases: ["mcpba"] },
  "sodium hypochlorite (10-12%)": { cas: "7681-52-9", mw: 74.44, density: 1.210, isLiquid: true, aliases: ["naocl", "bleach"] },

  // --- Protecting Groups & Silyl Reagents ---
  "di-tert-butyl dicarbonate": { cas: "24424-99-5", mw: 218.25, density: 0.950, isLiquid: true, aliases: ["boc2o", "boc anhydride"] },
  "benzyl chloroformate": { cas: "501-53-1", mw: 170.59, density: 1.195, isLiquid: true, aliases: ["cbz-cl", "cbz chloride"] },
  "tert-butyldimethylsilyl chloride": { cas: "18162-48-6", mw: 150.72, density: 1.0, isLiquid: false, aliases: ["tbscl", "tbdmscl"] },
  "trimethylsilyl chloride": { cas: "75-77-4", mw: 108.64, density: 0.856, isLiquid: true, aliases: ["tmscl", "chlorotrimethylsilane"] }
};

// Fuzzy Search in internal Chemical Database
function searchInternalChemicalDB(query) {
  if (!query) return null;
  const clean = query.trim().toLowerCase();

  // 1. Direct key match
  if (PHARMA_CHEM_DB[clean]) {
    return { name: clean, ...PHARMA_CHEM_DB[clean] };
  }

  // 2. Alias match
  for (const [chemKey, data] of Object.entries(PHARMA_CHEM_DB)) {
    if (data.aliases && data.aliases.some(a => a.toLowerCase() === clean)) {
      return { name: chemKey, ...data };
    }
  }

  // 3. Partial Token Normalization (Strip percentages e.g. "5% ", "10% ")
  const stripped = clean.replace(/^\d+%\s*/, "").trim();
  for (const [chemKey, data] of Object.entries(PHARMA_CHEM_DB)) {
    if (chemKey === stripped || (data.aliases && data.aliases.some(a => a.toLowerCase() === stripped))) {
      return { name: chemKey, ...data };
    }
  }

  // 4. Substring inclusion
  for (const [chemKey, data] of Object.entries(PHARMA_CHEM_DB)) {
    if (clean.includes(chemKey) || chemKey.includes(clean)) {
      return { name: chemKey, ...data };
    }
  }

  return null;
}

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();

  const loaded = loadFromLocalStorage();
  if (!loaded) {
    addNewStage("Stage-1: KSM Condensation");
  }
  populateMasterDatalist();
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

// ----------------- AUTO-SAVE & SESSION ENGINE -----------------

function triggerAutoSave() {
  const indicator = document.getElementById("autoSaveIndicator");
  if (indicator) {
    indicator.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 mr-1 animate-spin text-amber-400"></i> Saving...`;
    indicator.className = "inline-flex items-center text-[11px] font-medium text-amber-300 bg-amber-950/70 border border-amber-700/80 px-2.5 py-0.5 rounded-full transition-all";
    refreshIcons();
  }

  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    saveToLocalStorage();
    if (indicator) {
      indicator.innerHTML = `<i data-lucide="check" class="w-3 h-3 mr-1 text-emerald-400"></i> Auto-saved`;
      indicator.className = "inline-flex items-center text-[11px] font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-700/80 px-2.5 py-0.5 rounded-full transition-all";
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

    stagesData.push({ stageName, prodName, prodMw, actualQty, materials });
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
  populateMasterDatalist();
  recalculateAll();
}

function resetProjectData() {
  if (confirm("Clear all stages, materials and start fresh? All session data will be reset.")) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

// ----------------- STAGE & MULTI-ROW ACTIONS -----------------

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
        <button onclick="addMaterialRow('${stageId}')" class="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition shadow-sm">
          <i data-lucide="plus" class="w-3.5 h-3.5 mr-1"></i> Add Material
        </button>
        <button onclick="deleteSelectedRows('${stageId}')" class="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center transition shadow-sm" title="Delete all selected raw material lines">
          <i data-lucide="trash" class="w-3.5 h-3.5 mr-1"></i> Delete Selected
        </button>
        <button onclick="removeStage('${stageId}')" class="text-slate-400 hover:text-rose-600 p-1.5 rounded transition" title="Delete whole stage">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>

    <div class="table-scroll">
      <table class="rmc-table" id="table_${stageId}">
        <thead>
          <tr>
            <th class="w-8"><input type="checkbox" title="Select / Deselect All Rows" onchange="toggleSelectAllRows(this, '${stageId}')" /></th>
            <th>Sr.</th>
            <th>CAS No.</th>
            <th style="min-width: 180px;">Name of Raw Material</th>
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
  populateMasterDatalist();
  refreshIcons();
  return stageId;
}

function removeStage(stageId) {
  const stage = document.getElementById(stageId);
  if (stage) {
    stage.remove();
    updateStageBadgeNumbers();
    populateMasterDatalist();
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
  populateMasterDatalist();
  recalculateAll();
  triggerAutoSave();
}

// Add Raw Material Row with Line-Selection Checkbox
function addMaterialRow(stageId) {
  const tbody = document.querySelector(`#table_${stageId} tbody`);
  const rowCount = tbody.children.length + 1;
  const isFirstRow = rowCount === 1;
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="text-center">
      <input type="checkbox" class="row-select" ${isFirstRow ? 'disabled title="Reference starting material cannot be bulk deleted"' : ''} />
    </td>
    <td class="text-center font-bold text-slate-500 sr-no">${rowCount}</td>
    <td><input type="text" class="cas-no w-24" placeholder="CAS No." /></td>
    <td>
      <div class="flex items-center space-x-1">
        <input 
          type="text" 
          list="rmMasterList" 
          class="rm-name w-40 font-medium" 
          placeholder="Select / Type RM..." 
          onchange="autoFillRM(this)" 
        />
        <button 
          type="button" 
          title="Auto-fetch CAS, MW & Density" 
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
      ${isFirstRow ? '<span class="text-xs text-slate-300">Ref</span>' : '<button onclick="removeRow(this)" class="text-slate-400 hover:text-rose-600 transition" title="Delete this line"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>'}
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

// Multi-Row Selection & Bulk Deletion
function toggleSelectAllRows(masterCheckbox, stageId) {
  const tbody = document.querySelector(`#table_${stageId} tbody`);
  const checkboxes = tbody.querySelectorAll(".row-select:not(:disabled)");
  checkboxes.forEach((cb) => {
    cb.checked = masterCheckbox.checked;
  });
}

function deleteSelectedRows(stageId) {
  const tbody = document.querySelector(`#table_${stageId} tbody`);
  const selectedCheckboxes = tbody.querySelectorAll(".row-select:checked:not(:disabled)");

  if (selectedCheckboxes.length === 0) {
    alert("Please check the box next to the raw material line(s) you wish to delete.");
    return;
  }

  if (confirm(`Are you sure you want to delete the ${selectedCheckboxes.length} selected line(s)?`)) {
    selectedCheckboxes.forEach((cb) => {
      const row = cb.closest("tr");
      if (row) row.remove();
    });

    Array.from(tbody.querySelectorAll(".sr-no")).forEach((td, index) => {
      td.innerText = index + 1;
    });

    const masterCheckbox = document.querySelector(`#table_${stageId} thead input[type="checkbox"]`);
    if (masterCheckbox) masterCheckbox.checked = false;

    recalculateAll();
    triggerAutoSave();
  }
}

function onRateInput(inputElem, type) {
  const row = inputElem.closest("tr");
  const isInHouse = row.dataset.isInHouse === "true";

  if (!isInHouse && type === "wo") {
    row.querySelector(".rate-with-rec").value = inputElem.value;
  }
  recalculateAll();
}

// ----------------- CHEMICAL LOOKUP & DENSITY POPULATOR -----------------

function populateMasterDatalist() {
  const dataList = document.getElementById("rmMasterList");
  dataList.innerHTML = "";

  // 1. Built-in Pharma DB compounds
  Object.keys(PHARMA_CHEM_DB).forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name.replace(/\b\w/g, l => l.toUpperCase());
    opt.label = `DB (MW: ${PHARMA_CHEM_DB[name].mw}, D: ${PHARMA_CHEM_DB[name].density})`;
    dataList.appendChild(opt);
  });

  // 2. Uploaded Excel Master items
  Object.values(priceMaster).forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.name;
    opt.label = `Excel Master (Rate: ₹${item.rate})`;
    dataList.appendChild(opt);
  });

  // 3. In-page Stage Products
  document.querySelectorAll(".stage-card").forEach((card) => {
    const prodName = card.querySelector(".stage-prod-name").value.trim();
    const stageName = card.querySelector(".stage-name-input").value.trim();
    const costWo = card.dataset.unitCostWoRec || "0.00";
    const costW = card.dataset.unitCostWithRec || "0.00";

    if (prodName) {
      const opt = document.createElement("option");
      opt.value = prodName;
      opt.label = `Intermediate (w/o: ₹${costWo} | with: ₹${costW})`;
      dataList.appendChild(opt);
    }
    if (stageName && stageName.toLowerCase() !== prodName.toLowerCase()) {
      const opt = document.createElement("option");
      opt.value = stageName;
      opt.label = `Stage Ref (w/o: ₹${costWo} | with: ₹${costW})`;
      dataList.appendChild(opt);
    }
  });
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

  // 2. Check 150+ Built-in Pharma DB (Handles 5% Palladium on alumina, solvents, etc.)
  const dbMatch = searchInternalChemicalDB(val);
  if (dbMatch) {
    if (dbMatch.cas) row.querySelector(".cas-no").value = dbMatch.cas;
    if (dbMatch.mw > 0) row.querySelector(".mw").value = dbMatch.mw;
    if (dbMatch.density > 0) row.querySelector(".density").value = dbMatch.density;

    if (dbMatch.isLiquid) {
      row.querySelector(".unit-select").value = "L";
      row.querySelector(".ratio-type").value = "volume";
    }
  }

  // 3. Check uploaded Excel Master Sheet for rates and custom SAP
  if (priceMaster[val]) {
    const item = priceMaster[val];
    if (item.cas) row.querySelector(".cas-no").value = item.cas;
    if (item.mw > 0) row.querySelector(".mw").value = item.mw;
    if (item.density > 0) row.querySelector(".density").value = item.density;
    row.querySelector(".rate-wo-rec").value = item.rate || 0;
    row.querySelector(".rate-with-rec").value = item.rate || 0;
  }

  recalculateAll();
  triggerAutoSave();
}

async function fetchOnlineChemData(btn, inputElement) {
  const row = inputElement.closest("tr");
  const rawQuery = inputElement.value.trim();
  if (!rawQuery) return alert("Please enter a chemical name first.");

  const originalIcon = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-indigo-600"></i>`;
  refreshIcons();

  // First check internal database (prevents failure for supported catalysts like 5% Palladium on alumina)
  const dbMatch = searchInternalChemicalDB(rawQuery);
  if (dbMatch) {
    row.querySelector(".cas-no").value = dbMatch.cas;
    row.querySelector(".mw").value = dbMatch.mw;
    row.querySelector(".density").value = dbMatch.density;
    if (dbMatch.isLiquid) {
      row.querySelector(".unit-select").value = "L";
      row.querySelector(".ratio-type").value = "volume";
    }
    btn.innerHTML = originalIcon;
    refreshIcons();
    recalculateAll();
    triggerAutoSave();
    return;
  }

  // Normalization for PubChem (strips percentage prefixes and alumina/carbon supports if needed)
  let cleanedName = rawQuery.replace(/^\d+%\s*/i, "").trim();
  if (cleanedName.toLowerCase().includes("on alumina")) cleanedName = "palladium";
  if (cleanedName.toLowerCase().includes("on carbon")) cleanedName = "palladium";

  try {
    const encodedName = encodeURIComponent(cleanedName);
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

    if (casNo) row.querySelector(".cas-no").value = casNo;
    if (mw > 0) row.querySelector(".mw").value = parseFloat(mw).toFixed(2);

    if (!casNo && mw === 0) {
      alert(`No online record found for "${rawQuery}". Please specify CAS & MW manually.`);
    } else {
      recalculateAll();
      triggerAutoSave();
    }
  } catch (err) {
    console.error(err);
    alert("Online search timed out. Details can be entered manually.");
  } finally {
    btn.innerHTML = originalIcon;
    refreshIcons();
  }
}

async function fetchProductMWOnline(btn) {
  const card = btn.closest(".stage-card");
  const prodName = card.querySelector(".stage-prod-name").value.trim();
  if (!prodName) return alert("Please enter intermediate name first.");

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

// ----------------- CALCULATION & REVERSE CASCADE -----------------

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

function recalculateAll() {
  const apiBatchSize = parseFloat(document.getElementById("apiBatchSize").value) || 1;
  const stageCards = Array.from(document.querySelectorAll(".stage-card"));

  let grandTotalCostWithoutRec = 0;
  let grandTotalCostWithRec = 0;
  let globalTotalInputMassKg = 0;

  stageCards.forEach((stageCard) => {
    const rows = Array.from(stageCard.querySelectorAll("tbody tr"));
    if (rows.length === 0) return;

    // Refresh rates for rows referencing upstream in-page intermediates
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

// ----------------- BULK EXCEL PARSING & COLORFUL WORKBOOK EXPORT -----------------

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
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      priceMaster = {};
      let matchedCount = 0;

      rawRows.forEach((row) => {
        const normalized = {};
        Object.keys(row).forEach((k) => {
          normalized[normalizeHeaderKey(k)] = row[k];
        });

        const name = (normalized["nameofrawmaterial"] || normalized["rawmaterialname"] || normalized["rmname"] || normalized["name"] || "").toString().trim();
        const cas = (normalized["casno"] || normalized["casnumber"] || normalized["cas"] || "").toString().trim();
        const mw = parseFloat(normalized["molecularweight"] || normalized["mw"] || 0) || 0;
        const density = parseFloat(normalized["density"] || normalized["spgravity"] || 0) || 0;
        const rate = parseFloat(normalized["ratekg"] || normalized["rate"] || normalized["price"] || 0) || 0;

        if (name) {
          priceMaster[name.toLowerCase()] = { name, cas, mw, density, rate };
          matchedCount++;
        }
      });

      document.getElementById("uploadLabel").innerText = `Loaded (${matchedCount} items)`;
      populateMasterDatalist();
      recalculateAll();
      triggerAutoSave();
      alert(`Successfully loaded ${matchedCount} Raw Materials into Price Master.`);
    } catch (err) {
      console.error(err);
      alert("Error parsing file. Please ensure it is a valid Excel spreadsheet.");
    }
  };
  reader.readAsArrayBuffer(file);
}

function downloadSampleRateCard() {
  const sampleData = [
    { "CAS No": "7440-05-3", "Name of Raw Material": "5% Palladium on Alumina", "Molecular Weight": 106.42, "Density": 1.000, "Rate/Kg": 9500.00 },
    { "CAS No": "7440-05-3", "Name of Raw Material": "10% Palladium on Carbon", "Molecular Weight": 106.42, "Density": 1.000, "Rate/Kg": 18500.00 },
    { "CAS No": "67-56-1", "Name of Raw Material": "Methanol", "Molecular Weight": 32.04, "Density": 0.792, "Rate/Kg": 42.00 },
    { "CAS No": "75-09-2", "Name of Raw Material": "Dichloromethane", "Molecular Weight": 84.93, "Density": 1.326, "Rate/Kg": 68.50 },
    { "CAS No": "141-78-6", "Name of Raw Material": "Ethyl Acetate", "Molecular Weight": 88.11, "Density": 0.902, "Rate/Kg": 94.00 },
    { "CAS No": "121-44-8", "Name of Raw Material": "Triethylamine", "Molecular Weight": 101.19, "Density": 0.726, "Rate/Kg": 210.00 },
    { "CAS No": "16940-66-2", "Name of Raw Material": "Sodium Borohydride", "Molecular Weight": 37.83, "Density": 1.070, "Rate/Kg": 850.00 },
    { "CAS No": "25952-53-8", "Name of Raw Material": "EDC HCl", "Molecular Weight": 191.70, "Density": 1.000, "Rate/Kg": 2800.00 }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData);
  ws["!cols"] = [{ wch: 16 }, { wch: 32 }, { wch: 18 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, "RM_Price_Master");
  XLSX.writeFile(wb, "Standard_RM_Rate_Master_Template.xlsx");
}

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
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

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
          currentStage = {
            stageName: cell0.replace(/^STAGE:\s*/i, "").trim(),
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

        if (cell0.startsWith("OVERALL FINISHED")) break;

        if (inTable && currentStage) {
          const srNum = parseInt(cell0);
          if (isNaN(srNum)) {
            inTable = false;
            continue;
          }

          currentStage.materials.push({
            cas: String(row[1] || "").trim(),
            name: String(row[2] || "").trim(),
            density: row[3] !== "" ? row[3] : 1.0,
            ratioType: String(row[4] || "").toLowerCase().includes("vol") ? "volume" : "mole",
            moleVolRatio: row[5] !== "" ? row[5] : 1.0,
            qty: row[6] !== "" ? row[6] : 0,
            unit: String(row[7] || "kg").trim(),
            mw: row[8] !== "" ? row[8] : 0,
            recPercent: row[11] !== "" ? row[11] : 0,
            rateWo: row[13] !== "" ? row[13] : 0,
            rateWith: row[14] !== "" ? row[14] : 0,
            isInHouse: String(row[1] || "").toLowerCase().includes("in-house")
          });
        }
      }

      renderStagesFromState({ projectName: parsedProjectName, apiBatchSize: parsedBatchSize, stages: parsedStages });
      triggerAutoSave();
      alert(`RMC Sheet loaded successfully! Restored ${parsedStages.length} reaction stages.`);
    } catch (err) {
      console.error("RMC Import Error:", err);
      alert("Error parsing RMC sheet. Please ensure it is an authentic workbook exported by this app.");
    }
  };
  reader.readAsArrayBuffer(file);
}

// ----------------- ATTRACTIVE MULTI-COLOR EXCEL GENERATION -----------------

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
    title: { font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "064E3B" } }, alignment: { horizontal: "center", vertical: "center" } },
    meta: { font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "0F172A" } }, fill: { fgColor: { rgb: "F1F5F9" } }, alignment: { vertical: "center" } },
    tableHeader: { font: { name: "Calibri", sz: 9.5, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "0D9488" } }, alignment: { horizontal: "center", vertical: "center", wrapText: true } },
    dataText: { font: { name: "Calibri", sz: 9 }, alignment: { vertical: "center" } },
    dataNum: { font: { name: "Calibri", sz: 9 }, alignment: { horizontal: "right", vertical: "center" } },
    zebra: { fill: { fgColor: { rgb: "F8FAFC" } } },
    dataTotal: { font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "064E3B" } }, fill: { fgColor: { rgb: "DCFCE7" } }, alignment: { horizontal: "right", vertical: "center" } }
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
    const isSolvent = PHARMA_CHEM_DB[item.name.toLowerCase()]?.isLiquid || false;
    const typeLabel = item.isInHouse ? "In-House Intermediate" : (isSolvent ? "Solvent" : "Raw Material / Catalyst");

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
    { wch: 6 }, { wch: 14 }, { wch: 32 }, { wch: 22 },
    { wch: 18 }, { wch: 8 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 14 },
    { wch: 18 }, { wch: 18 }, { wch: 30 }
  ];

  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" };

      if (R === 0) ws[cellRef].s = styles.title;
      else if (R === 1) ws[cellRef].s = styles.meta;
      else if (R === 3) ws[cellRef].s = styles.tableHeader;
      else if (R === totalRowIdx) ws[cellRef].s = styles.dataTotal;
      else {
        const isNum = typeof ws[cellRef].v === "number";
        const baseStyle = isNum ? { ...styles.dataNum } : { ...styles.dataText };
        if (R % 2 === 0) baseStyle.fill = styles.zebra.fill;
        ws[cellRef].s = baseStyle;
      }
    }
  }

  return ws;
}

function buildStageWiseSheet(projectName, apiBatchSize) {
  const styles = {
    title: { font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1E3A8A" } }, alignment: { horizontal: "center", vertical: "center" } },
    meta: { font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "1E293B" } }, fill: { fgColor: { rgb: "F1F5F9" } }, alignment: { vertical: "center" } },
    stageHeader: { font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "312E81" } }, alignment: { horizontal: "left", vertical: "center" } },
    stageSubbar: { font: { name: "Calibri", sz: 9, bold: true, color: { rgb: "1E1B4B" } }, fill: { fgColor: { rgb: "EEF2FF" } }, alignment: { vertical: "center" } },
    tableHeader: { font: { name: "Calibri", sz: 8.5, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "0F172A" } }, alignment: { horizontal: "center", vertical: "center", wrapText: true } },
    dataText: { font: { name: "Calibri", sz: 8.5 }, alignment: { vertical: "center" } },
    dataNum: { font: { name: "Calibri", sz: 8.5 }, alignment: { horizontal: "right", vertical: "center" } },
    dataHighlight: { font: { name: "Calibri", sz: 8.5, bold: true, color: { rgb: "1E3A8A" } }, fill: { fgColor: { rgb: "F0FDF4" } }, alignment: { horizontal: "right", vertical: "center" } },
    zebra: { fill: { fgColor: { rgb: "F8FAFC" } } },
    summaryBanner: { font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "065F46" } }, alignment: { horizontal: "left", vertical: "center" } },
    summaryValue: { font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "065F46" } }, fill: { fgColor: { rgb: "DCFCE7" } }, alignment: { horizontal: "right", vertical: "center" } }
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
    wsData.push([`Product: ${prodName} | MW: ${prodMw} g/mol | Actual: ${actualKg} kg | Theor: ${theorKg} | % Molar Yield: ${molarYield} | % w/w: ${wwYield} | Cost w/o Rec: ${unitCostWo} | Cost with Rec: ${unitCostW} | Stage PMI: ${stagePmi}`]);
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
    { wch: 6 }, { wch: 14 }, { wch: 30 }, { wch: 11 },
    { wch: 13 }, { wch: 12 }, { wch: 10 }, { wch: 6 }, { wch: 10 },
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];

  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" };

      const val = String(ws[cellRef].v || "");
      if (R === 0) ws[cellRef].s = styles.title;
      else if (R === 1) ws[cellRef].s = styles.meta;
      else if (val.startsWith("STAGE:")) ws[cellRef].s = styles.stageHeader;
      else if (val.startsWith("Product:")) ws[cellRef].s = styles.stageSubbar;
      else if (val === "Sr." || val === "Raw Material Name") {
        for (let col = 0; col <= 18; col++) {
          const cRef = XLSX.utils.encode_cell({ r: R, c: col });
          if (!ws[cRef]) ws[cRef] = { t: "s", v: "" };
          ws[cRef].s = styles.tableHeader;
        }
      } else if (R === summaryStart) ws[cellRef].s = styles.summaryBanner;
      else if (R > summaryStart && C === 0) ws[cellRef].s = styles.meta;
      else if (R > summaryStart && C === 1) ws[cellRef].s = styles.summaryValue;
      else {
        const isNum = typeof ws[cellRef].v === "number";
        const baseStyle = isNum ? { ...styles.dataNum } : { ...styles.dataText };
        if (C === 15 || C === 16) {
          baseStyle.font = styles.dataHighlight.font;
          baseStyle.fill = styles.dataHighlight.fill;
        } else if (R % 2 === 0) {
          baseStyle.fill = styles.zebra.fill;
        }
        ws[cellRef].s = baseStyle;
      }
    }
  }

  return ws;
}

function exportFullWorkbook() {
  const projectName = document.getElementById("projectName").value || "Pharma API RMC";
  const apiBatchSize = document.getElementById("apiBatchSize").value || "Target";
  const wb = XLSX.utils.book_new();

  try {
    const stageWs = buildStageWiseSheet(projectName, apiBatchSize);
    XLSX.utils.book_append_sheet(wb, stageWs, "Stage_Costing_Breakdown");

    const bomWs = buildConsolidatedSheet(wb, projectName, apiBatchSize);
    XLSX.utils.book_append_sheet(wb, bomWs, "Consolidated_BOM");

    XLSX.writeFile(wb, `${projectName.replace(/\s+/g, "_")}_${apiBatchSize}kg_RMC_Full_Workbook.xlsx`);
  } catch (err) {
    console.error("Export Error:", err);
    alert("Workbook export encountered an error. Check console details.");
  }
}

function exportConsolidatedBOMOnly() {
  const projectName = document.getElementById("projectName").value || "Pharma API RMC";
  const apiBatchSize = document.getElementById("apiBatchSize").value || "Target";
  const wb = XLSX.utils.book_new();

  try {
    const bomWs = buildConsolidatedSheet(wb, projectName, apiBatchSize);
    XLSX.utils.book_append_sheet(wb, bomWs, "Consolidated_Procurement_BOM");

    XLSX.writeFile(wb, `${projectName.replace(/\s+/g, "_")}_${apiBatchSize}kg_Consolidated_BOM.xlsx`);
  } catch (err) {
    console.error("BOM Export Error:", err);
    alert("BOM export encountered an error. Check console details.");
  }
}
