# Setup Guide - Smart Hospital Management System

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for version control)

## Step 1: Clone/Download the Project

If using Git:
```bash
git clone <repository-url>
cd smart-hospital-management-system
```

Or extract the project folder to your desired location.

## Step 2: Install Dependencies

### Install Backend Dependencies
```bash
cd backend
npm install
```

### Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Install AI Services Dependencies
```bash
cd ../ai-services
pip install -r requirements.txt
```

**Note:** On Windows, you might need to use `pip3` instead of `pip`.

## Step 3: Configure Environment Variables

### Backend Configuration

1. Navigate to the `backend` folder
2. Create a `.env` file (copy from `.env.example` if available)
3. Add the following:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospital_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:5001
```

**Important:** Change `JWT_SECRET` to a strong random string in production!

### AI Services Configuration

1. Navigate to the `ai-services` folder
2. Create a `.env` file (optional, defaults are used):
```env
PORT=5001
FLASK_ENV=development
```

## Step 4: Start MongoDB

### Windows
1. Open Command Prompt or PowerShell as Administrator
2. Navigate to MongoDB bin directory (usually `C:\Program Files\MongoDB\Server\<version>\bin`)
3. Run:
```bash
mongod
```

Or if MongoDB is installed as a service:
```bash
net start MongoDB
```

### macOS/Linux
```bash
sudo systemctl start mongod
# or
mongod
```

Verify MongoDB is running by opening a new terminal and running:
```bash
mongo
# or for newer versions
mongosh
```

## Step 5: Run the Application

You need to run three services simultaneously. Open three separate terminal windows/tabs.

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```

The backend should start on `http://localhost:5000`

### Terminal 2: Frontend Server
```bash
cd frontend
npm start
```

The frontend should start on `http://localhost:3000` and automatically open in your browser.

### Terminal 3: AI Services
```bash
cd ai-services
python app.py
# or
python3 app.py
```

The AI service should start on `http://localhost:5001`

## Step 6: Create Initial Admin User

### Option 1: Using MongoDB Shell
1. Open MongoDB shell:
```bash
mongo
# or
mongosh
```

2. Switch to the database:
```javascript
use hospital_db
```

3. Create admin user:
```javascript
db.users.insertOne({
  name: "Admin",
  email: "admin@hospital.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash "admin123"
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Option 2: Using Registration (if allowed)
1. Start the application
2. Go to `http://localhost:3000/register`
3. Register with role "admin" (if the registration allows admin role)
4. Or register as a regular user and manually update the database

### Option 3: Using Postman/API Client
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin",
  "email": "admin@hospital.com",
  "password": "admin123",
  "role": "admin"
}
```

## Step 7: Verify Installation

1. **Backend:** Open `http://localhost:5000` - Should show connection error (expected, no root route)
2. **Frontend:** Open `http://localhost:3000` - Should show login page
3. **AI Service:** Open `http://localhost:5001/health` - Should return `{"status": "healthy"}`

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in backend `.env` file
- Verify MongoDB is listening on default port 27017

### Port Already in Use
- Backend (5000): Change `PORT` in `backend/.env`
- Frontend (3000): React will automatically suggest another port
- AI Service (5001): Change `PORT` in `ai-services/.env` or `app.py`

### Python Dependencies Error
- Ensure Python 3.8+ is installed
- Try using `pip3` instead of `pip`
- On Windows, you might need to install Visual C++ Build Tools

### Frontend Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`
- Ensure Node.js version is 14 or higher

### AI Service Not Responding
- Check if Flask is installed: `pip list | grep flask`
- Verify Python version: `python --version`
- Check for port conflicts

## Project Structure

```
smart-hospital-management-system/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Context providers
│   │   └── App.js
│   └── package.json
├── ai-services/
│   ├── app.py          # Flask application
│   └── requirements.txt
├── README.md
├── API_DOCUMENTATION.md
├── BLOCK_DIAGRAM.md
└── SETUP_GUIDE.md
```

## Development Tips

1. **Hot Reload:** Both frontend and backend support hot reload during development
2. **Database GUI:** Consider using MongoDB Compass for easier database management
3. **API Testing:** Use Postman or Insomnia to test API endpoints
4. **Logs:** Check terminal outputs for debugging information

## Next Steps

1. Create departments in the admin dashboard
2. Register doctors and assign them to departments
3. Register patients
4. Test AI prediction feature
5. Book appointments and test AI scheduling

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in backend
2. Use a strong `JWT_SECRET`
3. Configure proper MongoDB connection string
4. Set up HTTPS
5. Use environment variables for all sensitive data
6. Configure CORS properly
7. Set up proper logging
8. Use a process manager like PM2 for Node.js
9. Use Gunicorn or uWSGI for Python Flask
10. Set up reverse proxy (Nginx)

## Support

For issues or questions, refer to:
- API Documentation: `API_DOCUMENTATION.md`
- System Architecture: `BLOCK_DIAGRAM.md`
- Main README: `README.md`
