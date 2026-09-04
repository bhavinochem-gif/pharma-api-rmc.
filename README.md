# Pharma API Raw Material Costing (RMC) & Retro-Synthetic Engine

A specialized browser-based stoichiometry, retro-synthetic backward batch scaler, and process mass balance application engineered for Pharmaceutical Process R&D and API Plant Operations.

---

## 🗑️ Dual Deletion Controls

### 1. Stage Deletion
* **Option 1 (Header Action)**: Click the **Delete Stage** button located in the top-right header of any stage card.
* **Option 2 (Bottom Control Action)**: Click the **Delete This Stage** button located in the bottom mass-balance footer bar of each stage card (next to the **Clear Materials** shortcut).

### 2. Raw Material Line Deletion
* **Option 1 (Inline Row Action)**: Click the red trash icon on the far-right action column of any individual raw material line.
* **Option 2 (Multi-Select Batch Delete)**: Check the boxes for the lines you want to delete (or use the master checkbox in the column header), then click the **Delete Selected (N)** button that appears on the stage toolbar.

---

## ⚡ Retro-Synthetic Backward Batch Scaler

Enter your **Target API Output (e.g., 100 kg finished API)** and each stage's **Target % Molar Yield** (default: `85%`). The app automatically calculates backward to determine the exact Stage-1 Key Starting Material (KSM) mass needed:

$$\text{Moles}_{\text{Product}, k} = \frac{\text{Required Mass}_k \times 1000}{MW_{\text{Product}, k}}$$

$$\text{Required Moles}_{\text{Substrate}, k} = \frac{\text{Moles}_{\text{Product}, k}}{\text{Yield Fraction}_k}$$

$$\text{Required Mass}_{\text{Substrate}, k} = \frac{\text{Required Moles}_{\text{Substrate}, k} \times MW_{\text{Substrate}, k}}{1000}$$

---

## 🌐 Deploy to GitHub Pages

1. Commit and push `index.html`, `style.css`, `app.js`, and `README.md` to your GitHub repository (`main` branch).
2. Ensure **Settings > Pages** is pointing to `/ (root)`.
3. Your web app will automatically build and update within 1–3 minutes.
