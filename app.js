// State Management
let priceMaster = {};
let stageCount = 0;
let isRestoringState = false;
let isRetroCalculating = false;
let localFileHandle = null;

const STORAGE_KEY = "PHARMA_RMC_AUTOSAVE_STATE";
const PRICE_MASTER_STORAGE_KEY = "PHARMA_RMC_PRICE_MASTER";

// -------------------------------------------------------------
// Comprehensive Process Chemistry & Reagents Knowledgebase
// -------------------------------------------------------------
const INTERNAL_CHEMICAL_DB = {
  // Catalysts & Supported Metals
  "palladium on alumina": { cas: "7440-05-3", mw: 106.42, density: 1.0, isLiquid: false },
  "pd/al2o3": { cas: "7440-05-3", mw: 106.42, density: 1.0, isLiquid: false },
  "palladium on carbon": { cas: "7440-05-3", mw: 106.42, density: 1.0, isLiquid: false },
  "pd/c": { cas: "7440-05-3", mw: 106.42, density: 1.0, isLiquid: false },
  "palladium on charcoal": { cas: "7440-05-3", mw: 106.42, density: 1.0, isLiquid: false },
  "platinum on carbon": { cas: "7440-06-4", mw: 195.08, density: 1.0, isLiquid: false },
  "pt/c": { cas: "7440-06-4", mw: 195.08, density: 1.0, isLiquid: false },
  "raney nickel": { cas: "7440-02-0", mw: 58.69, density: 1.0, isLiquid: false },
  "raney ni": { cas: "7440-02-0", mw: 58.69, density: 1.0, isLiquid: false },
  "palladium acetate": { cas: "3375-31-3", mw: 224.51, density: 1.0, isLiquid: false },
  "pd(oac)2": { cas: "3375-31-3", mw: 224.51, density: 1.0, isLiquid: false },
  "tetrakis(triphenylphosphine)palladium": { cas: "14221-01-3", mw: 1155.56, density: 1.0, isLiquid: false },
  "pd(pph3)4": { cas: "14221-01-3", mw: 1155.56, density: 1.0, isLiquid: false },
  "pd(dppf)cl2": { cas: "72287-26-4", mw: 731.70, density: 1.0, isLiquid: false },
  "pd(pph3)2cl2": { cas: "13965-03-2", mw: 701.90, density: 1.0, isLiquid: false },

  // Metal Alkoxides, Halides & Lewis Acids
  "titanium tetraisopropoxide": { cas: "546-68-9", mw: 284.22, density: 0.960, isLiquid: true },
  "titanium isopropoxide": { cas: "546-68-9", mw: 284.22, density: 0.960, isLiquid: true },
  "tetraisopropyl titanate": { cas: "546-68-9", mw: 284.22, density: 0.960, isLiquid: true },
  "ttip": { cas: "546-68-9", mw: 284.22, density: 0.960, isLiquid: true },
  "titanium tetrachloride": { cas: "7550-45-0", mw: 189.68, density: 1.726, isLiquid: true },
  "ticl4": { cas: "7550-45-0", mw: 189.68, density: 1.726, isLiquid: true },
  "aluminium chloride": { cas: "7446-70-0", mw: 133.34, density: 2.44, isLiquid: false },
  "alcl3": { cas: "7446-70-0", mw: 133.34, density: 2.44, isLiquid: false },
  "boron tribromide": { cas: "10294-33-4", mw: 250.52, density: 2.65, isLiquid: true },
  "bbr3": { cas: "10294-33-4", mw: 250.52, density: 2.65, isLiquid: true },
  "boron trifluoride etherate": { cas: "109-63-7", mw: 141.93, density: 1.125, isLiquid: true },
  "bf3.oet2": { cas: "109-63-7", mw: 141.93, density: 1.125, isLiquid: true },
  "copper(i) iodide": { cas: "7681-65-4", mw: 190.45, density: 5.62, isLiquid: false },
  "cui": { cas: "7681-65-4", mw: 190.45, density: 5.62, isLiquid: false },

  // Organometallics & Strong Bases
  "sodium hydride": { cas: "7646-69-7", mw: 24.00, density: 1.20, isLiquid: false },
  "nah": { cas: "7646-69-7", mw: 24.00, density: 1.20, isLiquid: false },
  "n-butyllithium": { cas: "109-72-8", mw: 64.06, density: 0.680, isLiquid: true },
  "nbuli": { cas: "109-72-8", mw: 64.06, density: 0.680, isLiquid: true },
  "buli": { cas: "109-72-8", mw: 64.06, density: 0.680, isLiquid: true },
  "diisobutylaluminium hydride": { cas: "1191-15-7", mw: 142.22, density: 0.790, isLiquid: true },
  "dibal-h": { cas: "1191-15-7", mw: 142.22, density: 0.790, isLiquid: true },
  "dibal": { cas: "1191-15-7", mw: 142.22, density: 0.790, isLiquid: true },
  "lithium diisopropylamide": { cas: "4111-54-0", mw: 107.12, density: 0.790, isLiquid: true },
  "lda": { cas: "4111-54-0", mw: 107.12, density: 0.790, isLiquid: true },
  "potassium tert-butoxide": { cas: "865-47-4", mw: 112.21, density: 1.0, isLiquid: false },
  "kotbu": { cas: "865-47-4", mw: 112.21, density: 1.0, isLiquid: false },
  "sodium tert-butoxide": { cas: "865-48-5", mw: 96.10, density: 1.0, isLiquid: false },
  "naotbu": { cas: "865-48-5", mw: 96.10, density: 1.0, isLiquid: false },
  "sodium methoxide": { cas: "124-41-4", mw: 54.02, density: 1.0, isLiquid: false },
  "naome": { cas: "124-41-4", mw: 54.02, density: 1.0, isLiquid: false },
  "sodium ethoxide": { cas: "141-52-6", mw: 68.05, density: 1.0, isLiquid: false },
  "naoet": { cas: "141-52-6", mw: 68.05, density: 1.0, isLiquid: false },

  // Reagents, Halogenating & Coupling Agents
  "thionyl chloride": { cas: "7719-09-7", mw: 118.97, density: 1.638, isLiquid: true },
  "socl2": { cas: "7719-09-7", mw: 118.97, density: 1.638, isLiquid: true },
  "oxalyl chloride": { cas: "79-37-8", mw: 126.93, density: 1.480, isLiquid: true },
  "phosphorus oxychloride": { cas: "10025-87-3", mw: 153.33, density: 1.645, isLiquid: true },
  "pocl3": { cas: "10025-87-3", mw: 153.33, density: 1.645, isLiquid: true },
  "methanesulfonyl chloride": { cas: "124-63-0", mw: 114.55, density: 1.480, isLiquid: true },
  "mscl": { cas: "124-63-0", mw: 114.55, density: 1.480, isLiquid: true },
  "p-toluenesulfonyl chloride": { cas: "98-59-9", mw: 190.65, density: 1.0, isLiquid: false },
  "tscl": { cas: "98-59-9", mw: 190.65, density: 1.0, isLiquid: false },
  "1,1'-carbonyldiimidazole": { cas: "530-62-1", mw: 162.15, density: 1.0, isLiquid: false },
  "cdi": { cas: "530-62-1", mw: 162.15, density: 1.0, isLiquid: false },
  "edc hcl": { cas: "25952-53-8", mw: 191.70, density: 1.0, isLiquid: false },
  "edc.hcl": { cas: "25952-53-8", mw: 191.70, density: 1.0, isLiquid: false },
  "dcc": { cas: "538-75-0", mw: 206.33, density: 1.0, isLiquid: false },
  "hobt": { cas: "2592-95-2", mw: 135.12, density: 1.0, isLiquid: false },
  "triethylamine": { cas: "121-44-8", mw: 101.19, density: 0.726, isLiquid: true },
  "tea": { cas: "121-44-8", mw: 101.19, density: 0.726, isLiquid: true },
  "diisopropylethylamine": { cas: "7087-68-5", mw: 129.24, density: 0.755, isLiquid: true },
  "dipea": { cas: "7087-68-5", mw: 129.24, density: 0.755, isLiquid: true },
  "hunig's base": { cas: "7087-68-5", mw: 129.24, density: 0.755, isLiquid: true },
  "4-dimethylaminopyridine": { cas: "1122-58-3", mw: 122.17, density: 1.0, isLiquid: false },
  "dmap": { cas: "1122-58-3", mw: 122.17, density: 1.0, isLiquid: false },
  "n-bromosuccinimide": { cas: "128-08-5", mw: 177.98, density: 1.0, isLiquid: false },
  "nbs": { cas: "128-08-5", mw: 177.98, density: 1.0, isLiquid: false },
  "sodium borohydride": { cas: "16940-66-2", mw: 37.83, density: 1.0, isLiquid: false },
  "nabh4": { cas: "16940-66-2", mw: 37.83, density: 1.0, isLiquid: false },
  "lithium aluminium hydride": { cas: "16853-85-3", mw: 37.95, density: 1.0, isLiquid: false },
  "lah": { cas: "16853-85-3", mw: 37.95, density: 1.0, isLiquid: false },

  // Solvents & Liquid Acids
  "water": { cas: "7732-18-5", mw: 18.02, density: 1.000, isLiquid: true },
  "methanol": { cas: "67-56-1", mw: 32.04, density: 0.792, isLiquid: true },
  "ethanol": { cas: "64-17-5", mw: 46.07, density: 0.789, isLiquid: true },
  "isopropanol": { cas: "67-63-0", mw: 60.10, density: 0.786, isLiquid: true },
  "ipa": { cas: "67-63-0", mw: 60.10, density: 0.786, isLiquid: true },
  "acetone": { cas: "67-64-1", mw: 58.08, density: 0.784, isLiquid: true },
  "dichloromethane": { cas: "75-09-2", mw: 84.93, density: 1.326, isLiquid: true },
  "dcm": { cas: "75-09-2", mw: 84.93, density: 1.326, isLiquid: true },
  "mdc": { cas: "75-09-2", mw: 84.93, density: 1.326, isLiquid: true },
  "toluene": { cas: "108-88-3", mw: 92.14, density: 0.867, isLiquid: true },
  "ethyl acetate": { cas: "141-78-6", mw: 88.11, density: 0.902, isLiquid: true },
  "ea": { cas: "141-78-6", mw: 88.11, density: 0.902, isLiquid: true },
  "etac": { cas: "141-78-6", mw: 88.11, density: 0.902, isLiquid: true },
  "tetrahydrofuran": { cas: "109-99-9", mw: 72.11, density: 0.886, isLiquid: true },
  "thf": { cas: "109-99-9", mw: 72.11, density: 0.886, isLiquid: true },
  "acetonitrile": { cas: "75-05-8", mw: 41.05, density: 0.786, isLiquid: true },
  "acn": { cas: "75-05-8", mw: 41.05, density: 0.786, isLiquid: true },
  "n,n-dimethylformamide": { cas: "68-12-2", mw: 73.09, density: 0.944, isLiquid: true },
  "dmf": { cas: "68-12-2", mw: 73.09, density: 0.944, isLiquid: true },
  "dimethyl sulfoxide": { cas: "67-68-5", mw: 78.13, density: 1.100, isLiquid: true },
  "dmso": { cas: "67-68-5", mw: 78.13, density: 1.100, isLiquid: true },
  "hexane": { cas: "110-54-3", mw: 86.18, density: 0.655, isLiquid: true },
  "n-hexane": { cas: "110-54-3", mw: 86.18, density: 0.655, isLiquid: true },
  "heptane": { cas: "142-82-5", mw: 100.20, density: 0.684, isLiquid: true },
  "n-heptane": { cas: "142-82-5", mw: 100.20, density: 0.684, isLiquid: true },
  "pyridine": { cas: "110-86-1", mw: 79.10, density: 0.982, isLiquid: true },
  "acetic acid": { cas: "64-19-7", mw: 60.05, density: 1.049, isLiquid: true },
  "trifluoroacetic acid": { cas: "76-05-1", mw: 114.02, density: 1.489, isLiquid: true },
  "tfa": { cas: "76-05-1", mw: 114.02, density: 1.489, isLiquid: true },
  "diethyl ether": { cas: "60-29-7", mw: 74.12, density: 0.713, isLiquid: true },
  "ether": { cas: "60-29-7", mw: 74.12, density: 0.713, isLiquid: true },
  "chloroform": { cas: "67-66-3", mw: 119.38, density: 1.489, isLiquid: true }
};

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

