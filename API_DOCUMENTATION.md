# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "admin|doctor|patient",
    "phone": "string (optional)",
    "address": "string (optional)",
    "dateOfBirth": "date (optional)",
    "gender": "male|female|other (optional)"
  }
  ```
- **Response:** `{ token, user }`

### Login
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** `{ token, user }`

### Get Current User
- **GET** `/auth/me`
- **Auth:** Required
- **Response:** `{ user, profile }`

---

## Users Endpoints

### Get All Users
- **GET** `/users`
- **Auth:** Required (Admin only)
- **Response:** `Array<User>`

### Get User by ID
- **GET** `/users/:id`
- **Auth:** Required
- **Response:** `User`

### Update User
- **PUT** `/users/:id`
- **Auth:** Required
- **Body:** `{ name, phone, address, dateOfBirth, gender }`
- **Response:** `User`

### Delete User
- **DELETE** `/users/:id`
- **Auth:** Required (Admin only)
- **Response:** `{ message }`

---

## Doctors Endpoints

### Add Doctor
- **POST** `/doctors`
- **Auth:** Required (Admin only)
- **Body:**
  ```json
  {
    "userId": "ObjectId",
    "specialization": "string",
    "departmentId": "ObjectId",
    "licenseNumber": "string",
    "experience": "number",
    "qualifications": ["string"],
    "consultationFee": "number"
  }
  ```
- **Response:** `Doctor`

### Get All Doctors
- **GET** `/doctors`
- **Auth:** Required
- **Response:** `Array<Doctor>`

### Get Doctor by ID
- **GET** `/doctors/:id`
- **Auth:** Required
- **Response:** `Doctor`

### Get My Patients (Doctor)
- **GET** `/doctors/me/patients`
- **Auth:** Required (Doctor only)
- **Response:** `Array<Patient>`

### Update Doctor Availability
- **PUT** `/doctors/:id/availability`
- **Auth:** Required (Doctor only)
- **Body:** `{ availability: { day: { start, end, available } } }`
- **Response:** `Doctor`

### Update Doctor
- **PUT** `/doctors/:id`
- **Auth:** Required (Doctor or Admin)
- **Body:** `{ specialization, experience, qualifications, consultationFee }`
- **Response:** `Doctor`

### Remove Doctor
- **DELETE** `/doctors/:id`
- **Auth:** Required (Admin only)
- **Response:** `{ message }`

---

## Patients Endpoints

### Get All Patients
- **GET** `/patients`
- **Auth:** Required (Admin or Doctor)
- **Response:** `Array<Patient>`

### Get Patient by ID
- **GET** `/patients/:id`
- **Auth:** Required
- **Response:** `Patient`

### Get My Profile (Patient)
- **GET** `/patients/me/profile`
- **Auth:** Required (Patient only)
- **Response:** `Patient`

### Update Patient
- **PUT** `/patients/:id`
- **Auth:** Required
- **Body:** `{ bloodGroup, allergies, medicalHistory, emergencyContact, insuranceInfo, assignedDoctor }`
- **Response:** `Patient`

---

## Appointments Endpoints

### Create Appointment
- **POST** `/appointments`
- **Auth:** Required
- **Body:**
  ```json
  {
    "doctorId": "ObjectId",
    "appointmentDate": "date",
    "appointmentTime": "string",
    "reason": "string (optional)",
    "symptoms": ["string"] (optional)
  }
  ```
- **Response:** `Appointment` (with AI prediction if symptoms provided)

### Get All Appointments
- **GET** `/appointments`
- **Auth:** Required
- **Response:** `Array<Appointment>`

### Get Appointment by ID
- **GET** `/appointments/:id`
- **Auth:** Required
- **Response:** `Appointment`

### Update Appointment
- **PUT** `/appointments/:id`
- **Auth:** Required
- **Body:** `{ status, notes, appointmentDate, appointmentTime }`
- **Response:** `Appointment`

### Cancel Appointment
- **DELETE** `/appointments/:id`
- **Auth:** Required
- **Response:** `{ message }`

---

## Departments Endpoints

### Create Department
- **POST** `/departments`
- **Auth:** Required (Admin only)
- **Body:** `{ name, description, headDoctorId }`
- **Response:** `Department`

### Get All Departments
- **GET** `/departments`
- **Auth:** Required
- **Response:** `Array<Department>`

### Get Department by ID
- **GET** `/departments/:id`
- **Auth:** Required
- **Response:** `Department`

### Update Department
- **PUT** `/departments/:id`
- **Auth:** Required (Admin only)
- **Body:** `{ name, description, headDoctorId }`
- **Response:** `Department`

### Delete Department
- **DELETE** `/departments/:id`
- **Auth:** Required (Admin only)
- **Response:** `{ message }`

---

## Prescriptions Endpoints

### Create Prescription
- **POST** `/prescriptions`
- **Auth:** Required (Doctor only)
- **Body:**
  ```json
  {
    "patientId": "ObjectId",
    "appointmentId": "ObjectId (optional)",
    "medications": [
      {
        "name": "string",
        "dosage": "string",
        "frequency": "string",
        "duration": "string",
        "instructions": "string (optional)"
      }
    ],
    "diagnosis": "string",
    "treatmentNotes": "string",
    "followUpDate": "date (optional)"
  }
  ```
- **Response:** `Prescription`

### Get All Prescriptions
- **GET** `/prescriptions`
- **Auth:** Required
- **Response:** `Array<Prescription>`

### Get Prescription by ID
- **GET** `/prescriptions/:id`
- **Auth:** Required
- **Response:** `Prescription`

### Update Prescription
- **PUT** `/prescriptions/:id`
- **Auth:** Required (Doctor only)
- **Body:** `{ medications, diagnosis, treatmentNotes, followUpDate }`
- **Response:** `Prescription`

---

## Medical Records Endpoints

### Create Medical Record
- **POST** `/medical-records`
- **Auth:** Required
- **Body:** FormData with `file`, `recordType`, `title`, `description`, `testResults`
- **Response:** `MedicalRecord`

### Get All Medical Records
- **GET** `/medical-records`
- **Auth:** Required
- **Response:** `Array<MedicalRecord>`

### Get Medical Record by ID
- **GET** `/medical-records/:id`
- **Auth:** Required
- **Response:** `MedicalRecord`

### Delete Medical Record
- **DELETE** `/medical-records/:id`
- **Auth:** Required
- **Response:** `{ message }`

---

## Billing Endpoints

### Create Bill
- **POST** `/billing`
- **Auth:** Required (Admin only)
- **Body:**
  ```json
  {
    "patientId": "ObjectId",
    "appointmentId": "ObjectId (optional)",
    "items": [
      {
        "description": "string",
        "quantity": "number",
        "unitPrice": "number",
        "total": "number"
      }
    ],
    "tax": "number (optional)",
    "discount": "number (optional)"
  }
  ```
- **Response:** `Billing`

### Get All Bills
- **GET** `/billing`
- **Auth:** Required
- **Response:** `Array<Billing>`

### Get Bill by ID
- **GET** `/billing/:id`
- **Auth:** Required
- **Response:** `Billing`

### Update Payment Status
- **PUT** `/billing/:id/payment`
- **Auth:** Required
- **Body:** `{ paymentStatus, paymentMethod }`
- **Response:** `Billing`

### Get Revenue Statistics
- **GET** `/billing/stats/revenue`
- **Auth:** Required (Admin only)
- **Response:** `{ totalRevenue, monthlyRevenue }`

---

## AI Endpoints

### Get Disease Prediction
- **POST** `/ai/predict`
- **Auth:** Required
- **Body:**
  ```json
  {
    "symptoms": ["string"],
    "age": "number",
    "gender": "string",
    "medicalHistory": ["string"]
  }
  ```
- **Response:** `{ disease, riskLevel, confidence, recommendations }`

### Get AI Predictions History
- **GET** `/ai/predictions`
- **Auth:** Required
- **Response:** `Array<AIPrediction>`

### Get AI Statistics
- **GET** `/ai/stats`
- **Auth:** Required (Admin only)
- **Response:** `{ totalPredictions, diseaseStats, riskLevelStats, aiScheduledAppointments }`

---

## AI Service Endpoints (Python Flask)

### Base URL: `http://localhost:5001`

### Disease Prediction
- **POST** `/predict`
- **Body:** `{ symptoms, age, gender, medicalHistory }`
- **Response:** `{ disease, riskLevel, confidence, recommendations }`

### Appointment Scheduling
- **POST** `/schedule`
- **Body:** `{ riskLevel, doctorId, preferredDate }`
- **Response:** `{ priority, suggestedDate, suggestedTime, availableSlots }`

### Health Check
- **GET** `/health`
- **Response:** `{ status, service }`
