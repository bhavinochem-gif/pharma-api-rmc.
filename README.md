# Pharma API Raw Material Costing (RMC) & Stoichiometry Engine

A specialized, client-side process chemistry costing web application designed for Process Chemistry, Chemical R&D, and API Plant Operations.

---

## 💾 Project Persistence & Background Auto-Save

1. **Page Refresh Protection**: Every input keystroke is stored in browser cache (`localStorage`). Refreshing or closing your browser tab preserves all data.
2. **5-Second Background Disk Sync**: Click **"Link Local Disk Auto-Save (5s)"** to select a target `.xlsx` file on your computer. The application will write and sync all calculations to your local disk silently every 5 seconds.
3. **Re-Open & Update Existing Projects**: Every exported `.xlsx` file includes an embedded `__RMC_PROJECT_DATA__` state. Click **"Open Saved Project (.xlsx)"** to upload any previous file and resume editing.

---

## 📋 Excel Price Master Upload Template

To auto-fill prices, CAS numbers, molecular weights, and densities, upload an Excel file (`.xlsx`) or `.csv` with these headers:

| Name of Raw Material | CAS No | Molecular Weight | Density | Rate/Kg |
| :--- | :--- | :--- | :--- | :--- |
| Benzaldehyde | 100-52-7 | 106.12 | 1.044 | 350.00 |
| Acetone | 67-64-1 | 58.08 | 0.784 | 85.00 |
| Sodium Hydroxide | 1310-73-2 | 40.00 | 2.130 | 65.00 |
| Toluene | 108-88-3 | 92.14 | 0.867 | 95.00 |

---

## ⚗️ Process Stoichiometry & Mass Balance Equations

* **Sr. No. 1 Reference**: Fixed at Mole Ratio `1.00`.
  $$\text{Moles} = \frac{\text{Mass (kg)} \times 1000}{\text{MW (g/mol)}}$$
* **Sr. No. 2+ Stoichiometry**:
  * *Mole Ratio*: $\text{Qty (kg)} = \frac{(\text{Ref Moles} \times \text{Mole Ratio}) \times \text{MW}}{1000}$
  * *Volume Ratio ($V/W$)*: $\text{Qty (L)} = \text{Ref Mass (kg)} \times \text{Vol Ratio}$
* **Theoretical Yield (kg)**:
  $$\text{Theoretical Output} = \frac{\text{Moles of Sr. 1} \times \text{Product MW}}{1000}$$
* **% Molar Yield**:
  $$\% \text{ Molar Yield} = \left(\frac{\text{Actual Output (kg)} \times 1000 / \text{Product MW}}{\text{Moles of Sr. 1}}\right) \times 100$$