// -------------------------------------------------------------
// 1. Startup & Event Listeners
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadPriceMasterFromCache();

  const restored = loadProjectFromLocalStorage();
  if (!restored) {
    addNewStage("Stage-1: Key Intermediate Synthesis");
  }

  // 5-second background sync
  setInterval(handleFiveSecondAutoSave, 5000);
  refreshIcons();
});

function setupEventListeners() {
  document.getElementById("btnAddStage").addEventListener("click", () => {
    addNewStage(`Stage-${stageCount + 1}`);
    conditionalAutoRetroScale();
    recalculateAll();
    saveStateToLocalStorage();
  });

  document.getElementById("btnTriggerRetroScale").addEventListener("click", () => {
    runRetroSyntheticScaling();
  });

  document.getElementById("retroModeToggle").addEventListener("change", () => {
    conditionalAutoRetroScale();
    saveStateToLocalStorage();
  });

  document.getElementById("priceMasterFile").addEventListener("change", handleExcelPriceMasterUpload);
  document.getElementById("projectFileInput").addEventListener("change", handleProjectExcelUpload);
  document.getElementById("btnExport").addEventListener("click", exportToExcel);
  document.getElementById("btnLinkLocalFile").addEventListener("click", linkLocalDiskFile);
  document.getElementById("btnResetProject").addEventListener("click", resetProject);

  // Global Event Delegation: Capture inputs across all dynamic tables
  document.addEventListener("input", (e) => {
    if (isRestoringState || isRetroCalculating) return;
    if (e.target.matches("input, select, textarea")) {
      if (e.target.classList.contains("rm-name")) {
        autoFillRM(e.target);
      }
      if (e.target.id === "apiBatchSize" || e.target.classList.contains("stage-target-yield")) {
        conditionalAutoRetroScale();
      }
      recalculateAll();
      saveStateToLocalStorage();
    }
  });

  document.addEventListener("change", (e) => {
    if (isRestoringState || isRetroCalculating) return;
    if (e.target.matches("input, select, textarea")) {
      if (e.target.classList.contains("rm-name")) {
        autoFillRM(e.target);
      }
      if (e.target.id === "apiBatchSize" || e.target.classList.contains("stage-target-yield")) {
        conditionalAutoRetroScale();
      }
      recalculateAll();
      saveStateToLocalStorage();
    }
  });
}

