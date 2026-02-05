# Smart Hospital Management System with AI Integration

A comprehensive full-stack hospital management system with AI-powered disease prediction and intelligent appointment scheduling.

## Features

### Admin Features
- Add and remove doctors
- View all patients
- Manage departments
- View all appointments
- Generate hospital reports
- View AI statistics
- Manage billing

### Doctor Features
- View assigned patients
- See AI disease predictions
- Write prescriptions
- Update treatment notes
- Set availability
- View AI-generated appointment schedules

### Patient Features
- Register and login
- Enter symptoms for AI prediction
- Get AI disease predictions
- Book appointments
- Upload medical reports
- View prescriptions
- Download medical records

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI Services**: Python, Flask, Scikit-learn/TensorFlow
- **Authentication**: JWT

## Project Structure

```
smart-hospital-management-system/
├── backend/          # Node.js/Express backend
├── frontend/         # React.js frontend
├── ai-services/      # Python Flask AI services
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Python (v3.8 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Set up environment variables:
   - Backend: Create `.env` in `backend/` folder
   - AI Services: Create `.env` in `ai-services/` folder

4. Start MongoDB service

5. Run the application:
   - Backend: `npm run dev:backend`
   - Frontend: `npm run dev:frontend`
   - AI Services: `npm run dev:ai`

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:5001
```

### AI Services (.env)
```
PORT=5001
FLASK_ENV=development
```

## API Documentation

See `API_DOCUMENTATION.md` for detailed API endpoints.

## Block Diagram

See `BLOCK_DIAGRAM.md` for system architecture.

## License

ISC
