# NEET Platform Full-Stack Application

This is a modern, high-performance, full-stack application built using **React (Frontend)**, **Vite**, **TypeScript**, and **Express (Backend)**, featuring **Supabase** database integration and **Gemini AI** capabilities.

---

## 🚀 How to Run this Application in VS Code

Follow these simple step-by-step instructions to get your local environment running.

### 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:
1. **Node.js** (v18.0.0 or higher is highly recommended) — [Download Node.js](https://nodejs.org/)
2. **Visual Studio Code** — [Download VS Code](https://code.visualstudio.com/)

---

### Step 1: Open the Project in VS Code
1. Export/download the ZIP of this project, or clone the repository to your local computer.
2. Launch **VS Code**.
3. Go to **File** > **Open Folder...** (or **Open...** on macOS) and select the root directory of this project.

### Step 2: Configure Environment Variables
1. In the VS Code file explorer (left sidebar), find the `.env.example` file.
2. Duplicate or copy this file and name the copy **`.env`** (make sure there is a leading dot).
3. Open the newly created `.env` file and configure your local keys. For basic local offline testing, you can use these placeholder values:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   JWT_SECRET="some-very-long-and-secure-random-string-here"
   CLOUDFLARE_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
   CLOUDFLARE_TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
   ```
   *Note: If `SUPABASE_URL` is omitted or empty, the backend automatically falls back to a self-seeding, file-based local JSON database, making offline testing completely seamless.*

### Step 3: Open the Integrated Terminal
1. In VS Code, open the integrated terminal by pressing:
   - **Ctrl + `** (on Windows/Linux)
   - **Cmd + `** (on macOS)
   - Or go to the top menu: **Terminal** > **New Terminal**.

### Step 4: Install Dependencies
In the terminal, run the following command to download and install all the project dependencies listed in `package.json`:
```bash
npm install
```
*(If you prefer **Bun**, you can alternatively run `bun install`)*

### Step 5: Start the Development Server
Once the installation is complete, start the full-stack development server by running:
```bash
npm run dev
```

### Step 6: Access the Application
The terminal will display output similar to this:
```text
Vite dev server running at:
  > Local: http://localhost:3000/
```
Ctrl+Click (or Cmd+Click) the `http://localhost:3000` link in your terminal to open the application in your web browser!

---

## 🛠️ Project Command Reference

You can run the following scripts in your terminal:

| Command | Action |
|:---|:---|
| `npm run dev` | Boots up the Express server and Vite in development mode (with hot-reloading). |
| `npm run build` | Compiles the React frontend and bundles the Express backend server using `esbuild` for production. |
| `npm run start` | Launches the pre-built, production-ready server from `dist/server.cjs`. |
| `npm run lint` | Performs a TypeScript static typecheck to verify there are no code errors. |

---

## 🗄️ Database Strategy
- **Local Fallback**: If no Supabase environment keys are provided, the system boots with a mock DB schema stored in local JSON memory so that development is always fast and error-free.
- **Supabase Production Connect**: To persist data permanently to the cloud, configure the `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` inside your `.env` file.