function conditionalAutoRetroScale() {
  const isAuto = document.getElementById("retroModeToggle")?.checked;
  if (isAuto) {
    runRetroSyntheticScaling();
  }
}

// -------------------------------------------------------------
// 2. Retro-Synthetic Backward Batch Scaler Engine
// -------------------------------------------------------------
function runRetroSyntheticScaling() {
  if (isRetroCalculating) return;
  isRetroCalculating = true;

  const targetApiBatchKg = parseFloat(document.getElementById("apiBatchSize").value) || 100;
  const stageCards = Array.from(document.querySelectorAll(".stage-card"));

  if (stageCards.length === 0) {
    isRetroCalculating = false;
    return;
  }

  // Work strictly BACKWARDS from Stage N to Stage 1
  let requiredNextSubstrateKg = targetApiBatchKg;
  let cumulativeYieldFraction = 1.0;

  for (let i = stageCards.length - 1; i >= 0; i--) {
    const card = stageCards[i];
    const rows = card.querySelectorAll("tbody tr");
    if (rows.length === 0) continue;

    const refRow = rows[0];
    const targetYieldPct = parseFloat(card.querySelector(".stage-target-yield").value) || 85;
    const yieldFraction = Math.max(0.001, targetYieldPct / 100);
    cumulativeYieldFraction *= yieldFraction;

    let prodMW = parseFloat(card.querySelector(".stage-prod-mw").value) || 0;
    let subMW = parseFloat(refRow.querySelector(".mw").value) || 0;

    // Molecular weight fallback heuristics
    if (prodMW <= 0 && subMW > 0) prodMW = subMW;
    if (subMW <= 0 && prodMW > 0) subMW = prodMW;
    if (prodMW <= 0 && subMW <= 0) { prodMW = 100; subMW = 100; }

    // Stage actual output must deliver required quantity for downstream stage / final API
    card.querySelector(".stage-actual-qty").value = requiredNextSubstrateKg.toFixed(2);

    // Moles of Product required
    const prodMolesRequired = (requiredNextSubstrateKg * 1000) / prodMW;
    // Input Moles of Reference Starting Material needed
    const subMolesRequired = prodMolesRequired / yieldFraction;
    // Input Mass of Reference Starting Material needed (kg)
    const subKgRequired = (subMolesRequired * subMW) / 1000;

    // Set Sr. No. 1 Quantity
    const refUnit = refRow.querySelector(".unit-select").value;
    const refDensity = parseFloat(refRow.querySelector(".density").value) || 1.0;

    let displayQty = subKgRequired;
    if (refUnit === "L") displayQty = subKgRequired / refDensity;
    else if (refUnit === "g") displayQty = subKgRequired * 1000;

    refRow.querySelector(".qty").value = displayQty.toFixed(3);

    // Feed backward into previous stage
    requiredNextSubstrateKg = subKgRequired;
  }

  // Update Top Metrics Banner
  const ksmStage1Kg = requiredNextSubstrateKg;
  const cumYieldPct = cumulativeYieldFraction * 100;
  const stepdownFactor = targetApiBatchKg > 0 ? ksmStage1Kg / targetApiBatchKg : 1.0;

  document.getElementById("bannerTargetAPI").innerText = targetApiBatchKg.toFixed(2);
  document.getElementById("bannerCumYield").innerText = `${cumYieldPct.toFixed(2)}%`;
  document.getElementById("bannerStepdown").innerText = `${stepdownFactor.toFixed(2)}x`;
  document.getElementById("bannerKsmRequired").innerText = `${ksmStage1Kg.toFixed(2)} kg`;

  isRetroCalculating = false;
  updateStageNumbersAndCascade(true);
  recalculateAll();
}

