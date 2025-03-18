**Previous:** [Backend Overview](backend.md)  
**Next:** [Sensor Data Model](sensor-data-model.md)

---

# SpaceProbe Backend - Sensor Data Models and Mock Data Generator

## Overview

This document provides details about the sensor data models and the mock data generator used in the **SpaceProbe Backend**.

---

## 1. Sensor Data Models (`models` package)

### `SensorData`
This struct represents the sensor readings.

#### **Fields**
| Field        | Type      | JSON Key     | Description |
|-------------|----------|-------------|-------------|
| `ID`        | `uint`   | -           | Primary key for the database. |
| `SensorID`  | `string` | `sensor_id` | Unique identifier for the sensor. |
| `Temperature` | `float64` | `temperature` | Temperature in degrees Celsius. |
| `Humidity`  | `float64` | `humidity`  | Humidity percentage (0-100%). |
| `Pressure`  | `float64` | `pressure`  | Atmospheric pressure in hPa. |
| `Visibility` | `float64` | `visibility` | Visibility in kilometers. |
| `AQI`       | `int`    | `aqi`       | Air Quality Index (0-500). |
| `Occupancy` | `int`    | `occupancy` | Number of people detected. |
| `CreatedAt` | `time.Time` | `created_at` | Timestamp when the data was recorded. |

---

### `SensorReliability`
This struct stores sensor reliability metrics.

#### **Fields**
| Field        | Type      | JSON Key     | Description |
|-------------|----------|-------------|-------------|
| `SensorID`  | `string` | -           | Primary key for the reliability table. |
| `Count`     | `int`    | `count`     | Number of data points collected. |
| `Mean`      | `float64` | `mean`      | Mean value of sensor readings. |
| `Variance`  | `float64` | `variance`  | Variance in sensor readings. |
| `Reliability` | `float64` | `reliability` | Calculated reliability score (default: 0). |
| `UpdatedAt` | `time.Time` | `updated_at` | Last update timestamp. |

#### **Table Name Override**
```go
func (SensorReliability) TableName() string {
	return "sensor_reliability"
}
```
This function explicitly sets the table name in the database.

---

## 2. Mock Data Generator (`main` package)

The `generateMockData` function simulates sensor readings and sends them over a TCP connection.

### **Key Functionalities**
- Loads environment variables using `.env` (if available).
- Establishes a TCP connection with the server.
- Generates random sensor readings for:
  - Temperature (`15°C` to `35°C`)
  - Humidity (`0%` to `100%`)
  - Pressure (`950 hPa` to `1000 hPa`)
  - Visibility (`0 km` to `10 km`)
  - AQI (`0` to `500`)
  - Occupancy (`0` to `5000`)
- Encodes the data as JSON and sends it every **5 seconds**.

### **Function: `generateMockData`**
```go
func generateMockData() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Could not load .env file")
	}
	tcpPort := os.Getenv("TCP_PORT")
	if tcpPort == "" {
		tcpPort = "9000"
	}

	tcpAddress := "localhost:" + tcpPort

	conn, err := net.Dial("tcp", tcpAddress)
	if err != nil {
		fmt.Println("Failed to connect:", err)
		return
	}
	defer conn.Close()

	for {
		mockData := models.SensorData{
			SensorID:    fmt.Sprintf("sensor-%d", rand.Intn(3)),
			Temperature: 15 + rand.Float64()*20,
			Humidity:    rand.Float64() * 100,
			Pressure:    950 + rand.Float64()*50,
			Visibility:  rand.Float64() * 10,
			AQI:         rand.Intn(500),
			Occupancy:   rand.Intn(5000),
			CreatedAt:   time.Now(),
		}

		jsonData, err := json.Marshal(mockData)
		if err != nil {
			fmt.Println("Error encoding JSON:", err)
			return
		}

		_, err = conn.Write(append(jsonData, '\n'))
		if err != nil {
			fmt.Println("Error sending data:", err)
			return
		}

		fmt.Println("Sent mock data:", string(jsonData))
		time.Sleep(5 * time.Second)
	}
}
```

### **Environment Variables**
| Variable | Default | Description |
|----------|---------|-------------|
| `TCP_PORT` | `9000` | Port used for TCP communication. |

---

## 3. Usage Instructions

### **Running the Mock Data Generator**
1. Ensure that a TCP server is running on the specified port.
2. Set up a `.env` file with `TCP_PORT=9000` (or any preferred port).
3. Run the program:
   ```sh
   go run main.go
   ```

---
**Previous:** [Backend Overview](backend.md)  
**Next:** [Sensor Data Model](sensor-data-model.md)
