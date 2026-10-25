# Test Report

Generated 2026-10-25 14:28 UTC by running both suites with coverage (`npm run test:coverage` in each package).

## Summary

| Suite | Framework | Result | Line coverage |
|---|---|---|---|
| Backend (API) | Jest + Supertest, real on-disk SQLite per test | **64/64 passing** | 99.06% |
| Frontend (UI) | Vitest + React Testing Library | **32/32 passing** | 98.67% |

The git history shows the Red-Green-Refactor cadence: each feature starts with a
`test(...)` commit that fails (red), followed by a `feat(...)` commit that makes it pass (green),
then a `refactor(...)` commit. Run `git log --oneline` to see it.

## Backend

```
Test Suites: 4 passed, 4 total
Tests:       64 passed, 64 total
Time:        16.932 s, estimated 17 s
```

### Backend coverage

```
-----------------------|---------|----------|---------|---------|-------------------
File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------------|---------|----------|---------|---------|-------------------
All files              |   98.94 |    89.04 |     100 |   99.06 |                   
 src                   |     100 |    66.66 |     100 |     100 |                   
  app.ts               |     100 |      100 |     100 |     100 |                   
  db.ts                |     100 |      100 |     100 |     100 |                   
  errors.ts            |     100 |    66.66 |     100 |     100 | 12                
 src/middleware        |    90.9 |     87.5 |     100 |    87.5 |                   
  auth.ts              |     100 |      100 |     100 |     100 |                   
  errorHandler.ts      |      75 |       75 |     100 |   66.66 | 8-9               
 src/repositories      |     100 |       90 |     100 |     100 |                   
  userRepository.ts    |     100 |    66.66 |     100 |     100 | 18-19             
  vehicleRepository.ts |     100 |      100 |     100 |     100 |                   
 src/routes            |     100 |      100 |     100 |     100 |                   
  authRoutes.ts        |     100 |      100 |     100 |     100 |                   
  inventoryRoutes.ts   |     100 |      100 |     100 |     100 |                   
  vehicleRoutes.ts     |     100 |      100 |     100 |     100 |                   
 src/services          |   99.04 |    90.47 |     100 |     100 |                   
  authService.ts       |      96 |       90 |     100 |     100 | 32                
  inventoryService.ts  |     100 |    83.33 |     100 |     100 | 17,27             
  passwordHasher.ts    |     100 |      100 |     100 |     100 |                   
  tokenService.ts      |     100 |      100 |     100 |     100 |                   
  vehicleService.ts    |     100 |    94.73 |     100 |     100 | 41                
-----------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 98.94% ( 281/284 )
Branches     : 89.04% ( 65/73 )
Functions    : 100% ( 65/65 )
Lines        : 99.06% ( 213/215 )
================================================================================
```

### Backend test cases

```

```

## Frontend

```
Test Files  5 passed (5)
Tests  32 passed (32)
Duration  6.68s (tests 50%, environment 36%, setup 7%, worker 2%, import 2%, transform 1%)
```

### Frontend coverage

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   97.12 |    92.26 |   97.19 |   98.67 |                   
 src/api           |   96.87 |    93.75 |    92.3 |     100 |                   
  client.ts        |   96.87 |    93.75 |    92.3 |     100 | 30                
 src/components    |   97.84 |    93.67 |     100 |     100 |                   
  CarArt.tsx       |   93.75 |     90.9 |     100 |     100 | 17                
  Modal.tsx        |     100 |       60 |     100 |     100 | 13-19             
  RestockModal.tsx |   88.88 |    66.66 |     100 |     100 | 20-29             
 src/context       |      92 |    83.33 |     100 |   95.65 |                   
  AuthContext.tsx  |      92 |    83.33 |     100 |   95.65 | 20                
 src/pages         |   97.52 |    90.76 |   95.91 |   97.87 |                   
  AuthPage.tsx     |     100 |     92.3 |     100 |     100 | 22-29             
  Dashboard.tsx    |   96.96 |    89.74 |   95.34 |   97.36 | 92,159            
-------------------|---------|----------|---------|---------|-------------------
=============================== Coverage summary ===============================
Statements   : 97.12% ( 270/278 )
Branches     : 92.26% ( 155/168 )
Functions    : 97.19% ( 104/107 )
Lines        : 98.67% ( 223/226 )
================================================================================
```

### Frontend test cases

```
✓ src/App.test.tsx > App > shows the login form when signed out 127ms
✓ src/App.test.tsx > App > shows the server error on a failed login 135ms
✓ src/App.test.tsx > App > logs in and lists vehicles, persisting the session 159ms
✓ src/App.test.tsx > App > registers a new account then signs in automatically 193ms
✓ src/App.test.tsx > App > purchases a vehicle and reflects the new stock level 139ms
✓ src/App.test.tsx > App > surfaces a purchase failure without losing the list 131ms
✓ src/App.test.tsx > App > runs a search through the API and renders the results 157ms
✓ src/App.test.tsx > App > lets an admin add a vehicle through the form 259ms
✓ src/App.test.tsx > App > asks for confirmation before an admin deletes a vehicle 141ms
✓ src/App.test.tsx > App > lets an admin restock a vehicle 153ms
✓ src/App.test.tsx > App > signs out and returns to the login form 117ms
✓ src/App.test.tsx > App > lets an admin edit a vehicle and shows the updated price 177ms
✓ src/App.test.tsx > App > restores a saved session on reload without asking for credentials 17ms
✓ src/App.test.tsx > App > signs the user out when the API says the session has expired 14ms
✓ src/components/SearchFilters.test.tsx > SearchFilters > submits the entered filters 295ms
✓ src/components/SearchFilters.test.tsx > SearchFilters > resets every field and re-runs an empty search 42ms
✓ src/components/SearchFilters.test.tsx > SearchFilters > blocks a search where min price exceeds max price 62ms
✓ src/components/VehicleFormModal.test.tsx > VehicleFormModal > submits a new vehicle with numeric price and quantity 278ms
✓ src/components/VehicleFormModal.test.tsx > VehicleFormModal > pre-fills the form when editing 14ms
✓ src/components/VehicleFormModal.test.tsx > VehicleFormModal > shows validation errors and does not submit invalid data 34ms
✓ src/components/VehicleFormModal.test.tsx > VehicleFormModal > displays a server error passed in by the parent 6ms
✓ src/components/VehicleFormModal.test.tsx > VehicleFormModal > closes on Cancel 20ms
✓ src/components/VehicleCard.test.tsx > VehicleCard > shows make, model, category, formatted price and stock 52ms
✓ src/components/VehicleCard.test.tsx > VehicleCard > calls onPurchase when Purchase is clicked 110ms
✓ src/components/VehicleCard.test.tsx > VehicleCard > disables Purchase and flags the vehicle when quantity is zero 13ms
✓ src/components/VehicleCard.test.tsx > VehicleCard > hides admin controls from regular users 9ms
✓ src/components/VehicleCard.test.tsx > VehicleCard > shows and wires admin controls for admins 54ms
✓ src/api/client.test.ts > api client > sends the stored token as a Bearer header 2ms
✓ src/api/client.test.ts > api client > omits empty filters from the search query string 0ms
✓ src/api/client.test.ts > api client > throws ApiError carrying the server message and status 2ms
✓ src/api/client.test.ts > api client > handles 204 responses without a body 0ms
✓ src/api/client.test.ts > api client > posts restock quantity as JSON 0ms
```