// -------------------------------------------------------------
// 3. Intelligent Chemical Name Normalizer
// -------------------------------------------------------------
function normalizeChemicalQuery(raw) {
  if (!raw) return "";
  let s = String(raw).trim();

  // Strip percentages & molarities
  s = s.replace(/^\s*\d+(\.\d+)?\s*%\s*(w\/w|v\/v|wt)?\s*/i, "");
  s = s.replace(/\s*\d+(\.\d+)?\s*%\s*(w\/w|v\/v|wt)?/gi, "");
  s = s.replace(/\s*\d+(\.\d+)?\s*M\s*(in\s+[a-z0-9]+)?/gi, "");

  // Strip descriptors
  s = s.replace(/\b(dry powder|wet powder|powder|dry basis|wet basis|floc|flakes|pellets|beads|granules|slurry|dispersion in mineral oil|in mineral oil|in oil|reagent grade|tech grade|technical grade|extra pure|pure|anhydrous|concentrated|conc\.|conc|aqueous|aq\.|aq)\b/gi, "");
  s = s.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();
  return s;
}

// -------------------------------------------------------------
// 4. Multi-Tier Online Chemical Resolver
// -------------------------------------------------------------
async function fetchOnlineChemData(btn, inputElement) {
  const row = inputElement.closest("tr");
  const rawName = inputElement.value.trim();

  if (!rawName) {
    alert("Please enter a Raw Material name first.");
    return;
  }

  const cleanName = normalizeChemicalQuery(rawName);
  const originalIcon = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-indigo-600"></i>`;
  refreshIcons();

  let foundCAS = "";
  let foundMW = 0;
  let foundDensity = 0;

  try {
    // TIER 1: In-App Knowledgebase
    const dbKeyRaw = rawName.toLowerCase();
    const dbKeyClean = cleanName.toLowerCase();
    const matchedDB = INTERNAL_CHEMICAL_DB[dbKeyClean] || INTERNAL_CHEMICAL_DB[dbKeyRaw];

    if (matchedDB) {
      foundCAS = matchedDB.cas || "";
      foundMW = matchedDB.mw || 0;
      foundDensity = matchedDB.density || 0;
    }

    // TIER 2: PubChem
    if (!foundCAS || foundMW === 0 || foundDensity === 0) {
      let cid = null;
      const searchTerms = [cleanName, rawName];

      for (const term of searchTerms) {
        if (!term || cid) continue;
        try {
          const cidRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(term)}/cids/JSON`);
          if (cidRes.ok) {
            const cidData = await cidRes.json();
            cid = cidData?.IdentifierList?.CID?.[0] || null;
          }
        } catch (e) {}
      }

      if (!cid) {
        try {
          const autoRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(cleanName)}/json?limit=1`);
          if (autoRes.ok) {
            const autoData = await autoRes.json();
            const candidate = autoData?.dictionary_terms?.compound?.[0];
            if (candidate) {
              const cidRes2 = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(candidate)}/cids/JSON`);
              if (cidRes2.ok) {
                const cidData2 = await cidRes2.json();
                cid = cidData2?.IdentifierList?.CID?.[0] || null;
              }
            }
          }
        } catch (e) {}
      }

      if (cid) {
        // Molecular Weight
        if (foundMW === 0) {
          try {
            const propRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularWeight/JSON`);
            if (propRes.ok) {
              const propData = await propRes.json();
              foundMW = parseFloat(propData?.PropertyTable?.Properties?.[0]?.MolecularWeight) || 0;
            }
          } catch (e) {}
        }

        // CAS Number via Synonyms
        if (!foundCAS) {
          try {
            const synRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`);
            if (synRes.ok) {
              const synData = await synRes.json();
              const synonyms = synData?.InformationList?.Information?.[0]?.Synonym || [];
              const casRegex = /^[1-9]\d{1,6}-\d{2}-\d$/;
              const match = synonyms.find((item) => casRegex.test(item.trim()));
              if (match) foundCAS = match.trim();
            }
          } catch (e) {}
        }

        // Experimental Density via PubChem PUG View
        if (foundDensity === 0) {
          foundDensity = await fetchDensityFromPubChemPUGView(cid);
        }
      }
    }

    // TIER 3: NCI CIR Fallback
    if (!foundCAS || foundMW === 0) {
      try {
        if (!foundCAS) {
          const cactusCas = await fetch(`https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(cleanName)}/cas`);
          if (cactusCas.ok) {
            const txt = (await cactusCas.text()).trim();
            if (/^[1-9]\d{1,6}-\d{2}-\d$/.test(txt)) foundCAS = txt;
          }
        }
        if (foundMW === 0) {
          const cactusMW = await fetch(`https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(cleanName)}/mw`);
          if (cactusMW.ok) {
            const val = parseFloat(await cactusMW.text());
            if (val > 0) foundMW = val;
          }
        }
      } catch (e) {}
    }

    // Apply Values
    let appliedCount = 0;
    if (foundCAS) {
      row.querySelector(".cas-no").value = foundCAS;
      appliedCount++;
    }
    if (foundMW > 0) {
      row.querySelector(".mw").value = foundMW.toFixed(2);
      appliedCount++;
    }
    if (foundDensity > 0) {
      row.querySelector(".density").value = foundDensity.toFixed(3);
      appliedCount++;
      if (foundDensity !== 1.0) {
        row.querySelector(".ratio-type").value = "volume";
        row.querySelector(".unit-select").value = "L";
      }
    } else {
      if (row.querySelector(".density").value === "" || parseFloat(row.querySelector(".density").value) === 0) {
        row.querySelector(".density").value = "1.0";
      }
    }

    if (appliedCount > 0) {
      conditionalAutoRetroScale();
      recalculateAll();
      saveStateToLocalStorage();
    } else {
      alert(`Could not resolve data for "${rawName}". Please enter manually.`);
    }

  } catch (err) {
    console.error("Chemical Resolver Error:", err);
    alert("Online resolver lookup failed. Please enter details manually.");
  } finally {
    btn.innerHTML = originalIcon;
    refreshIcons();
  }
}

async function fetchDensityFromPubChemPUGView(cid) {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Density`;
    const res = await fetch(url);
    if (!res.ok) return 0;
    const json = await res.json();

    let densityStr = null;
    function walkTree(node) {
      if (!node) return;
      if (node.TOCHeading === "Density" && node.Information) {
        for (const info of node.Information) {
          if (info.Value?.StringWithMarkup?.[0]?.String) {
            densityStr = info.Value.StringWithMarkup[0].String;
            return;
          }
          if (typeof info.Value?.Number?.[0] === "number") {
            densityStr = String(info.Value.Number[0]);
            return;
          }
        }
      }
      if (node.Section && Array.isArray(node.Section)) {
        for (const child of node.Section) {
          walkTree(child);
          if (densityStr) return;
        }
      }
    }

    if (json.Record?.Section) {
      for (const rootSec of json.Record.Section) {
        walkTree(rootSec);
        if (densityStr) break;
      }
    }

    if (densityStr) {
      const match = densityStr.match(/([0-9]+\.[0-9]+|[0-9]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (val > 0.1 && val < 30) return val;
      }
    }
  } catch (e) {
    console.warn("PUG View parse error:", e);
  }
  return 0;
}

