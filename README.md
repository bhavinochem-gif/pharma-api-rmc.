# Pharma API Raw Material Costing (RMC), Mass Balance & Yield Calculator

A browser-based stoichiometry, solvent recovery, and process mass balance tool built for Pharmaceutical Process R&D, Pilot Plant, and Commercial Chemical Manufacturing.

---

## 🧪 Mass Balance & Yield Equations

### 1. Theoretical vs. Actual Yield
* **Theoretical Output (kg)**:
  $$\text{Theor. Output (kg)} = \frac{\text{Moles of Starting Material (Sr. 1)} \times \text{Product MW (g/mol)}}{1000}$$
* **Percentage Molar Yield (% Molar)**:
  $$\% \text{ Molar Yield} = \left(\frac{\text{Actual Isolated Moles}}{\text{Theoretical Moles}}\right) \times 100 = \left(\frac{\frac{\text{Actual Output (kg)} \times 1000}{\text{Product MW}}}{\text{Moles of Sr. 1}}\right) \times 100$$
* **Percentage Mass Yield (% w/w)**:
  $$\% \text{ w/w Yield} = \left(\frac{\text{Actual Isolated Output (kg)}}{\text{Starting Material Mass (kg)}}\right) \times 100$$

---

### 2. Stage Mass Balance & Process Mass Intensity (PMI)
* **Total Stage Mass In (kg)**: Sum of all solids (kg) and solvents ($\text{Volume (L)} \times \text{Density (g/mL)}$) charged.
* **Recovered Solvents (kg)**: Total solvent mass reclaimed via distillation.
* **Process Mass Intensity (PMI)**:
  $$\text{Stage PMI} = \frac{\text{Total Mass In (kg)}}{\text{Actual Product Isolated (kg)}}$$
  $$\text{Cumulative Global PMI} = \frac{\text{Total Raw Materials Charged across All Stages (kg)}}{\text{Final Finished API Output (kg)}}$$

---

## ⚡ Key Workflow Features

1. **Auto-Cascading**: Actual output quantity and molecular weight of Stage $N$ automatically populate as the starting substrate of Stage $N+1$.
2. **PubChem Auto-Lookup**: Search CAS, MW, and solvent densities with real-time online resolution.
3. **Green Chemistry Badges**: Stage molar yields are color-coded:
   * **Green**: $\ge 85\%$
   * **Yellow**: $70\% - 84.9\%$
   * **Red**: $< 70\%$
4. **Excel Export**: Produces comprehensive engineering reports including mass balance parameters, PMI, and stage-wise costs.

---

## 🌐 Deploy to GitHub Pages

1. Push all files to a GitHub repository (`pharma-api-rmc`).
2. Go to **Repository Settings > Pages**.
3. Select **Branch: `main`** and **Folder: `/(root)`**.
4. Click **Save** to make the app live.
