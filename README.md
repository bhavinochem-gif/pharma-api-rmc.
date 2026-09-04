# Pharma API Raw Material Costing (RMC) & Retro-Synthetic Engine

A browser-based stoichiometry, retro-synthetic backward batch scaler, and process mass balance tool built for Pharmaceutical Process Chemistry, Scale-up, and Commercial API Plant Operations.

---

## ⚡ Retro-Synthetic Backward Batch Scaler

Instead of adjusting starting material quantities by trial and error, the application works backwards from your **Target API Output (e.g., 100 kg API)** to automatically calculate the exact **Stage-1 Key Starting Material (KSM)** required:

1. **Target API Entry**: Specify your final required batch output (e.g., `100 kg`).
2. **Target Molar Yield (%) Entry**: Enter expected stage molar yields (default: `85%`) in each stage's control panel.
3. **Automated Reverse Cascade**:
   $$\text{Moles}_{\text{Product}, k} = \frac{\text{Required Mass}_k \times 1000}{MW_{\text{Product}, k}}$$
   $$\text{Required Moles}_{\text{Substrate}, k} = \frac{\text{Moles}_{\text{Product}, k}}{\text{Yield Fraction}_k}$$
   $$\text{Required Mass}_{\text{Substrate}, k} = \frac{\text{Required Moles}_{\text{Substrate}, k} \times MW_{\text{Substrate}, k}}{1000}$$
4. **Live Metric Sync**: The top banner instantly shows:
   * **Cumulative Process Yield (%)**
   * **Process Step-down Factor ($x$)**
   * **Exact Stage-1 KSM Charge (kg)**

---

## 📋 Excel Price Master Upload Template

Upload any `.xlsx` or `.csv` file. Headers are normalized automatically:

| Name of Raw Material | CAS No | Molecular Weight | Density | Rate/Kg |
| :--- | :--- | :--- | :--- | :--- |
| Benzaldehyde | 100-52-7 | 106.12 | 1.044 | 350.00 |
| Titanium tetraisopropoxide | 546-68-9 | 284.22 | 0.960 | 950.00 |
| 5% Palladium on alumina | 7440-05-3 | 106.42 | 1.000 | 18500.00 |
| Toluene | 108-88-3 | 92.14 | 0.867 | 95.00 |

---

## 💾 Page Refresh & Auto-Save Features

1. **Keystroke Cache Sync**: All changes sync immediately to `localStorage`. Refreshing or closing the tab preserves your work.
2. **5-Second Local Disk Sync**: Click **Link Local Disk Auto-Save (5s)** to automatically synchronize and write calculations directly to an `.xlsx` file on your computer every 5 seconds.
3. **Re-Open Previous Projects**: Use **Open Saved Project (.xlsx)** to reload and continue working on any previously exported RMC file.

---

## 🌐 Deploy to GitHub Pages

1. Commit and push `index.html`, `style.css`, `app.js`, and `README.md` to your GitHub repository (`main` branch).
2. Go to **Settings > Pages > Branch: `main` > Save**.
3. Changes will be live within 1–3 minutes.