// -------------------------------------------------------------
// 5. Excel Price Master Parser & Autocomplete
// -------------------------------------------------------------
function cleanHeader(headerStr) {
  if (!headerStr) return "";
  return String(headerStr).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function extractCellValue(row, variations) {
  const rowKeys = Object.keys(row);
  for (const variant of variations) {
    const matchedKey = rowKeys.find(k => cleanHeader(k) === cleanHeader(variant));
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      return row[matchedKey];
    }
  }
  return "";
}

function parseNumericValue(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  return parseFloat(cleaned) || 0;
}

function handleExcelPriceMasterUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!jsonData || jsonData.length === 0) {
        alert("Uploaded Excel sheet is empty.");
        return;
      }

      priceMaster = {};

      jsonData.forEach((row) => {
        const name = String(extractCellValue(row, [
          "Name of Raw Material", "Raw Material Name", "Raw Material", "Material Name",
          "Material", "RM Name", "RM", "Item Name", "Item", "Description", "Name"
        ])).trim();

        const cas = String(extractCellValue(row, [
          "CAS No", "CAS No.", "CAS Number", "CAS", "CAS Reg No"
        ])).trim();

        const mw = parseNumericValue(extractCellValue(row, [
          "Molecular Weight", "Mol Weight", "Mol Wt", "MW", "Mol. Wt."
        ]));

        const density = parseNumericValue(extractCellValue(row, [
          "Density", "Sp Gravity", "Specific Gravity", "Density (g/mL)"
        ]));

        const rate = parseNumericValue(extractCellValue(row, [
          "Rate/Kg", "Rate / Kg", "Rate/kg", "Rate", "Price/Kg", "Price", "Cost/Kg", "Cost", "Price/kg"
        ]));

        if (name) {
          priceMaster[name.toLowerCase()] = {
            name: name,
            cas: cas,
            mw: mw,
            density: density > 0 ? density : 0,
            rate: rate
          };
        }
      });

      localStorage.setItem(PRICE_MASTER_STORAGE_KEY, JSON.stringify(priceMaster));
      renderDatalist();

      const totalItems = Object.keys(priceMaster).length;
      document.getElementById("uploadLabel").innerText = `Loaded (${totalItems} items)`;
      alert(`Loaded ${totalItems} raw materials from price master.`);

      document.querySelectorAll(".rm-name").forEach((input) => autoFillRM(input));
      recalculateAll();
      saveStateToLocalStorage();
    } catch (err) {
      console.error("Failed to parse Excel Price Master:", err);
      alert("Failed to parse file. Please verify column headers.");
    }
  };
  reader.readAsArrayBuffer(file);
}

function loadPriceMasterFromCache() {
  try {
    const raw = localStorage.getItem(PRICE_MASTER_STORAGE_KEY);
    if (raw) {
      priceMaster = JSON.parse(raw);
      renderDatalist();
      const count = Object.keys(priceMaster).length;
      if (count > 0) {
        document.getElementById("uploadLabel").innerText = `Loaded (${count} items)`;
      }
    }
  } catch (e) {
    console.warn("Could not load price master cache:", e);
  }
}

function renderDatalist() {
  const dataList = document.getElementById("rmMasterList");
  dataList.innerHTML = "";

  Object.values(priceMaster).forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.name;
    opt.label = `Rate: ₹${item.rate}/kg${item.cas ? '| CAS: ' + item.cas : ''}`;
    dataList.appendChild(opt);
  });
}

function autoFillRM(input) {
  const row = input.closest("tr");
  if (!row) return;

  const rawVal = input.value.trim();
  const lowerVal = rawVal.toLowerCase();
  const cleanVal = normalizeChemicalQuery(rawVal).toLowerCase();

  // Match in Price Master
  if (priceMaster[lowerVal] || priceMaster[cleanVal]) {
    const item = priceMaster[lowerVal] || priceMaster[cleanVal];
    if (item.cas) row.querySelector(".cas-no").value = item.cas;
    if (item.mw > 0) row.querySelector(".mw").value = item.mw;
    if (item.density > 0) row.querySelector(".density").value = item.density;
    if (item.rate > 0) row.querySelector(".rate").value = item.rate;
  }

  // Match in Internal Knowledgebase
  const dbMatch = INTERNAL_CHEMICAL_DB[lowerVal] || INTERNAL_CHEMICAL_DB[cleanVal];
  if (dbMatch) {
    if (!row.querySelector(".cas-no").value && dbMatch.cas) row.querySelector(".cas-no").value = dbMatch.cas;
    if (parseFloat(row.querySelector(".mw").value) === 0 && dbMatch.mw > 0) row.querySelector(".mw").value = dbMatch.mw;
    if (dbMatch.density > 0) {
      row.querySelector(".density").value = dbMatch.density;
      if (dbMatch.isLiquid) {
        row.querySelector(".ratio-type").value = "volume";
        row.querySelector(".unit-select").value = "L";
      }
    }
  }
}

