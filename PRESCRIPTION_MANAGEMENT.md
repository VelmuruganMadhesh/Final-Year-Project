# Prescription Management Feature - Documentation

## Overview
The Prescription Management feature allows doctors to create and manage prescriptions for their assigned patients, and enables patients to view and download their prescriptions.

## Features Implemented

### 1. Doctor Features
- ✅ View list of assigned patients
- ✅ Create prescriptions for assigned patients only
- ✅ Update prescriptions (only own prescriptions)
- ✅ View all prescriptions created by the doctor
- ✅ Validation to ensure doctors can only prescribe for assigned patients
- ✅ Comprehensive prescription form with:
  - Patient ID (auto-filled from selected patient)
  - Doctor ID (auto-filled from logged-in doctor)
  - Diagnosis (required)
  - Multiple medications with:
    - Medicine name (required)
    - Dosage (required)
    - Frequency (required)
    - Duration (required)
    - Additional instructions (optional)
  - Treatment notes (optional)
  - Additional notes (optional)
  - Prescription date (defaults to today)
  - Follow-up date (optional)

### 2. Patient Features
- ✅ View all prescriptions (read-only)
- ✅ View detailed prescription information
- ✅ Download prescription as HTML file
- ✅ Print prescription
- ✅ See doctor information and specialization
- ✅ View medication details with instructions

### 3. Security & Authorization
- ✅ JWT-based authentication required for all endpoints
- ✅ Role-based access control (RBAC)
- ✅ Doctors can only create prescriptions for assigned patients
- ✅ Doctors can only update their own prescriptions
- ✅ Patients can only view their own prescriptions
- ✅ Validation at both frontend and backend levels

## API Endpoints

### Create Prescription
- **POST** `/api/prescriptions`
- **Auth:** Doctor only
- **Validation:** 
  - Patient must be assigned to the doctor
  - Diagnosis is required
  - At least one medication is required
  - All medication fields are validated

### Get All Prescriptions
- **GET** `/api/prescriptions`
- **Auth:** Required
- **Filtering:** 
  - Doctors see only their prescriptions
  - Patients see only their prescriptions
  - Admins see all prescriptions

### Get Prescription by ID
- **GET** `/api/prescriptions/:id`
- **Auth:** Required
- **Authorization:** Users can only view their own prescriptions

### Get Prescriptions by Patient
- **GET** `/api/prescriptions/patient/:patientId`
- **Auth:** Required
- **Authorization:** 
  - Patients can view their own prescriptions
  - Doctors can view prescriptions for assigned patients only

### Update Prescription
- **PUT** `/api/prescriptions/:id`
- **Auth:** Doctor only
- **Validation:**
  - Only the prescribing doctor can update
  - Patient must still be assigned to the doctor
  - All fields validated

## MongoDB Schema

```javascript
{
  patient: ObjectId (ref: Patient, required),
  doctor: ObjectId (ref: Doctor, required),
  appointment: ObjectId (ref: Appointment, optional),
  medications: [{
    name: String (required),
    dosage: String (required),
    frequency: String (required),
    duration: String (required),
    instructions: String (optional)
  }],
  diagnosis: String (required),
  treatmentNotes: String (optional),
  additionalNotes: String (optional),
  prescriptionDate: Date (required, defaults to now),
  followUpDate: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Frontend Components

### Doctor Components

#### DoctorPatients Component
- Displays list of assigned patients
- "Add Prescription" button for each patient
- Modal form for creating/editing prescriptions
- Real-time validation
- Error handling and user feedback

#### DoctorPrescriptions Component
- Lists all prescriptions created by the doctor
- View details modal
- Link to patient management page
- Quick preview of medications and diagnosis

### Patient Components

#### PatientPrescriptions Component
- Lists all patient's prescriptions
- View details modal
- Download functionality (HTML format)
- Print functionality
- Read-only access

## Validation Rules

### Backend Validation
1. Patient ID must exist
2. Patient must be assigned to the doctor
3. Diagnosis is required and cannot be empty
4. At least one medication is required
5. Each medication must have:
   - Name (required)
   - Dosage (required)
   - Frequency (required)
   - Duration (required)
   - Instructions (optional)
6. Prescription date must be valid ISO8601 format
7. Follow-up date must be valid date (if provided)

### Frontend Validation
1. All required fields must be filled
2. At least one medication must be added
3. All medication fields must be complete
4. Date fields must be valid
5. Real-time error messages

## Error Handling

### Backend Errors
- **400 Bad Request:** Validation errors
- **403 Forbidden:** Authorization errors (patient not assigned, not owner)
- **404 Not Found:** Patient/Doctor/Prescription not found
- **500 Internal Server Error:** Server errors

### Frontend Error Display
- Inline error messages
- Alert notifications
- Form validation feedback
- Loading states

## Download & Print Features

### Download Format
- HTML file with formatted prescription
- Includes:
  - Hospital header
  - Patient and doctor information
  - Diagnosis
  - All medications with details
  - Treatment notes
  - Additional notes
  - Follow-up date
  - Generation timestamp

### Print Format
- Same as download format
- Print-optimized CSS
- Opens in new window for printing

## Usage Examples

### Doctor Creating Prescription
1. Navigate to "My Patients" page
2. Click "Add Prescription" for a patient
3. Fill in diagnosis
4. Add medications (name, dosage, frequency, duration)
5. Add optional notes
6. Set prescription date and follow-up date
7. Click "Create Prescription"

### Patient Viewing Prescription
1. Navigate to "Prescriptions" page
2. View list of all prescriptions
3. Click eye icon to view details
4. Click download icon to download
5. Click print icon to print

## Security Considerations

1. **JWT Authentication:** All endpoints require valid JWT token
2. **Role-Based Access:** Different access levels for doctors and patients
3. **Assignment Verification:** Doctors can only prescribe for assigned patients
4. **Ownership Verification:** Doctors can only update their own prescriptions
5. **Input Validation:** Both client-side and server-side validation
6. **Error Messages:** Generic error messages to prevent information leakage

## Testing Checklist

- [ ] Doctor can view assigned patients
- [ ] Doctor can create prescription for assigned patient
- [ ] Doctor cannot create prescription for unassigned patient
- [ ] Doctor can update own prescription
- [ ] Doctor cannot update other doctor's prescription
- [ ] Patient can view own prescriptions
- [ ] Patient cannot view other patient's prescriptions
- [ ] Download functionality works
- [ ] Print functionality works
- [ ] Validation works correctly
- [ ] Error handling works correctly

## Future Enhancements

1. Email prescription to patient
2. PDF generation instead of HTML
3. Prescription templates
4. Medication database integration
5. Drug interaction warnings
6. Prescription history tracking
7. Refill requests
8. E-prescription integration
