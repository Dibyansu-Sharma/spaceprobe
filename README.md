
---

# **Setup Instructions for SpaceProbe**  

This guide explains how to set up and run the **SpaceProbe** application, a weather monitoring system that:  
- **Generates mock sensor data** (temperature, AQI, occupancy, etc.)  
- **Collects data through a TCP server** and stores it in **PostgreSQL**  
- **Pushes real-time updates via WebSockets**  
- **Displays data on a React dashboard** with visualizations  

---

## **Backend Setup (Go + PostgreSQL)**  

### **1. Prerequisites**  
Ensure the following dependencies are installed:  
- **Go** (≥ 1.24.1)  
- **PostgreSQL** (≥ 17.4, running on `localhost`)  
- **Node.js** (≥ 18.3.1) and **npm**  

---

### **2. Clone the Repository**  
```sh
git clone https://github.com/Dibyansu-Sharma/spaceprobe.git
cd spaceprobe
```

---

### **3. Configure Environment Variables**  
Copy the example environment file and modify it as needed:  
```sh
cp .env.example .env
```
Then, open `.env` and update configuration values (e.g., database credentials, WebSocket ports).

---

### **4. Initialize and Install Dependencies**  
If the Go module is not already initialized, run:  
```sh
go mod init spaceprobe-backend
```
Install required dependencies:  
```sh
# Load environment variables
go get github.com/joho/godotenv

# WebSockets support
go get github.com/gorilla/websocket

# PostgreSQL driver for GORM
go get gorm.io/driver/postgres
go get gorm.io/gorm
```
Tidy up the module:  
```sh
go mod tidy
```

---

### **5. Start the Backend Server**  
```sh
go run .
```
The backend should now be running!

---

## **Frontend Setup (React + WebSockets)**  

### **1. Navigate to the Frontend Directory**  
```sh
cd ../frontend
```

### **2. Configure Environment Variables**  
Copy the example environment file and modify it as needed:  
```sh
cp .env.local.example .env.local
```
Edit `.env.local` with your frontend-specific configuration (e.g., API endpoints, WebSocket URL).

---

### **3. Install Dependencies**  
```sh
npm install
```

### **4. Start the Frontend Server**  
```sh
npm run dev
```
The UI should now be running on **http://localhost:5173** by default.

---

## **Technical Overview**  
### **Backend (Go)**
- **Collects & stores sensor data** (temperature, AQI, occupancy, etc.)  
- **Uses a PostgreSQL database** for storage  
- **Implements WebSockets** for real-time updates  
- **Includes error handling & logging**  

### **Frontend (React)**
- **Real-time data visualization** (WebSockets)  
- **Basic charts & graphs**  
- **Responsive design**  
- **Handles errors & disconnected states**  

---