// -------------------------------------------------------------
// 6. Persistent Local Storage
// -------------------------------------------------------------
function getSerializedProjectState() {
  const state = {
    projectName: document.getElementById("projectName").value || "",
    apiBatchSize: parseFloat(document.getElementById("apiBatchSize").value) || 100,
    retroMode: document.getElementById("retroModeToggle")?.checked ?? true,
    stages: []
  };

  document.querySelectorAll(".stage-card").forEach((stageCard) => {
    const stageObj = {
      stageName: stageCard.querySelector(".stage-name-input").value || "",
      prodName: stageCard.querySelector(".stage-prod-name").value || "",
      prodMw: stageCard.querySelector(".stage-prod-mw").value || "0",
      targetYield: stageCard.querySelector(".stage-target-yield").value || "85",
      actualQty: stageCard.querySelector(".stage-actual-qty").value || "0",
      materials: []
    };

    stageCard.querySelectorAll("tbody tr").forEach((row) => {
      stageObj.materials.push({
        cas: row.querySelector(".cas-no").value || "",
        name: row.querySelector(".rm-name").value || "",
        density: row.querySelector(".density").value || "1.0",
        ratioType: row.querySelector(".ratio-type").value || "mole",
        ratioVal: row.querySelector(".mole-vol-ratio").value || "1.00",
        qty: row.querySelector(".qty").value || "0",
        unit: row.querySelector(".unit-select").value || "kg",
        mw: row.querySelector(".mw").value || "0",
        recPercent: row.querySelector(".rec-percent").value || "0",
        rate: row.querySelector(".rate").value || "0"
      });
    });

    state.stages.push(stageObj);
  });

  return state;
}

function saveStateToLocalStorage() {
  if (isRestoringState) return;
  try {
    const state = getSerializedProjectState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const indicator = document.getElementById("autoSaveIndicator");
    if (indicator) {
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      indicator.innerHTML = `<i data-lucide="check-circle-2" class="w-3.5 h-3.5 mr-1"></i> Auto-saved at ${timeStr}`;
      refreshIcons();
    }
  } catch (err) {
    console.error("LocalStorage save failed:", err);
  }
}

function loadProjectFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const state = JSON.parse(raw);
    return applyProjectState(state);
  } catch (err) {
    console.error("Failed to restore from LocalStorage:", err);
    return false;
  }
}

function applyProjectState(state) {
  if (!state || !state.stages || state.stages.length === 0) return false;

  isRestoringState = true;

  document.getElementById("projectName").value = state.projectName || "";
  document.getElementById("apiBatchSize").value = state.apiBatchSize || 100;
  if (document.getElementById("retroModeToggle")) {
    document.getElementById("retroModeToggle").checked = state.retroMode ?? true;
  }

  const container = document.getElementById("stagesContainer");
  container.innerHTML = "";
  stageCount = 0;

  state.stages.forEach((stageData) => {
    stageCount++;
    const stageId = `stage_${Date.now()}_${stageCount}`;
    const stageCard = document.createElement("div");
    stageCard.className = "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden stage-card";
    stageCard.id = stageId;

    stageCard.innerHTML = getStageTemplateHTML(stageId, stageData.stageName);
    container.appendChild(stageCard);

    stageCard.querySelector(".stage-prod-name").value = stageData.prodName || "";
    stageCard.querySelector(".stage-prod-mw").value = stageData.prodMw || "0";
    stageCard.querySelector(".stage-target-yield").value = stageData.targetYield || "85";
    stageCard.querySelector(".stage-actual-qty").value = stageData.actualQty || "0";

    const tbody = stageCard.querySelector("tbody");
    tbody.innerHTML = "";

    (stageData.materials || []).forEach((mat, idx) => {
      const isFirst = idx === 0;
      const row = document.createElement("tr");
      row.innerHTML = getMaterialRowHTML(isFirst, idx + 1);

      row.querySelector(".cas-no").value = mat.cas || "";
      row.querySelector(".rm-name").value = mat.name || "";
      row.querySelector(".density").value = mat.density || "1.0";
      row.querySelector(".ratio-type").value = mat.ratioType || "mole";
      row.querySelector(".mole-vol-ratio").value = mat.ratioVal || "1.00";
      row.querySelector(".qty").value = mat.qty || "0";
      row.querySelector(".unit-select").value = mat.unit || "kg";
      row.querySelector(".mw").value = mat.mw || "0";
      row.querySelector(".rec-percent").value = mat.recPercent || "0";
      row.querySelector(".rate").value = mat.rate || "0";

      tbody.appendChild(row);
    });
  });

  isRestoringState = false;
  updateStageNumbersAndCascade(true);
  recalculateAll();
  refreshIcons();
  return true;
}

function resetProject() {
  if (confirm("Reset current project? Unsaved changes will be cleared.")) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

// -------------------------------------------------------------
// 7. Background 5-Second Local Disk Auto-Save & Sync
// -------------------------------------------------------------
async function handleFiveSecondAutoSave() {
  saveStateToLocalStorage();

  if (localFileHandle) {
    try {
      const state = getSerializedProjectState();
      const wb = buildWorkbookFromState(state);
      const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      const writable = await localFileHandle.createWritable();
      await writable.write(arrayBuffer);
      await writable.close();

      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      document.getElementById("syncBtnLabel").innerText = `Disk Synced (${timeStr})`;
    } catch (err) {
      console.warn("Background local disk sync warning:", err);
    }
  }
}

async function linkLocalDiskFile() {
  if (!window.showSaveFilePicker) {
    alert("File System Access API is not supported in this browser. Browser cache auto-save remains fully active.");
    return;
  }

  try {
    const projectName = (document.getElementById("projectName").value || "Pharma_API_RMC").replace(/\s+/g, "_");
    localFileHandle = await window.showSaveFilePicker({
      suggestedName: `${projectName}_AutoSaved.xlsx`,
      types: [{
        description: "Excel Spreadsheet",
        accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] }
      }]
    });

    document.getElementById("syncBtnLabel").innerText = "Linked: Saving every 5s";
    document.getElementById("btnLinkLocalFile").classList.replace("bg-slate-800", "bg-emerald-800");
    handleFiveSecondAutoSave();
  } catch (err) {
    console.log("File link cancelled by user.");
  }
}

