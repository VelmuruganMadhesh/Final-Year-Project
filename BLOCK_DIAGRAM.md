# System Architecture Block Diagram

## Overview
The Smart Hospital Management System is a full-stack application with three main components: Frontend (React), Backend (Node.js/Express), and AI Services (Python/Flask).

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Admin      │  │    Doctor     │  │   Patient     │        │
│  │  Dashboard   │  │   Dashboard   │  │   Dashboard   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                  │
│                           │                                      │
│                  ┌────────▼────────┐                            │
│                  │  React Frontend  │                            │
│                  │  (Tailwind CSS)  │                            │
│                  └────────┬────────┘                            │
└───────────────────────────┼──────────────────────────────────────┘
                            │ HTTP/REST API
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                      BACKEND LAYER                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Node.js + Express.js Server                 │   │
│  │                                                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐       │   │
│  │  │   Auth     │  │   Routes   │  │ Middleware  │       │   │
│  │  │  (JWT)     │  │            │  │            │       │   │
│  │  └────────────┘  └────────────┘  └────────────┘       │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │              REST API Endpoints                  │   │   │
│  │  │  • /api/auth          • /api/doctors            │   │   │
│  │  │  • /api/users         • /api/patients           │   │   │
│  │  │  • /api/appointments  • /api/prescriptions      │   │   │
│  │  │  • /api/departments   • /api/medical-records    │   │   │
│  │  │  • /api/billing       • /api/ai                 │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
│         ┌──────────────────┴──────────────────┐                │
│         │                                      │                │
│  ┌──────▼──────┐                    ┌─────────▼─────────┐      │
│  │   MongoDB   │                    │   AI Services     │      │
│  │  Database   │                    │  (Python/Flask)   │      │
│  └─────────────┘                    └─────────┬─────────┘      │
│                                                │                │
└────────────────────────────────────────────────┼────────────────┘
                                                 │
┌────────────────────────────────────────────────▼────────────────┐
│                      AI SERVICES LAYER                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Python Flask Server                         │   │
│  │                                                           │   │
│  │  ┌────────────────────┐      ┌────────────────────┐   │   │
│  │  │  Disease Prediction │      │ Appointment        │   │   │
│  │  │  Model             │      │ Scheduling         │   │   │
│  │  │  (Scikit-learn/    │      │ Algorithm          │   │   │
│  │  │   TensorFlow)      │      │                    │   │   │
│  │  └────────────────────┘      └────────────────────┘   │   │
│  │                                                           │   │
│  │  Endpoints:                                               │   │
│  │  • POST /predict  - Disease prediction                   │   │
│  │  • POST /schedule - Appointment scheduling               │   │
│  │  • GET  /health   - Health check                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow
```
User → Frontend → Backend (/api/auth/login) → MongoDB (verify user) 
→ Backend (generate JWT) → Frontend (store token) → Protected Routes
```

### 2. AI Prediction Flow
```
Patient (enters symptoms) → Frontend → Backend (/api/ai/predict) 
→ AI Service (/predict) → AI Model (process) → AI Service (return prediction)
→ Backend (save to MongoDB) → Frontend (display result)
```

### 3. Appointment Booking Flow
```
Patient (books appointment) → Frontend → Backend (/api/appointments)
→ AI Service (/predict) → AI Service (/schedule) → Backend (save appointment)
→ MongoDB → Frontend (display appointment with AI scheduling)
```

### 4. Doctor Prescription Flow
```
Doctor (writes prescription) → Frontend → Backend (/api/prescriptions)
→ MongoDB → Patient (view prescription)
```

## Database Schema Relationships

```
User (1) ──→ (1) Doctor
User (1) ──→ (1) Patient

Doctor (1) ──→ (N) Appointments
Patient (1) ──→ (N) Appointments

Doctor (1) ──→ (N) Prescriptions
Patient (1) ──→ (N) Prescriptions

Patient (1) ──→ (N) Medical Records
Patient (1) ──→ (N) Billing Records
Patient (1) ──→ (N) AI Predictions

Department (1) ──→ (N) Doctors
Appointment (N) ──→ (1) Department
```

## Technology Stack

### Frontend
- **Framework:** React.js 18.2
- **Styling:** Tailwind CSS 3.3
- **Routing:** React Router DOM 6.16
- **HTTP Client:** Axios 1.5
- **Charts:** Recharts 2.8

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 4.18
- **Database:** MongoDB (Mongoose 7.5)
- **Authentication:** JWT (jsonwebtoken 9.0)
- **Validation:** express-validator 7.0
- **File Upload:** Multer 1.4

### AI Services
- **Framework:** Flask 3.0
- **ML Libraries:** Scikit-learn 1.3, TensorFlow 2.13
- **Data Processing:** NumPy 1.24, Pandas 2.0

## Security Features

1. **JWT Authentication:** Secure token-based authentication
2. **Role-Based Access Control:** Admin, Doctor, Patient roles
3. **Password Hashing:** bcryptjs for password security
4. **CORS:** Cross-Origin Resource Sharing configured
5. **Input Validation:** express-validator for request validation

## Deployment Architecture

```
┌─────────────────┐
│   Load Balancer │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼───┐
│Frontend│ │Backend│
│ (React)│ │(Node) │
└───┬───┘ └──┬────┘
    │        │
    │   ┌────▼────┐
    │   │ MongoDB │
    │   └─────────┘
    │
┌───▼────┐
│AI Service│
│(Python) │
└─────────┘
```

## Key Features by Role

### Admin
- User management
- Doctor management
- Department management
- View all appointments
- Billing management
- Generate reports
- View AI statistics

### Doctor
- View assigned patients
- See AI disease predictions
- Write prescriptions
- Update treatment notes
- Set availability
- View appointment schedules

### Patient
- Register and login
- Enter symptoms for AI prediction
- Book appointments (AI-scheduled)
- Upload medical reports
- View prescriptions
- Download medical records
- View billing
