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