// -------------------------------------------------------------
// 8. Stage & Material HTML Template Generators
// -------------------------------------------------------------
function getStageTemplateHTML(stageId, stageTitle) {
  return `
    <div class="bg-slate-100 px-4 py-3 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
      <div class="flex items-center space-x-2 flex-grow max-w-md">
        <span class="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded stage-badge">Stage</span>
        <input 
          type="text" 
          value="${stageTitle}" 
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
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
        <div class="md:col-span-2">
          <label class="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">Isolated Product / Intermediate Name</label>
          <input type="text" class="stage-prod-name w-full border rounded px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white" value="Intermediate Output" oninput="handleStageNameChange()" />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">Product MW (g/mol)</label>
          <div class="flex items-center space-x-1">
            <input type="number" step="any" class="stage-prod-mw w-full border rounded px-2 py-1 text-xs font-semibold text-slate-700 bg-white text-right" value="0" />
            <button type="button" title="Auto-fetch Product MW online" onclick="fetchProductMWOnline(this)" class="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-bold text-violet-700 uppercase mb-0.5" title="Target/Expected yield used by retro-scaler">Target % Molar Yield</label>
          <input type="number" step="any" min="1" max="100" class="stage-target-yield w-full border border-violet-300 rounded px-2 py-1 text-xs font-bold text-violet-700 bg-violet-50 text-right" value="85" />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-600 uppercase mb-0.5">Actual Output (kg)</label>
          <input type="number" step="any" class="stage-actual-qty w-full border rounded px-2 py-1 text-xs font-bold text-indigo-700 bg-white text-right" value="80.00" />
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
}

function getMaterialRowHTML(isFirstRow, rowCount) {
  return `
    <td class="text-center font-bold text-slate-500 sr-no">${rowCount}</td>
    <td><input type="text" class="cas-no w-24" placeholder="CAS No." /></td>
    <td>
      <div class="flex items-center space-x-1">
        <input 
          type="text" 
          list="rmMasterList" 
          class="rm-name w-40 font-medium" 
          placeholder="Select/Enter RM" 
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
    <td><input type="number" step="any" class="density w-16 text-right" value="1.0" /></td>
    <td>
      <select class="ratio-type text-xs">
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
      />
    </td>
    <td>
      <input 
        type="number" 
        step="any" 
        class="qty w-20 text-right font-medium ${!isFirstRow ? 'calc-highlight' : ''}" 
        value="${isFirstRow ? '100' : '0'}" 
      />
    </td>
    <td>
      <select class="unit-select text-xs font-semibold">
        <option value="kg" selected>Kg</option>
        <option value="L">L</option>
        <option value="g">g</option>
      </select>
    </td>
    <td><input type="number" step="any" class="mw w-16 text-right" value="0" /></td>
    <td class="read-only-cell moles">0.00</td>
    <td class="read-only-cell qty-per-kg">0.0000</td>
    <td><input type="number" step="any" class="rec-percent w-14 text-right" value="0" min="0" max="100" /></td>
    <td class="read-only-cell qty-per-kg-rec">0.0000</td>
    <td><input type="number" step="any" class="rate w-16 text-right font-medium" value="0" /></td>
    <td class="read-only-cell cost-wo-rec">0.00</td>
    <td class="read-only-cell cost-w-rec">0.00</td>
    <td class="read-only-cell cont-wo-rec">0.00%</td>
    <td class="read-only-cell cont-w-rec">0.00%</td>
    <td class="text-center">
      ${isFirstRow ? '<span class="text-xs text-slate-300">Ref</span>' : '<button onclick="removeRow(this)" class="text-slate-400 hover:text-rose-600 transition"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>'}
    </td>
  `;
}

function addNewStage(defaultStageName) {
  stageCount++;
  const stageId = `stage_${Date.now()}_${stageCount}`;
  const container = document.getElementById("stagesContainer");

  const stageCard = document.createElement("div");
  stageCard.className = "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden stage-card";
  stageCard.id = stageId;

  stageCard.innerHTML = getStageTemplateHTML(stageId, defaultStageName);
  container.appendChild(stageCard);

  addMaterialRow(stageId);
  updateStageNumbersAndCascade(false);
  refreshIcons();
}

function removeStage(stageId) {
  const stage = document.getElementById(stageId);
  if (stage) {
    stage.remove();
    updateStageNumbersAndCascade(false);
    conditionalAutoRetroScale();
    recalculateAll();
    saveStateToLocalStorage();
  }
}

function addMaterialRow(stageId) {
  const tbody = document.querySelector(`#table_${stageId} tbody`);
  const rowCount = tbody.children.length + 1;
  const row = document.createElement("tr");

  row.innerHTML = getMaterialRowHTML(rowCount === 1, rowCount);
  tbody.appendChild(row);

  updateStageNumbersAndCascade(false);
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
  saveStateToLocalStorage();
}

function updateStageNumbersAndCascade(preserveExisting = false) {
  const stageCards = document.querySelectorAll(".stage-card");
  stageCards.forEach((card, index) => {
    const stageNum = index + 1;
    card.querySelector(".stage-badge").innerText = `Stage ${stageNum}`;

    const firstRow = card.querySelector("tbody tr:first-child");
    if (firstRow && index > 0 && !preserveExisting) {
      const rmInput = firstRow.querySelector(".rm-name");
      const mwInput = firstRow.querySelector(".mw");
      const qtyInput = firstRow.querySelector(".qty");

      const prevCard = stageCards[index - 1];
      const prevProdName = prevCard.querySelector(".stage-prod-name").value.trim() || `Intermediate Stage-${index}`;
      const prevProdMW = parseFloat(prevCard.querySelector(".stage-prod-mw").value) || 0;
      const prevActualQty = parseFloat(prevCard.querySelector(".stage-actual-qty").value) || 0;

      rmInput.value = prevProdName;
      if (prevProdMW > 0 && parseFloat(mwInput.value) === 0) mwInput.value = prevProdMW;
      if (prevActualQty > 0 && parseFloat(qtyInput.value) === 0) qtyInput.value = prevActualQty;
    }
  });
}

function handleStageNameChange() {
  updateStageNumbersAndCascade(false);
  conditionalAutoRetroScale();
  recalculateAll();
  saveStateToLocalStorage();
}

