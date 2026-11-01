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

## Lesson 14 (C2): My Checklist

### What Was Requested
Replace the My Checklist placeholder with a functional React checklist backed by the existing Express API and SQLite database. Students should be able to load and add tasks, mark tasks complete or incomplete, see clear loading, empty, validation, and error states, and retain data after refreshes and server restarts. Career Recommendations, authentication, and external AI APIs were out of scope.

### What Copilot Produced
- A React checklist interface that loads with `GET /api/checklist`, adds tasks with `POST /api/checklist`, and toggles completion with `PATCH /api/checklist/:id`.
- A SQLite update query for task completion using the existing `checklist_items` table; no new database or schema migration was introduced.
- Separate incomplete and completed task groups, an empty state, a 200-character title limit, loading indicators, and accessible error messages.

### What Was Actually Corrected
The My Checklist section was previously a “Coming soon” placeholder. It now supports loading, adding, and toggling SQLite-backed checklist tasks. During verification, a backend restart briefly caused the Vite proxy to return 502; the interface was corrected so a failed initial load shows an error rather than also presenting a misleading empty state. The Career Recommendations placeholder remains unchanged.

### How Results Were Verified
- `npm run build` and `npm run lint` in `client/` completed successfully; `node --check` passed for both server JavaScript files.
- Live API requests verified `GET /api/health`, checklist GET and POST, completion and incomplete PATCH updates, repeat updates, HTTP 400 for invalid IDs and completion values, and HTTP 404 for a missing checklist item.
- Browser interaction verified adding a task, changing its completion state, and retaining the state after a page refresh. Browser checks also verified native blank-input validation, the empty state with a mocked empty response, and the visible API error message with a mocked 503 response.
- After restarting Express, GET requests confirmed that a completed task and an incomplete task both retained their states in SQLite; reloading the frontend showed those persisted states. The Vite `/api` proxy also returned the checklist after restart.
- The temporary checklist rows created for these checks were removed afterward; the pre-existing checklist row was left intact.

## Lesson 14 (C2): Career Recommendations

### What Was Requested
Replace the Career Recommendations placeholder with a responsive interface for choosing interests and viewing three rule-based career recommendations. Each result should include a title, description, useful skills, and a suggested high-school next step. Keep My Checklist unchanged and do not add external AI, authentication, or unrelated features.

### What Copilot Produced
- Six selectable interest categories: Technology, Engineering, Business, Healthcare, Arts, and Science.
- A predefined catalog of 18 careers with descriptions, useful skills, suggested next steps, and related interest categories.
- A local matching rule that ranks careers by the number of selected-interest matches and favors a career's lead category to break ties, displaying the top three.
- An accessible friendly message when no interests are selected and responsive styling consistent with the existing CollegePath palette.

### What Was Actually Corrected
The Career Recommendations section was a “Coming soon” placeholder. It now provides the selection form and recommendation results without calling an external AI service or changing the checklist API or SQLite schema. Initial browser testing exposed a weak tie-break for Science; the ranking was refined to favor the career's lead category when match counts tie. The My Checklist section and its handlers were left unchanged.

### How Results Were Verified
- `npm run build` and `npm run lint` in `client/` completed successfully after the career recommendation changes.
- Browser tests selected each of the six individual interest categories and verified exactly three unique recommendations, a relevant expected career for each category, and the skills and next-step details.
- A multiple-interest Arts + Science selection returned three recommendations. Submitting with no interests displayed the friendly prompt.
- A 390-pixel-wide browser viewport had no horizontal overflow. The existing My Checklist heading and task remained visible.

### Final Lesson 14 Verification
- The student manually verified Technology, Engineering, mixed Technology + Engineering, the empty-interest message, and checklist task creation and completion.
- `npm run build` and `npm run lint` in `client/` completed successfully.
- A live `GET /api/checklist` response exactly matched a read-only query of `server/data/collegepath.db`, including the manually completed checklist item.
- `git check-ignore` confirmed that `node_modules`, `.env`/`.env.local`, and SQLite database files are ignored. `.env.example` has an explicit exception so an example environment template can be tracked.
