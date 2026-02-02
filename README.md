# AirPro Management System (v2)

**AirPro** is a modern, glassmorphism-styled SaaS for managing Air Conditioning installation businesses. It handles Auth, Employees, Inventory, and the full lifecycle of Montage installations.

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

*   **[📖 Software Overview](docs/SOFTWARE_OVERVIEW.md)**: Features, Tech Stack, and High-Level logic.
*   **[🧠 Code Logic & Architecture](docs/CODE_LOGIC.md)**: Deep dive into the Backend/Frontend structure, API patterns, and implementation details.

## 🚀 Quick Start

### 1. Backend (API)
```bash
cd API
dotnet restore
dotnet ef database update
dotnet run
```
*The API will run on `https://localhost:7081` (or configured port).*

### 2. Frontend (Client)
```bash
cd frontend
npm install
npm run dev
```
*The Frontend will run on `http://localhost:5173`.*

## 🛠️ Key Tech Stack
*   **Frontend**: React 19, Vite, TypeScript, TailwindCSS (Shadcn UI).
*   **Backend**: .NET 8 Web API, Entity Framework Core.
*   **Database**: PostgreSQL / SQL Server.

---
*Built with ❤️ by AirPro Team*