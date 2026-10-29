#  CampusHub – Student Productivity Platform


CampusHub is a full-stack web application designed to help students organize their academic activities in one place. Students can manage assignments, schedule exams, monitor their progress, and view their account details through a personalized dashboard.


##  Features


**User Authentication:** Secure registration and login using JWT and password hashing.
**Personalized Dashboard:** View assignment statistics, completion percentage, overdue assignments, and upcoming exams.
**Assignment Management:** Add, view, update, and delete assignments.
**Exam Management:** Organize exam dates, times, subjects, and venues.
**Search and Sorting:** Easily find and organize assignments and exams.
**Pagination:** Display five records per page for easier navigation.
**Profile Management:** View the logged-in user's account details.
**Date Validation:** Prevent selection of past dates for new assignment deadlines and exam schedules.
**Responsive UI:** A clean interface built with React and Tailwind CSS.
##  Tech Stack


**Frontend**
React.js
Vite
Tailwind CSS
React Router DOM
**Backend**
Node.js
Express.js
MongoDB Atlas
Mongoose
JSON Web Tokens (JWT)
bcryptjs
##  Project Structure
text
CampusHub/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── .gitignore
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
##  Installation and Setup


### Prerequisites


Node.js and npm
MongoDB Atlas account or a MongoDB instance
Git
### 1. Clone the Repository
bash
git clone https://github.com/gunasribachu/CampusHub.git
cd CampusHub
### 2. Set Up the Backend
bash
cd backend
npm install
Create a .env file inside the backend folder and configure your environment variables:
env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret_key
Replace the placeholder values with your own credentials. Never commit your actual .env file.


Start the backend server:
bash
npm run dev
### 3. Set Up the Frontend


Open another terminal from the project root and run:
bash
cd frontend
npm install
npm run dev
Open the local URL displayed by Vite, usually:
text
http://localhost:5173
Ensure that the frontend API configuration points to the running backend, usually http://localhost:4000/api.


##  Security


Passwords are hashed before storage.
Protected API routes use JWT authentication.
User-specific records are associated with the authenticated user.
Environment variables are used for sensitive configuration.
**Important:** Never upload database credentials, JWT secrets, or other sensitive information to GitHub.


##  Future Enhancements


Assignment and exam reminders
Email notifications
Improved profile editing
Calendar integration
Deployment with a live frontend and backend
##  Author


**Praveena Durga Mandapaka**


GitHub: [@praveenadurga135-commits](https://github.com/praveenadurga135-commits)


**Gunasri Bachu**


GitHub: [@gunasribachu](https://github.com/gunasribachu)


**Tejasri Lakkimsetti**


GitHub: [@lakkimsettitejasri-dotcom](https://github.com/lakkimsettitejasri-dotcom)


**Srivani**


GitHub: [@SrivaniYalamadurti](https://github.com/SrivaniYalamadurti)
