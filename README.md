# 🚀 Prep AI - The Future of Interview Preparation

**Master your career with Prep AI.** A comprehensive platform offering real-time voice analysis, ATS resume scoring, and algorithmic challenges designed for professionals who demand perfection.

---

## 🌟 Features

* **🔐 Secure Authentication:** Full Login/Signup flow with MongoDB persistence and session management.
* **🎨 Editorial Design:** Stunning "Neon/Dark Mode" UI with noise textures, typewriter effects, and smooth animations.
* **🎤 Voice Analysis:** (Coming Soon) AI-driven feedback on tone, pacing, and confidence.
* **📄 ATS Scorer:** (Coming Soon) Resume parsing to check compatibility with job descriptions.
* **💻 Coding Dojo:** (Coming Soon) Distraction-free environment for DSA practice.
* **📱 Responsive:** Fully optimized for desktop and mobile devices.

---

## 🛠️ Tech Stack

### **Frontend**
* **React (Vite):** Fast, modern UI development.
* **React Router:** Seamless client-side navigation.
* **Lucide React:** Beautiful, consistent iconography.
* **CSS3:** Custom "Editorial" theme with CSS variables for dark mode.

### **Backend**
* **Python (Flask):** Lightweight and robust API server.
* **PyMongo:** Native MongoDB driver for Python.
* **Flask-CORS:** Handling Cross-Origin Resource Sharing.
* **Gunicorn:** Production-grade WSGI server for deployment.

### **Database**
* **MongoDB Atlas:** Cloud-hosted NoSQL database for user data and analytics.

---

## 📂 Project Structure

```bash
/
├── frontend/           # React Source Code
│   ├── src/
│   │   ├── components/ # Reusable UI components (Navbar, Cards)
│   │   ├── context/    # AuthContext & ThemeContext
│   │   ├── pages/      # Landing, Login, Signup, Dashboard
│   │   └── styles/     # Global themes and CSS
│   ├── public/         # Static assets & _redirects
│   └── index.html
│
├── backend/            # Flask API
│   ├── app.py          # Main application entry point
│   ├── requirements.txt # Python dependencies
│   └── .env            # Environment variables (gitignored)
│
└── README.md

```
### Future Scope 

1. Cheat Detection 

2. Real Time Ai Interruption 

3. Conpany Based Simulation 

## ⚡ Getting Started Locally

Follow these steps to run the project on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/interview.git](https://github.com/YOUR_GITHUB_USERNAME/interview.git)
cd interview
```
### 2. Backend Setup 
```bash
cd backend

# Create a virtual environment (Recommended)
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "MONGO_URI=your_mongodb_connection_string" > .env
echo "DB_NAME=prep_ai_db" >> .env

# Run the server
python app.py
```
You should see: 🚀 Server running on http://localhost:5000

### 3. Frontend Setup 

Open a new terminal in the project root.

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
Open http://localhost:5173 to view the app.

## 🚀 Deployment

### **Frontend (Netlify)**
1. Connect your GitHub repository to Netlify.
2. **Build Command:** `npm run build`
3. **Publish Directory:** `dist`
4. Ensure `public/_redirects` exists to handle routing.

### **Backend (Render)**
1. Connect repository to Render as a **Web Service**.
2. **Build Command:** `pip install -r requirements.txt`
3. **Start Command:** `gunicorn app:app`
4. **Environment Variables:** Add `MONGO_URI` and `DB_NAME` in the Render dashboard.

---

## 🤝 Contributors

* **Mubina Syed** - Database + Authentication
* **Prathmesh Nitnaware** - Backend + ML
* **Diksha Parulekar** - Frontend + Backend
* **Mayank Ekbote** - ML Training
* **Team Prep AI**

