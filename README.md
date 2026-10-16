# Lottery Portal Management System

**Academic Project Submission**  
- **Author**: ANURAG KUMAR  
- **Roll Number**: 13000124009  
- **Deployment Cost**: **$0 (100% Free Forever)**  
- **Hosting**: GitHub Pages (1-Click Deployment) or Vercel  

---

## 🌟 Overview & SRS Alignment

This web application implements the complete **Lottery Portal Management System** specification defined in the functional requirements and Level 0–2 Data Flow Diagrams (DFDs), omitting external payment gateway fees by incorporating a zero-cost simulated transaction flow.

### System Architecture & Data Dictionary Stores (D1–D5)
1. **User Master Table (D1)**: Stores user accounts, contact numbers, email formatting rules, and roles (`Participant` vs `Administrator`).
2. **Lottery Event Master (D2)**: Manages event parameters, ticket prices, pool limits, auto-expiries, and dynamic controls.
3. **Ticket Master Table (D3)**: Records issued tickets with unique cryptographically formatted serial numbers and ownership.
4. **Transaction Log (D4)**: Logs all simulated financial attempts with unique transaction IDs and timestamps.
5. **Winner Master Table (D5)**: Persists random draw selections, prize tiers, claim states, identity verification files, and audit logs.

### Functional Requirements Implemented:
- **FR-1**: User Registration (FR-1.1, 1.2, 1.3), Secure Authentication (FR-1.4), Profile & History Management (FR-1.5).
- **FR-2**: Event Configuration (FR-2.1, 2.2), Dynamic Event Controls (FR-2.3), Automatic Timestamp Expiry & Locking (FR-2.4).
- **FR-3**: Event Catalog Browsing (FR-3.1), Ticket Pool Availability Check (FR-3.2), Simulated Payment & Logging (FR-3.3, 3.4), Unique Serial Ticket Generation & Printable Digital Receipt (FR-3.5).
- **FR-4**: Secure Draw Trigger Command (FR-4.1), Eligible Ticket Query (FR-4.2), Unbiased Pseudo-Random Selection Engine (FR-4.3), Winner Persistence (FR-4.4).
- **FR-5**: Automated Winner Alerts (FR-5.1), Claim Submission Workflow with Identity Document File Uploads (FR-5.2), Admin Document Verification Console (FR-5.3), Status Tracking and Audit Trail (FR-5.4).

---

## 🚀 How to Host on GitHub Pages in 1 Click (0 Cost)

1. Create a new repository on your GitHub account (e.g. `lottery-portal-system`).
2. Push this project code to your GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Lottery Portal Management System"
   git branch -M main
   git remote add origin https://github.com/<your-username>/lottery-portal-system.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Click **Settings** → **Pages** (on the left sidebar).
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. That's it! GitHub will automatically trigger the included workflow (`.github/workflows/deploy.yml`) and deploy your live site in under 60 seconds to:
   `https://<your-username>.github.io/lottery-portal-system/`

---

## 💻 Local Development

To run the application locally on your computer:

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## 🔑 Demo Evaluator Accounts

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@lottery.com` | `admin123` | Event scheduling (FR-2), Draw execution (FR-4), Claim verification (FR-5) |
| **Participant** | `rahul@example.com` | `password123` | Browse catalog, buy tickets, claim won prizes (FR-1, FR-3, FR-5) |
| **Participant 2** | `priya@example.com` | `password123` | Second participant for multi-user ticket pool testing |

*(You can also use the top-right 1-click **Participant / Admin** toggle or click **Inspect Master Stores (D1–D5)** in the navbar to view the live database anytime!)*
