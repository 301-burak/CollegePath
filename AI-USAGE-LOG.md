# AI Usage Log

## What I Asked
Set up the Lesson 13 (C1) CollegePath foundation with React + Vite, Express, and SQLite, including a homepage and basic checklist API.

## What Copilot Produced
- A React + Vite homepage with navigation links to placeholder career-recommendation and checklist sections.
- An Express API with health and checklist endpoints, input validation, and a Vite `/api` development proxy.
- A `better-sqlite3` data layer that creates and reads the `checklist_items` table.
- Client/server package manifests and lockfiles, plus Git ignore rules for generated and local files.

## What Was Actually Fixed
The Lesson 13 foundation was added to the repository; the record does not identify a separate pre-existing bug fix. The committed implementation includes the client, Express server, SQLite data model, and project configuration. The checklist table stores an ID, title, completion state, and creation timestamp. The homepage checklist section is a placeholder, not a connected checklist UI.

## How Results Were Verified
- `npm run build` and `npm run lint` in `client/` completed successfully.
- Live `GET /api/health` and `GET /api/checklist` requests returned successfully, both directly and through the Vite `/api` proxy.
- Empty-title and malformed-JSON checklist POST requests returned HTTP 400.
- The SQLite database contains the custom `checklist_items` table. Checklist item ID 1 was present before and after restarting the Express server, confirming persistence.
- The Vite homepage returned HTTP 200 and displayed the CollegePath page. The root ignore rule excludes the SQLite database file.
