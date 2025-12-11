# 🏠 Rent-Hub | Angular Assignment

**Rent-Hub** is a comprehensive web-based platform designed to bridge the gap between landlords and prospective tenants. It allows users to list apartments, browse properties with advanced filters, express interest via favorites, and engage in discussions through a commenting system.

This project focus, focusing on trendy UI, responsive design, and robust functionality using **Angular 20+** and **JSON Server**.

---

## 🚀 Live Demo & Links
- **Frontend Deployment:** [Paste Vercel/Netlify Link Here]
- **Backend Deployment:** [Paste Render/Heroku Link Here]
- **GitHub Repository:** [Paste GitHub Link Here]

---

## 🔑 Test User Credentials
To test the application without registering a new user, you can use the following pre-configured credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **User / Admin** | `AaryanTest@test.com` | `Aaryan@1976` |

> **Note:** You can also register a new user via the Sign-Up page.

---

## 🌟 Bonus Features Attempted
I have successfully implemented the **Bonus Questions** and added extra enhancements:

1.  **✅ Preview Screen (Bonus Requirement):** 
    - Inside the "Post Ad" page, users can toggle a **"Preview Mode"** switch.
    - This hides the form and renders the actual Listing Card component, allowing users to see exactly how their ad will look before submitting.

2.  **✅ Custom Carousel:**
    - Implemented a custom image carousel on the Home Screen for "Featured Listings" without using external heavy libraries.

3.  **✅ Advanced Favorites System:**
    - Users can mark listings as favorites.
    - Added a dedicated **"My Favorites"** page to view saved properties.
    - Real-time UI updates (Heart icon turns red instantly across the app).

4.  **✅ UI/UX (Tailwind CSS):**
    - **Selection Cards:** Replaced boring radio buttons with clickable cards for "Furnished/Vegetarian".
    - **Chip Selection:** Used interactive chips for Amenities selection.
    - **Glassmorphism:** Added blur effects and modern gradients on cards.

---
## 📂 Project Architecture
```
Rent-hub-project/
├── backend/
│   ├── db.json            # Database (Users, Listings, Comments)
│   ├── package.json       # Backend dependencies
│   └── server.js          # Server configuration
│
└── frontend/ (Angular App)
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── home/           # Carousel, Search, Grid
    │   │   │   ├── create-post/    # Reactive Form + Preview Bonus
    │   │   │   ├── listing-details/# Comments & Details
    │   │   │   ├── auth/           # Login & Signup
    │   │   │   
    │   │   ├── services/
    │   │   │   ├── auth.service.ts
    │   │   │   └── property.service.ts
    │   │   └── guards/             # Auth Guards
    └── tailwind.config.js
```
## 🛠️ Tech Stack

- **Frontend:** Angular 20 /21(Standalone Components, Signals/Observables)
- **Styling:** Tailwind CSS (Responsive, Mobile-First Design)
- **Backend:** JSON Server + JSON Server Auth (Mock REST API)
- **Database:** `db.json` (NoSQL-like local storage)
- **State Management:** RxJS BehaviorSubjects (For Auth & Favorites)
- **Icons:** Google Material Icons

---

## ⚙️ Installation & Setup Guide

This project requires **Node.js** installed on your machine.
The application runs in two parts: the **Backend (Port 3000)** and the **Frontend (Port 4200)**.

### Step 1: Clone the Repository
```bash
git clone <your-repo-link>
cd rent-hub-project
```
### Step 2: Setup Backend (JSON Server)
```bash
cd backend
npm install
npm start

The backend will start running at http://localhost:3000

```
### Step 3: Setup Frontend (Angular)
```bash
cd client
npm install
ng serve

The frontend will start running at http://localhost:4200.
```




