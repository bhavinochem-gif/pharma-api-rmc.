# pharma-api-rmc.
# Raw Material Costing (RMC) Sheet for Pharma API

A lightweight, high-precision client-side application built for Process Chemistry, Chemical R&D, and API Operations to compute Stage-wise Raw Material Costs (RMC), solvent recovery economics, and percentage contributions.

## 🚀 Key Features

- **Multi-Stage Synthesis Support**: Add unlimited stages (e.g., Stage-1, Stage-2, Crude, Purification).
- **Automated Stoichiometry & Costing**:
  - $Moles = \frac{Qty\,(kg) \times 1000}{Molecular\,Weight\,(g/mol)}$
  - $Qty\,/\,kg\,API = \frac{Batch\,RM\,Qty}{Finished\,API\,Batch\,Size}$
  - $Qty\,/\,kg\,API\,(with\,recovery) = Qty\,/\,kg\,API \times \left(1 - \frac{Recovery\%}{100}\right)$
  - Stage-wise and overall % cost contributions calculated in real-time.
- **Master Sheet Auto-Lookup**: Upload an Excel price master sheet to auto-populate SAP Code, CAS No, MW, and Price.
- **Export Ready**: Download formatted Excel reports directly from the browser.

---

## 📊 Excel Master Sheet Format

To use the upload feature, format your Excel file (`.xlsx`) with the following headers:

| SAP Code | CAS No     | Name of Raw Material | Molecular Weight | Rate/Kg |
| :------- | :--------- | :------------------- | :--------------- | :------ |
| RM-10101 | 67-64-1    | Acetone              | 58.08            | 85.00   |
| RM-20412 | 108-88-3   | Toluene              | 92.14            | 95.00   |
| RM-30041 | 224311-51-7| Key Intermediate KSM | 412.50           | 4500.00 |

---

## 🌐 Deploying to GitHub Pages

1. Create a new repository on GitHub: `pharma-api-rmc`.
2. Commit and push `index.html`, `style.css`, `app.js`, and `README.md`.
3. Go to **Settings** > **Pages**.
4. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
5. Click **Save**. Your RMC web application will be live at:
   `https://<your-username>.github.io/pharma-api-rmc/`
