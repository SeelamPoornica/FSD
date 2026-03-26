# Pathly - Interactive Learning Roadmap Platform

## 1. Project Overview
**Pathly** is a modern web application designed to help learners track and complete educational roadmaps step-by-step. Built for students, developers, and self-taught learners who need structured daily learning paths, Pathly visualizes complex curriculums into manageable daily chunks. Its main purpose is to eliminate learning paralysis by providing a guided, interactive curriculum complete with curated videos, practical challenges, and persistent progress tracking.

## 2. Key Features

1. **Interactive Roadmap Tracking**  
   - Users can follow comprehensive day-by-day learning paths broken down into manageable daily chunks.
   - Progress is visually tracked in real-time using dynamic progress bars and percentage indicators on the main dashboard.
   - Users can easily click "Mark Done" to safely save their completed daily tasks and update their overall curriculum standing.

2. **Integrated Learning Resources**  
   - Each individual step in a roadmap connects learners directly to educational content and theory without external links.
   - Daily tasks feature embedded video tutorials that allow users to watch and learn natively within the platform.
   - Hands-on practical challenges are provided alongside the videos to ensure users actively apply the skills they just learned.

3. **Secure User Authentication & Personalization**  
   - A robust authentication system utilizes cryptographic hashing to securely store passwords and manage private user credentials.
   - Every registered user receives a personalized, private dashboard to view and seamlessly resume their ongoing courses.
   - Individual progress data is actively saved to the cloud database, ensuring learners never lose track of their personal educational journey across sessions.

## 3. Technologies Used
- **Node.js**: The runtime environment used to build the responsive backend server.
- **Express.js**: A minimalist web framework for Node.js used to manage REST API routing, handle HTTP requests, and process middleware.
- **HTML5, CSS3, & Vanilla JavaScript**: The core frontend architecture used to fetch data asynchronously and render dynamic UI components, creating a fast Single Page Application (SPA) feel without heavy client-side frameworks.
- **Bootstrap 5**: A popular CSS framework used for its grid system and utility classes to quickly build responsive, mobile-first design layouts.
- **Firebase Firestore**: A flexible, scalable NoSQL cloud database utilized to store users, roadmaps, and progress data in real time.
- **Firebase Admin SDK**: A server-side SDK used to securely interact with Firestore directly from the Node backend using service account credentials.
- **bcryptjs**: A cryptographic library used to securely hash and salt user passwords before storing them in the database to protect user credentials.
- **express-session**: A session management middleware used to handle secure session cookies and maintain authentication states natively for logged-in users.

## 4. Project Structure
The project follows a clean Client-Server architectural separation:
- **Folders**: 
  - `/public`: Contains all publicly accessible static frontend assets including `html` views and `css` stylesheets.
  - `/node_modules`: Auto-generated dependency storage.
- **Pages**:
  - `login.html`: Entry point for returning users.
  - `signup.html`: Registration interface for new users.
  - `dashboard.html`: The main user hub displaying all available roadmaps and overall user advancement.
  - `roadmap.html`: A dynamic template page that loads specific roadmap steps and daily tasks based on URL parameters.
- **Routes (API)**:
  - `POST /api/login` & `POST /api/signup`: Handles identity verification and creation.
  - `GET /api/dashboard`: Serves aggregated JSON data about available learning paths.
  - `GET /api/roadmap/:id`: Serves specific day-by-day JSON instructions for a single path.
  - `POST /api/complete-step`: Endpoint that mutates the database to flag a specific daily task as complete.
- **Modules**:
  - Main server logic (`app.js`) handles server bootstrapping, Firebase SDK initialization, and middleware configurations.

## 5. User Flow
- A new user lands on the Login page and is guided to the Signup page if they do not already have an account.
- The user registers a new account by providing a username, email, and password, which is securely hashed and saved in the database.
- Upon successful login, the backend creates a secure session and authenticates them into the personalized Dashboard page.
- The user views their Dashboard to browse available learning paths (roadmaps) and visually inspect their ongoing completion percentage for each path.
- The user selects a specific roadmap, watches embedded video content, attempts practical challenges, and clicks "Mark Done", which updates their progress securely in the database and visually updates the UI progress bar.

## 6. Database Design
The application utilizes **Firebase Firestore**, a NoSQL document database, arranged into three primary collections:
1. **`users` Collection**: 
   - *Purpose*: Stores registered user profiles. 
   - *Data stored*: Document ID (user's email address), `username` (string), and `password` (hashed string).
2. **`roadmaps` Collection**: 
   - *Purpose*: Stores the catalog of learning paths. 
   - *Data stored*: Document ID (e.g., 'flutter', 'react'), `title` (string), `desc` (string), `color` (string for UI theme), and `steps` (Array or Map containing daily task layouts: `day`, `Topic`, `Intro`, `Video`, `Practical`).
3. **`progress` Collection**: 
   - *Purpose*: Tracks individual user progress independently. 
   - *Data stored*: Document ID (user's email), with nested array fields corresponding to specific roadmap IDs. For example, a field named `flutter` contains an array like `["1", "2", "3"]` representing the specific daily step IDs the user has completed.

## 7. Improvement Ideas
1. **Security Enhancements**: Implement input validation and sanitization using a library like Joi or express-validator on all API routes to prevent NoSQL injection and XSS attacks.
2. **CSRF Protection**: Add Cross-Site Request Forgery (CSRF) tokens to secure the API endpoints against unauthorized session manipulation.
3. **UI/UX Refinements**: Add client-side form validation before submitting data to the signup API to improve user experience and reduce unnecessary network requests.
4. **Performance Optimization**: Implement lazy-loading for the heavy iframe embedded videos in the roadmap view so they only load when the user scrolls to them, significantly improving initial page load time.
5. **State Management**: Replace express-session with secure, HTTP-only JWT (JSON Web Tokens) to make the backend fully stateless and more scalable.
6. **Robust Error Handling**: Create a unified middleware error handler in Express to guarantee standardized JSON error responses back to the frontend in case of database timeouts.
7. **Password Recovery**: Introduce a "Forgot Password" workflow utilizing email reset links via Nodemailer or managed Firebase Authentication.

## 8. Future Scope
- Develop a secure Admin Dashboard that allows educators to create, edit, and reorganize roadmaps and daily steps through a visual interface rather than manually editing database documents.
- Introduce a social learning aspect where users can view leaderboards, earn achievement badges for streaks, and share their progress on social networks.
- Organize a community discussion section attached to each individual daily step to allow users to ask questions, share code snippets, and help each other asynchronously.
- Integrate AI-driven personalized recommendations to suggest sequential roadmaps based on a user's recently completed skills and stated goals.
- Wrap the frontend into a Progressive Web App (PWA) allowing users to install the application natively on mobile devices and track their journey on the go.
