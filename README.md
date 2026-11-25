# JP Sandbox — experiment library

This public repository owns six independent, active web experiments. Google Drive remains the authoritative home of source documents, private evidence and non-runtime archives. Never publish customer submissions, business workbooks or credentials here.

- [Experiment launcher](https://fabingurung.github.io/data-warehouse-random/) — `index.html`
- [Paila Pilates](https://fabingurung.github.io/data-warehouse-random/pilates.html) — studio prototype and browser-only booking demo
- [New Laxmi Store](https://fabingurung.github.io/data-warehouse-random/new-laxmi-rate/) — sample product catalogue
- [Pilates GIS](https://fabingurung.github.io/data-warehouse-random/gis/) — location intelligence
- [JP Atlas](https://fabingurung.github.io/data-warehouse-random/jp-graph/) — knowledge graph
- [JP Document Tree](https://fabingurung.github.io/data-warehouse-random/jp-drive-explorer/) — repository/source hierarchy
- [Web Design Skills](https://fabingurung.github.io/data-warehouse-random/web-design-skills/) — reusable skills and demos

## Source and publication boundaries

- [Designated Drive folder](https://drive.google.com/drive/folders/1q0VpM43s4lZsbjZNLqYVNVMrqL5YPsHC): native Docs/Sheets, project-specific reference records and legacy archives.
- [New Laxmi source folder](https://drive.google.com/drive/folders/1haMaeJ04qaKT11W_jIn3LvNMvMDlwtUk): editable sample catalogue and operating guide. The guide registers restricted client submissions; never place submission links or private content in Git. Updates are manual and publication-approved only.
- [Web Design Skills](web-design-skills/README.md): pinned upstream source, licenses and machine registry.
- [Paila operational pointer](https://drive.google.com/drive/folders/1kylwj3F9XYug_ZOiINrOod6yJ3PuzgQ9): operational source remains in its designated provider.
- [Retired trials and legacy source archive](https://drive.google.com/drive/folders/1JXI9EANqEuk_kWFkzGafEWPdkOIApI5q): exact original bytes of retired/non-runtime files are preserved in Drive. The 25 November 2026 cleanup package includes the old planning workbook, screenshots, outdated instructions and retired source-gallery files.
- [Archive package](https://drive.google.com/file/d/1kN1rU6EDA87-xhzoRSICqQoC-iEem9YS/view): SHA-256 `8cf4131c66a1a737570ded66f76c8c5227b5f5cd7251ad40d814ac7a74faf164`, source commit `852f08badc9db194d00e3aa037102829b92a718f`.

## Working branches

Pages publishes from `gis-site-selection` at repository root. Keep `main` reconciled to the publishing tree after changes without rewriting Git history. Older branches are historical, not active website views. Read `sandbox-experiments.json` for the active route inventory. Run launcher, graph, document tree, catalogue and skills QA as applicable. Do not modify A7 from this repository.

## Pilates prototype

The approved demonstration data in `data/` and interface code in `assets/` are still active. The workbook is not a runtime dependency and is archived in Drive; see [Excel mapping](docs/EXCEL_TO_WEBSITE_MAPPING.md) and [demo limitations](docs/WHAT_IS_DEMO_VS_LIVE.md). The [data editor](tools/data-editor.html) creates downloadable replacement public data files. Prototype bookings and member sessions are browser-local, not secure live services.

Historical files removed from the active tree remain in Git commit history. This cleanup is not a security purge of earlier public history.