async function fetchProductMWOnline(btn) {
  const card = btn.closest(".stage-card");
  const prodName = card.querySelector(".stage-prod-name").value.trim();
  if (!prodName) {
    alert("Please enter intermediate product name.");
    return;
  }

  const cleanName = normalizeChemicalQuery(prodName);
  const originalIcon = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-indigo-600"></i>`;
  refreshIcons();

  try {
    const propRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(cleanName)}/property/MolecularWeight/JSON`);
    if (propRes.ok) {
      const propData = await propRes.json();
      const mw = propData?.PropertyTable?.Properties?.[0]?.MolecularWeight || 0;
      if (mw > 0) {
        card.querySelector(".stage-prod-mw").value = parseFloat(mw).toFixed(2);
        conditionalAutoRetroScale();
        recalculateAll();
        saveStateToLocalStorage();
      }
    } else {
      alert(`No online record found for "${prodName}".`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    btn.innerHTML = originalIcon;
    refreshIcons();
  }
}

// -------------------------------------------------------------
// 9. Forward Stoichiometry, Yield & Cost Engine
// -------------------------------------------------------------
function recalculateAll() {
  const apiBatchSize = parseFloat(document.getElementById("apiBatchSize").value) || 1;
  const stageCards = document.querySelectorAll(".stage-card");

  let grandTotalCostWithoutRec = 0;
  let grandTotalCostWithRec = 0;
  let globalTotalInputMassKg = 0;

  stageCards.forEach((stageCard) => {
    const rows = Array.from(stageCard.querySelectorAll("tbody tr"));
    if (rows.length === 0) return;

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
    let stageSubtotalWoRec = 0;
    let stageSubtotalWRec = 0;

    // Rows
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

      if (!isFirst && !isRestoringState) {
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

      stageSubtotalWoRec += costWithoutRec;
      stageSubtotalWRec += costWithRec;
      grandTotalCostWithoutRec += costWithoutRec;
      grandTotalCostWithRec += costWithRec;
    });

    globalTotalInputMassKg += stageTotalMassInKg;

    stageCard.querySelector(".stage-subtotal-wo-rec").innerText = `₹ ${stageSubtotalWoRec.toFixed(2)}`;
    stageCard.querySelector(".stage-subtotal-w-rec").innerText = `₹ ${stageSubtotalWRec.toFixed(2)}`;

    // Yield & Mass Balance
    const prodMW = parseFloat(stageCard.querySelector(".stage-prod-mw").value) || 0;
    const actualOutKg = parseFloat(stageCard.querySelector(".stage-actual-qty").value) || 0;

    const theorOutKg = (refMoles > 0 && prodMW > 0) ? (refMoles * prodMW) / 1000 : 0;
    const actualMoles = (actualOutKg > 0 && prodMW > 0) ? (actualOutKg * 1000) / prodMW : 0;
    const molarYieldPct = refMoles > 0 ? (actualMoles / refMoles) * 100 : 0;
    const wwYieldPct = refQtyInKg > 0 ? (actualOutKg / refQtyInKg) * 100 : 0;
    const massLossKg = Math.max(0, stageTotalMassInKg - (actualOutKg + stageTotalRecoveredKg));
    const stagePMI = actualOutKg > 0 ? stageTotalMassInKg / actualOutKg : 0;

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

  // Contributions
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

  // Totals
  const totalSavings = grandTotalCostWithoutRec - grandTotalCostWithRec;
  const savingsPct = grandTotalCostWithoutRec > 0 ? (totalSavings / grandTotalCostWithoutRec) * 100 : 0;
  const cumulativePMI = apiBatchSize > 0 ? globalTotalInputMassKg / apiBatchSize : 0;

  document.getElementById("totalCostWithoutRec").innerText = `₹ ${grandTotalCostWithoutRec.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("totalCostWithRec").innerText = `₹ ${grandTotalCostWithRec.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("totalSavings").innerText = `₹ ${totalSavings.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("savingsPercentage").innerText = `${savingsPct.toFixed(2)}% total savings`;
  document.getElementById("cumulativePMI").innerText = cumulativePMI.toFixed(2);
}

// -------------------------------------------------------------
// 10. Excel Import/Export Handling
// -------------------------------------------------------------
function buildWorkbookFromState(state) {
  const wb = XLSX.utils.book_new();
  const exportData = [];

  document.querySelectorAll(".stage-card").forEach((stageCard) => {
    const stageName = stageCard.querySelector(".stage-name-input").value;
    const prodName = stageCard.querySelector(".stage-prod-name").value;
    const prodMw = stageCard.querySelector(".stage-prod-mw").value;
    const targetYield = stageCard.querySelector(".stage-target-yield").value;
    const actualKg = stageCard.querySelector(".stage-actual-qty").value;
    const theorKg = stageCard.querySelector(".stage-theor-qty").innerText;
    const molarYield = stageCard.querySelector(".stage-molar-yield").innerText;
    const wwYield = stageCard.querySelector(".stage-ww-yield").innerText;
    const stageCostWo = stageCard.querySelector(".stage-subtotal-wo-rec").innerText;
    const stageCostW = stageCard.querySelector(".stage-subtotal-w-rec").innerText;
    const stageCont = stageCard.querySelector(".stage-subtotal-cont-rec").innerText;

    exportData.push({ "Stage / Material": `=== ${stageName.toUpperCase()} ===` });
    exportData.push({
      "Stage / Material": `Product: ${prodName} | MW: ${prodMw} g/mol \vert{} Target Yield:${targetYield}% | Actual Out: ${actualKg} kg \vert{} Theor Out:${theorKg} | % Molar Yield: ${molarYield} \vert{} \% w/w:${wwYield}`
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

  const metaSheet = XLSX.utils.json_to_sheet([{ projectStateJson: JSON.stringify(state) }]);
  XLSX.utils.book_append_sheet(wb, metaSheet, "__RMC_PROJECT_DATA__");

  return wb;
}

function exportToExcel() {
  const state = getSerializedProjectState();
  const projectName = (state.projectName || "Pharma_API_RMC").replace(/\s+/g, "_");
  const wb = buildWorkbookFromState(state);
  XLSX.writeFile(wb, `${projectName}_RMC_Costing.xlsx`);
}

function handleProjectExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      if (workbook.SheetNames.includes("__RMC_PROJECT_DATA__")) {
        const metaSheet = workbook.Sheets["__RMC_PROJECT_DATA__"];
        const rawJson = XLSX.utils.sheet_to_json(metaSheet);
        if (rawJson && rawJson[0] && rawJson[0].projectStateJson) {
          const state = JSON.parse(rawJson[0].projectStateJson);
          applyProjectState(state);
          saveStateToLocalStorage();
          alert(`Successfully imported project: "${state.projectName || 'Unnamed'}"`);
          return;
        }
      }

      alert("Uploaded file does not contain embedded RMC project state. Please upload an Excel sheet generated by this application.");
    } catch (err) {
      console.error(err);
      alert("Failed to load project file.");
    }
  };
  reader.readAsArrayBuffer(file);
}
