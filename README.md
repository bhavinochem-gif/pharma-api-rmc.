# Pharma API Raw Material Costing (RMC) & Stoichiometry Engine

A dedicated browser-based process chemistry and cost-contribution engine for Process R&D, Tech Transfer, and Chemical Plant Operations.

---

## 📋 Excel Price Master Upload Template

To auto-fill prices, CAS numbers, molecular weights, and densities, prepare an Excel file (`.xlsx`) or `.csv` with these headers:

| Name of Raw Material | CAS No | Molecular Weight | Density | Rate/Kg |
| :--- | :--- | :--- | :--- | :--- |
| Benzaldehyde | 100-52-7 | 106.12 | 1.044 | 350.00 |
| Acetone | 67-64-1 | 58.08 | 0.784 | 85.00 |
| Sodium Hydroxide | 1310-73-2 | 40.00 | 2.130 | 65.00 |
| Toluene | 108-88-3 | 92.14 | 0.867 | 95.00 |

---

## ⚗️ Stoichiometry & Calculation Engine

### 1. Reference Material (Sr. No. 1)
* Sr. No. 1 is the reference substrate ($\text{Mole Ratio} = 1.00$).
* $\text{Moles} = \frac{\text{Mass (kg)} \times 1000}{\text{MW (g/mol)}}$

### 2. Automated Stoichiometry (Sr. No. 2+)
* **Mole Ratio Mode (Molar Equivalents)**:
  $$\text{Required Moles} = \text{Moles of Sr. 1} \times \text{Mole Ratio}$$
  $$\text{Quantity (kg)} = \frac{\text{Required Moles} \times \text{MW}}{1000}$$
* **Volume Ratio Mode ($V/W$ in L/kg of Reference Material)**:
  $$\text{Quantity (L)} = \text{Mass of Sr. 1 (kg)} \times \text{Volume Ratio}$$
  $$\text{Equivalent Mass (kg)} = \text{Quantity (L)} \times \text{Density (g/mL)}$$

### 3. Stage-wise Cost Subtotals
* **Stage RM Cost (w/o Rec.)**: $\sum \text{Cost (w/o Rec.) of all materials in that stage}$
* **Stage RM Cost (with Rec.)**: $\sum \text{Cost (with Rec.) of all materials in that stage}$
* **Stage Cost Contribution**: $\frac{\text{Stage Cost (with Rec.)}}{\text{Grand Total API Cost (with Rec.)}} \times 100$

---

## 🌐 Deploy to GitHub Pages

1. Push these updated files (`index.html`, `style.css`, `app.js`, `README.md`) to your GitHub repository.
2. The GitHub Pages deployment will trigger automatically.
3. Access your updated live app at: `https://<your-username>.github.io/<repo-name>/`
