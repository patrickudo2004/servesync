# ServeSync - Real-time Volunteer Management for Churches

ServeSync is a multi-tenant platform designed to help churches manage their volunteers, rotas, and attendance in real-time.

## Tech Stack
- **Frontend**: React 19, Vite, TypeScript, React Router DOM, React Query, Zustand
- **Backend**: Convex (Real-time database, Auth, Functions)
- **UI**: Vanilla CSS Modules, Lucide React, Recharts
- **Features**: PWA, QR Scanning (html5-qrcode), Geofencing

## Features
- **Multi-tenant**: Each church is an independent organization.
- **Role-based Access**: SuperAdmin, DeptHead, SubunitLead, Volunteer.
- **Real-time Attendance**: QR scanning with GPS verification (geofencing).
- **Rota Management**: Drag-and-drop scheduling with gap detection.
- **Workflows**: Time-off requests with hierarchical approval.

## How to Run Locally

### 1. Clone & Install
```bash
npm install
```

### 2. Setup Convex
You'll need a Convex account.
```bash
npx convex dev
```
This will prompt you to log in and create a project. It will also generate the `.env.local` file with your `VITE_CONVEX_URL`.

### 3. Run Development Server
```bash
npm run dev
```

### 4. PWA Setup
The app is configured as a PWA. To test the service worker, you'll need to build and serve:
```bash
npm run build
npm run preview
```

## Environment Variables
- `VITE_CONVEX_URL`: Your Convex deployment URL (automatically set by `npx convex dev`).

## Folder Structure
- `convex/`: Backend schema and functions.
- `src/components/`: Reusable UI components.
- `src/pages/`: Main application views.
- `src/store/`: Zustand state management.
- `src/styles/`: CSS Modules.
