

**Previous:** [Sensor Data Model](sensor-data-model.md)  
**Next:** [Test Guide](test.md)

---

# WebSocket Server - SpaceProbe Backend

## Overview

This WebSocket server enables real-time communication between clients and the **SpaceProbe Backend**. Clients can subscribe to specific sensors or all sensors to receive live updates.

---

## 1. WebSocket Server (`ws` package)

### **Key Features**
- Supports **WebSocket connections** for real-time updates.
- Allows clients to **subscribe** or **unsubscribe** from specific sensor updates.
- Broadcasts sensor data updates to relevant subscribed clients.

---

### **1.1 Message Type Enum**
The `MessageType` constants define the types of WebSocket messages.

```go
type MessageType string

const (
	Subscribe    MessageType = "subscribe"
	Unsubscribe  MessageType = "unsubscribe"
	SensorUpdate MessageType = "sensor_update"
)
```

| Message Type  | Description |
|--------------|-------------|
| `subscribe`   | Client subscribes to a specific sensor or all sensors. |
| `unsubscribe` | Client unsubscribes from a specific sensor or all sensors. |
| `sensor_update` | Internal event type for sending updates to clients. |

---

### **1.2 Client Structure**
Represents an active WebSocket connection.

```go
type Client struct {
	conn       *websocket.Conn
	subscribed map[string]bool
	allSensors bool
}
```

| Field        | Type                          | Description |
|-------------|------------------------------|-------------|
| `conn`      | `*websocket.Conn`             | WebSocket connection object. |
| `subscribed` | `map[string]bool`            | Tracks which sensors the client is subscribed to. |
| `allSensors` | `bool`                        | If `true`, the client receives updates for all sensors. |

---

### **1.3 WebSocket Server Structure**
Handles WebSocket clients and broadcasts sensor updates.

```go
type Server struct {
	clients  map[*Client]bool
	mu       sync.Mutex
	upgrader websocket.Upgrader
}
```

| Field       | Type                          | Description |
|------------|------------------------------|-------------|
| `clients`  | `map[*Client]bool`            | Stores connected WebSocket clients. |
| `mu`       | `sync.Mutex`                   | Ensures thread-safe access to client data. |
| `upgrader` | `websocket.Upgrader`           | Upgrades HTTP connections to WebSocket. |

---

## 2. Server Initialization

### **2.1 Start WebSocket Server**
```go
func StartServer() *Server
```
- Loads environment variables from `.env`.
- Initializes a WebSocket server on `ws://localhost:8081/ws`.
- Handles new WebSocket connections via `handleConnections`.

#### **Environment Variables**
| Variable | Default | Description |
|----------|---------|-------------|
| `WS_PORT` | `8081` | Port used for WebSocket communication. |

---

## 3. Handling WebSocket Connections

### **3.1 Handling New Clients**
```go
func (s *Server) handleConnections(w http.ResponseWriter, r *http.Request)
```
- Upgrades an HTTP connection to a WebSocket connection.
- Registers the client and listens for messages.
- Handles **subscribe** and **unsubscribe** requests.

#### **Message Format**
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

---

## 4. Broadcasting Sensor Updates

### **4.1 Sending Updates to Clients**
```go
func (s *Server) BroadcastUpdate(sensorID string, data []byte)
```
- Sends **sensor update** messages to subscribed clients.
- Removes disconnected clients on failure.

#### **Example Broadcast Data**
```json
{
  "sensor_id": "sensor-1",
  "temperature": 25.5,
  "humidity": 60.2,
  "pressure": 980
}
```

---

## 5. Running the WebSocket Server

### **5.1 Steps to Run**
1. Set up a `.env` file with:
   ```sh
   WS_PORT=8081
   ```
2. Start the WebSocket server:
   ```sh
   go run main.go
   ```
3. Connect a WebSocket client to:
   ```
   ws://localhost:8081/ws
   ```
4. Subscribe to a sensor:
   ```json
   {
     "type": "subscribe",
     "sensor_id": "sensor-1"
   }
   ```
5. Receive real-time updates when sensor data changes.

---

**Previous:** [Sensor Data Model](sensor-data-model.md)  
**Next:** [Test Guide](test.md)

