# AI Services - Quick Start Guide

## Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

## Installation Steps

### 1. Navigate to AI Services Directory
```bash
cd ai-services
```

### 2. Install Dependencies

**Option A: Using pip (Recommended)**
```bash
pip install -r requirements.txt
```

**Option B: Using pip3 (if pip doesn't work)**
```bash
pip3 install -r requirements.txt
```

**Option C: Using virtual environment (Recommended for isolation)**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Run the AI Service

**Option A: Direct Python execution**
```bash
python app.py
```

**Option B: Using Python 3 explicitly**
```bash
python3 app.py
```

**Option C: Using Flask directly**
```bash
flask run --port 5001
```

## Verify Installation

Once the service is running, you should see:
```
Disease prediction model initialized
 * Running on http://0.0.0.0:5001
```

Test the service by opening:
- Health check: http://localhost:5001/health
- Should return: `{"status": "healthy", "service": "AI Prediction Service"}`

## Troubleshooting

### Issue: "pip is not recognized"
- Make sure Python is installed and added to PATH
- Try using `python -m pip` instead of `pip`
- On Windows, reinstall Python and check "Add Python to PATH"

### Issue: "ModuleNotFoundError: No module named 'flask'"
- Make sure you're in the `ai-services` directory
- Try: `pip install flask flask-cors numpy pandas scikit-learn`

### Issue: "TensorFlow installation error"
- TensorFlow is optional for this basic implementation
- You can remove it from requirements.txt if not needed
- The service works with just scikit-learn

### Issue: "Port 5001 already in use"
- Change the port in `app.py` (line ~200): `port = int(os.environ.get('PORT', 5002))`
- Or set environment variable: `set PORT=5002` (Windows) or `export PORT=5002` (Linux/Mac)

### Issue: "Permission denied" (Linux/Mac)
- Use `sudo pip install` (not recommended)
- Better: Use virtual environment or install for user: `pip install --user -r requirements.txt`

## Testing the Service

### Test Disease Prediction
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough", "headache"],
    "age": 35,
    "gender": "male",
    "medicalHistory": []
  }'
```

### Test Appointment Scheduling
```bash
curl -X POST http://localhost:5001/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "riskLevel": "high",
    "doctorId": "123",
    "preferredDate": "2024-01-15"
  }'
```

## Running in Background

### Windows (PowerShell)
```powershell
Start-Process python -ArgumentList "app.py" -WindowStyle Hidden
```

### Linux/Mac
```bash
nohup python app.py > ai-service.log 2>&1 &
```

## Stopping the Service

- Press `Ctrl+C` in the terminal where it's running
- Or find the process and kill it:
  - Windows: `taskkill /F /IM python.exe`
  - Linux/Mac: `pkill -f app.py`
