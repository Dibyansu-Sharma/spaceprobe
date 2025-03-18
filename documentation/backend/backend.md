
**Next:** [Mock Data Generator](mock-data-generator.md)

---

# **SpaceProbe Backend**

## **Overview**
The `spaceprobe-backend` application processes real-time sensor data using **TCP connections**, stores it in a **PostgreSQL database**, computes **sensor reliability scores**, and broadcasts updates via **WebSockets**.

### **Key Features**
- **TCP Server:** Listens for incoming sensor data.
- **Database Integration:** Stores sensor readings and calculates reliability scores.
- **Reliability Computation:** Evaluates sensor trustworthiness based on historical variance.
- **WebSocket Server:** Streams real-time sensor updates to subscribed clients.

---

## **1. Environment Variables**
Create a `.env` file to store configuration settings:

```
WS_PORT=8081
TCP_PORT=9000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=spaceprobe
DB_PORT=5432
DB_SSLMODE=disable
```

| Variable       | Default | Description |
|---------------|---------|-------------|
| `WS_PORT`     | `8081`  | WebSocket server port. |
| `TCP_PORT`    | `9000`  | TCP server port. |
| `DB_HOST`     | `localhost` | Database hostname. |
| `DB_USER`     | `postgres` | Database username. |
| `DB_PASSWORD` | `yourpassword` | Database password. |
| `DB_NAME`     | `spaceprobe` | Name of the database. |
| `DB_PORT`     | `5432` | Database port. |
| `DB_SSLMODE`  | `disable` | SSL mode for database connection. |

---

## **2. Database Initialization**
The application connects to **PostgreSQL** and auto-migrates schemas.

### **2.1 Initializing the Database**
```go
func initDB()
```
- Loads database credentials from `.env`.
- Connects to PostgreSQL using `gorm`.
- Auto-migrates `SensorData` and `SensorReliability` tables.

### **2.2 Database Models**
#### **Sensor Data Table**
```go
type SensorData struct {
	ID          uint      `gorm:"primaryKey"`
	SensorID    string    `gorm:"index"`
	Temperature float64
	Humidity    float64
	Pressure    float64
	Visibility  float64
	AQI         float64
	Occupancy   int
	CreatedAt   time.Time
}
```

#### **Sensor Reliability Table**
```go
type SensorReliability struct {
	ID          uint      `gorm:"primaryKey"`
	SensorID    string    `gorm:"uniqueIndex"`
	Count       int
	Mean        float64
	Variance    float64
	Reliability float64
	UpdatedAt   time.Time
}
```

---

## **3. TCP Server - Receiving Sensor Data**
The TCP server listens for sensor data, processes it, and stores it in the database.

### **3.1 Starting the TCP Server**
```go
func startTCPServer()
```
- Listens on `TCP_PORT`.
- Accepts new connections and processes incoming sensor data.

### **3.2 Handling TCP Connections**
```go
func handleConnection(conn net.Conn)
```
- Reads incoming **JSON-encoded sensor data**.
- Stores sensor readings in the database.
- Computes **sensor reliability score**.
- Selects the most **reliable sensor**.
- Broadcasts the best sensor’s data over WebSockets.

#### **Incoming Sensor Data Format**
```json
{
  "sensor_id": "sensor-1",
  "temperature": 25.5,
  "humidity": 60.2,
  "pressure": 980,
  "visibility": 10.5,
  "aqi": 45,
  "occupancy": 3
}
```

---

## **4. Reliability Score Calculation**
### **4.1 Formula for Sensor Reliability**
```go
newReliability := 1 - (newVariance / (newVariance + newMean + 0.01))
```
- **Higher variance** lowers reliability.
- **More data points** improve accuracy.

### **4.2 Updating Sensor Reliability**
```go
func updateReliability(data models.SensorData)
```
- Retrieves previous sensor statistics.
- Updates **mean, variance, and reliability** dynamically.
- Saves updated values to the database.

---

## **5. WebSocket Server - Real-Time Data Streaming**
The WebSocket server enables clients to subscribe to sensor updates.

### **5.1 Starting the WebSocket Server**
```go
websocketServer = ws.StartServer()
```
- Runs on `ws://localhost:8081/ws`.
- Allows clients to subscribe to sensor updates.

### **5.2 Handling WebSocket Connections**
```go
func (s *Server) handleConnections(w http.ResponseWriter, r *http.Request)
```
- Accepts WebSocket connections.
- Clients can **subscribe** or **unsubscribe** from sensor updates.

#### **WebSocket Message Format**
```json
{
  "type": "subscribe",
  "sensor_id": "sensor-1"
}
```

| Field       | Type   | Description |
|------------|--------|-------------|
| `type`     | `string` | `subscribe` or `unsubscribe`. |
| `sensor_id` | `string` | ID of the sensor to subscribe/unsubscribe. (Empty for all sensors) |

### **5.3 Broadcasting Sensor Updates**
```go
func (s *Server) BroadcastUpdate(sensorID string, data []byte)
```
- Sends sensor updates to subscribed clients.

#### **Broadcast Data Example**
```json
{
  "sensor_id": "sensor-1",
  "temperature": 25.5,
  "humidity": 60.2,
  "pressure": 980,
  "visibility": 10.5,
  "aqi": 45,
  "occupancy": 3,
  "reliability_score": 0.98,
  "created_at": "2025-03-18T12:00:00Z"
}
```

---

## **6. Running the Backend**
### **6.1 Steps to Start the Backend**
1. Set up a `.env` file with **database** and **server** configurations.
2. Run the backend:
   ```sh
   go run main.go
   ```
3. Start the TCP server and WebSocket server.

### **6.2 Connecting to WebSocket Server**
Use a WebSocket client (e.g., Postman, WebSocket test tool) to connect to:
```
ws://localhost:8081/ws
```
Then send:
```json
{
  "type": "subscribe",
  "sensor_id": "sensor-1"
}
```

---

## **7. Mock Data Generator (For Testing)**
To generate fake sensor readings:
```go
func generateMockData()
```
- Simulates **random sensor data**.
- Sends data over **TCP** for testing.

---

## **8. Summary**
| Feature        | Description |
|---------------|-------------|
| **TCP Server** | Receives real-time sensor data. |
| **Database** | Stores sensor readings & reliability scores. |
| **Reliability Score** | Calculates sensor trustworthiness. |
| **WebSockets** | Streams live sensor updates to clients. |

---

**Next:** [Mock Data Generator](mock-data-generator.md)
