# Pharma API Raw Material Costing (RMC), Scale-Up & Consolidated BOM Engine

A modern browser application engineered for Process Chemistry, Chemical R&D, Tech Transfer, and Commercial Operations to simulate multi-stage synthesis, reverse yield cascades, solvent recovery savings, and stage-transfer economics.

---

## ⚗️ Key Chemical Engineering Features

1. **Persistent Local Session & Auto-Save**:
   - Continuous background auto-save to browser `localStorage`.
   - Work survives refreshes, browser reboots, and tab closures without loss of data.
   - Use the **New / Reset** button to wipe cached sessions and start fresh.

2. **Full RMC Sheet Import**:
   - Re-upload any previously exported `..._RMC_Full_Workbook.xlsx` file via the **Import RMC Sheet** button.
   - Restores stages, materials, stoichiometric ratios, recovery rates, and isolated yields into editable inputs.

3. **Dynamic In-Page Intermediate Cost Transfer**:
   - Reference any upstream stage name or intermediate product name in downstream reaction rows.
   - Automatically imports Molecular Weight, marks CAS as `In-house Int.`, and syncs both **Rate w/o Rec.** and **Rate with Rec.**.
   - Prevents double-counting by isolating virgin raw materials in global procurement tallies.

4. **Multi-Stage Consolidated BOM (Procurement Planning)**:
   - Groups identical reagents and solvents (e.g., Methanol) across all stages into a single entry.
   - Computes Gross Quantity Required, Total Distillation Recovery, and Net Fresh Quantity Required.

5. **Reverse-Yield Scale-Up Cascade (`Auto-Scale`)**:
   - Enter your commercial target API batch size and click **Auto-Scale**.
   - Back-calculates yield losses from the final isolation stage to Stage 1, adjusting starting materials and ratio-linked reagents automatically.

6. **Online PubChem Integration**:
   - Click the **✨ (Sparkles)** icon next to any chemical name to query the NIH PubChem REST API in real time for CAS number, Molecular Weight, and common solvent density.

---

## 🚀 Deployment to GitHub Pages

1. Push `index.html`, `style.css`, `app.js`, and `README.md` to your GitHub repository:
   ```bash
   git add .
   git commit -m "Complete Pharma API RMC application"
   git push origin main
   ```
2. Navigate to your repository on GitHub and open **Settings** > **Pages**.
3. Under **Branch**, select `main` (or `master`) and directory `/ (root)`.
4. Click **Save**. Your tool will be live at `https://<your-username>.github.io/<repo-name>/`.
