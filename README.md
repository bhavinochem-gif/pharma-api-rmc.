# Pharma API Raw Material Costing (RMC) & Stoichiometry Engine

A dedicated browser-based process chemistry and cost-contribution engine for Process R&D, Tech Transfer, and Chemical Plant Operations.

---

## 📋 Excel Price Master Upload Template

The application accepts `.xlsx` or `.csv` files. Column headers are automatically normalized to tolerate arbitrary spaces, capitalization, and naming conventions:

| Name of Raw Material | CAS No | Molecular Weight | Density | Rate/Kg |
| :--- | :--- | :--- | :--- | :--- |
| Benzaldehyde | 100-52-7 | 106.12 | 1.044 | 350.00 |
| Acetone | 67-64-1 | 58.08 | 0.784 | 85.00 |
| Sodium Hydroxide | 1310-73-2 | 40.00 | 2.130 | 65.00 |
| Toluene | 108-88-3 | 92.14 | 0.867 | 95.00 |

*Supported Alternative Header Names:*
* **Material Name**: `Name of Raw Material`, `Raw Material`, `RM Name`, `Material Description`, `Item Name`
* **Price**: `Rate/Kg`, `Rate / Kg`, `Price`, `Rate`, `Price/Kg`, `Cost/Kg`
* **Molecular Weight**: `Molecular Weight`, `Mol Weight`, `MW`, `Mol. Wt.`
* **Density**: `Density`, `Specific Gravity`, `Sp Gravity`

---

## 💾 Page Refresh & Auto-Save Features

1. **Global Storage Sync**: Every character typed into any field or table cell is immediately stored in your browser's persistent `localStorage`. Refreshing or accidentally closing the browser preserves your entire workspace.
2. **Persistent Price Master**: Uploaded RM prices remain active and accessible across page refreshes.
3. **5-Second Local Disk Sync**: Click **Link Local Disk Auto-Save (5s)** to automatically synchronize and write calculations directly to an `.xlsx` file on your computer every 5 seconds.
4. **Re-Open Previous Projects**: Use **Open Saved Project (.xlsx)** to reload and continue working on any previously exported RMC file.

---

## 🌐 Deploy to GitHub Pages

1. Commit and push `index.html`, `style.css`, `app.js`, and `README.md` to your GitHub repository (`main` branch).
2. Go to **Settings > Pages > Branch: `main` > Save**.
3. Changes will be live within 1–3 minutes.
