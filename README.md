# Pharma API Raw Material Costing (RMC) & Retro-Synthetic Engine

A specialized browser-based stoichiometry, retro-synthetic backward batch scaler, and process mass balance application engineered for Pharmaceutical Process R&D and API Plant Operations.

---

## ⚡ Key Features

1. **Retro-Synthetic Backward Batch Scaler**: 
   * Enter your target API output (e.g., 100 kg) and stage-wise expected yields.
   * Automatically calculates required Stage-1 KSM charge:
     $$\text{Required Moles}_{\text{Substrate}, k} = \frac{\text{Moles}_{\text{Product}, k}}{\text{Yield Fraction}_k}$$
     $$\text{Required Mass}_{\text{Substrate}, k} = \frac{\text{Required Moles}_{\text{Substrate}, k} \times MW_{\text{Substrate}, k}}{1000}$$
2. **Dual Deletion System**:
   * **Stages**: Delete via the top header button or the bottom control bar.
   * **Materials**: Delete individual rows directly or use checkboxes for batch multi-row deletion.
3. **Data Protection**:
   * Instant `localStorage` synchronization on every keystroke.
   * Optional 5-second background local disk auto-save via File System Access API.
   * Re-import previously exported `.xlsx` files with full project state restoration.
4. **Comprehensive Chemical Resolver**:
   * Multi-tier lookup via internal database, PubChem PUG REST, PUG View experimental density crawler, and NCI CIR.
   * Automatic chemical query normalizer to resolve catalysts and alkoxides (e.g., *titanium tetraisopropoxide*, *5% palladium on alumina dry powder*).

---

## 📋 Excel Price Master Upload Template

Prepare your `.xlsx` or `.csv` rate master with these column headers:

| Name of Raw Material | CAS No | Molecular Weight | Density | Rate/Kg |
| :--- | :--- | :--- | :--- | :--- |
| Benzaldehyde | 100-52-7 | 106.12 | 1.044 | 350.00 |
| Titanium tetraisopropoxide | 546-68-9 | 284.22 | 0.960 | 950.00 |
| 5% Palladium on alumina | 7440-05-3 | 106.42 | 1.000 | 18500.00 |
| Toluene | 108-88-3 | 92.14 | 0.867 | 95.00 |
