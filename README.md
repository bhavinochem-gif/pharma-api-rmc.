# Pharma API Raw Material Costing (RMC), Scale-Up & Consolidated BOM Engine

A comprehensive browser application engineered for Process Chemistry, Chemical R&D, and Production Planning to scale recipes, calculate solvent recoveries, and aggregate raw material procurement quantities across multi-stage syntheses.

---

## 📦 Key Consolidated BOM Capabilities

1. **Multi-Stage Material Consolidation**:
   * If a solvent or reagent (e.g., Methanol) is used across multiple reaction stages (e.g., Stage 1, Stage 2, and Stage 3), the engine groups the material by name and unit.
   * Outputs a single row in the exported BOM containing:
     - **Total Gross Quantity Required** across all stages.
     - **Total Solvent Recovered Quantity**.
     - **Net Fresh Quantity Required** for purchase.
     - Traceability list of all stages where the material is consumed.

2. **Dual Export Options**:
   * **Export Consolidated BOM**: Generates a dedicated procurement sheet with totals, neat borders, and stage traceability.
   * **Export Full RMC Workbook**: Generates a multi-sheet Excel file containing both `Stage_Costing_Breakdown` and `Consolidated_BOM`.

3. **Reverse-Yield Scale-Up (`Auto-Scale`)**:
   * Enter your desired finished API batch quantity (e.g., `50 kg`) and click **Auto-Scale**.
   * Evaluates yields backwards from the final reaction stage to Stage 1, automatically scaling all intermediate batches and ratio-linked reagents.

---

## 🌐 Deploy to GitHub Pages

1. Push `index.html`, `style.css`, `app.js`, and `README.md` to your GitHub repository.
2. Under **Settings > Pages**, choose **Branch: `main`** and **Folder: `/(root)`**.
3. Click **Save** to make the app accessible online.
