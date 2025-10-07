# Rhino

**Rhino** is a web-based examination and learning management system that empowers teachers to create and manage interactive, multimodal tests and resources. It features dashboards for both students and teachers, supports a variety of question types (MCQ, text, listening/audio, images), and streamlines grading and resource sharing.

---

## Features

- **User Management:**  
  – Student registration, authentication  
  – Teacher dashboard and student dashboard  

- **Assessment Creation & Management:**  
  – Timed tests  
  – Multiple question types:  
    - Text (short/long answer)  
    - Multiple Choice Questions (MCQ)  
    - Listening (audio prompts)  
    - Images  
  – Auto-grading support for MCQ  
  – Resource-only modules with embedded quizzes  

- **Storage Management:**  
  – Persistent storage of tests, answers, audio files using the filesystem  
  – MySQL database integration for structured data  

- **REST API:**  
  – Endpoints for test/resource creation, retrieval, submission, grading  
  – File upload and download for test materials and student answers  

- **Results:**  
  – Automated and manual grading features  
  – Student score tracking and test result display  

---

## Tech Stack

- **Backend:**  
  - Node.js  
  - Express.js  
  - MySQL  
  - Multer (file uploads)  
  - express-session (session management)

- **Frontend:**  
  - HTML, CSS, JavaScript

- **Project Structure:**  
  - `/rhino/rhino/` : Frontend assets (css, js, dashboards, resource pages)  
  - `/rhino/storage/` : Tests, answers, resources, audio storage  
  - `index.js` : Main server logic  
  - `package.json` : Dependencies

---

## Getting Started

### Prerequisites

- Node.js (recommended v14 or above)
- MySQL Server

### Installation

1. **Clone the repository:**  
   ```bash
   git clone https://github.com/nilabjamitra/Rhino.git
   cd Rhino/rhino
   ```

2. **Install dependencies:**  
   ```bash
   npm install
   ```

3. **Setup Database:**  
   - Create a MySQL database (default: `rhino-nhce`)
   - Modify credentials in `index.js` if required:
     - host, user, password, database name

4. **Environment Variables:**  
   - Use a `.env` file for sensitive configs (optional, dotenv supported)

5. **Start the server:**  
   ```bash
   node index.js
   ```
   The server runs on port `8080` by default.

---

## Usage

- Access the frontend via `http://localhost:8080/`
- Teachers can:
  - Create, update, enable/disable, and grade tests and resources
- Students can:
  - Register/login, view active tests, take exams, submit answers, and view scores

---

## Example API Endpoints

- `POST /api/student/register` — Register a new student
- `POST /api/tests/create` — Teacher creates a new test
- `POST /api/tests/save` — Save/updating questions/answers
- `POST /api/tests/grade` — Grade test submissions
- `POST /api/resource/create` — Add a new learning resource

---

## Folder Structure

```
/rhino
  |-- index.js
  |-- package.json
  |-- /rhino/
    |-- /css/
    |-- /dashboard/
    |-- /icons/
    |-- /js/
    |-- /resource/
    |-- /tests/
    |-- 404.html
  |-- /storage/
    |-- /resources/
    |-- /students/answers/
    |-- /tests/
```

---

## Roadmap

- Authentication improvements (password hashing, security)
- Enhanced dashboards and analytics
- More question types
- Admin/role management

---

## License

This project is licensed under the ISC License.

---

> For any queries or contributions, feel free to open an issue or submit a pull request.

---
