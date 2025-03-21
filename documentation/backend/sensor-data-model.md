**Previous:** [Mock Data Generator](mock-data-generator.md)  
**Next:** [Websocket](websocket.md)

# Sensor Data Models Documentation

## Overview
This documentation describes the data models used in the SpaceProbe Weather Check Application. The models are implemented using Go with GORM (an ORM for Golang) to store and manage sensor-related data.

## Models

### SensorData
This model stores real-time sensor readings, including temperature, humidity, pressure, visibility, air quality index (AQI), and occupancy.

#### Structure
```go
package models

type SensorData struct {
    ID          uint      `gorm:"primaryKey"`
    SensorID    string    `json:"sensor_id" gorm:"not null"`
    Temperature float64   `json:"temperature"`
    Humidity    float64   `json:"humidity"`
    Pressure    float64   `json:"pressure"`
    Visibility  float64   `json:"visibility"`
    AQI         int       `json:"aqi"`
    Occupancy   int       `json:"occupancy"`
    CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
}
```

#### Fields
- `ID (uint)`: Primary key for the sensor data entry.
- `SensorID (string)`: Unique identifier for the sensor.
- `Temperature (float64)`: Temperature recorded by the sensor.
- `Humidity (float64)`: Humidity level recorded by the sensor.
- `Pressure (float64)`: Atmospheric pressure recorded by the sensor.
- `Visibility (float64)`: Visibility level recorded by the sensor.
- `AQI (int)`: Air Quality Index recorded by the sensor.
- `Occupancy (int)`: Number of people detected in the environment.
- `CreatedAt (time.Time)`: Timestamp when the record was created (auto-generated by GORM).

---

### SensorReliability
This model tracks the reliability of a sensor based on statistical calculations.

#### Structure
```go
package models

type SensorReliability struct {
    SensorID    string    `gorm:"primaryKey"`
    Count       int       `json:"count"`
    Mean        float64   `json:"mean"`
    Variance    float64   `json:"variance"`
    Reliability float64   `json:"reliability" gorm:"default:0"`
    UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (SensorReliability) TableName() string {
    return "sensor_reliability"
}
```

#### Fields
- `SensorID (string)`: Primary key that uniquely identifies the sensor.
- `Count (int)`: Number of recorded data points for the sensor.
- `Mean (float64)`: Mean value of sensor readings.
- `Variance (float64)`: Variance of sensor readings to assess consistency.
- `Reliability (float64)`: Calculated reliability score of the sensor (default: 0).
- `UpdatedAt (time.Time)`: Timestamp when the record was last updated (auto-updated by GORM).

#### Custom Table Name
The `TableName()` function ensures that the `SensorReliability` model is stored in the database table named `sensor_reliability`.

---

## Usage
These models are used in conjunction with GORM to store and analyze sensor data within the Weather Check application. The `SensorData` model captures real-time readings, while the `SensorReliability` model provides statistical insights into sensor performance.

## Dependencies
- **GORM**: Used for ORM functionality.
- **Go Standard Library (`time`)**: Used for handling timestamps.

## Future Improvements
- Add indexing to `SensorID` fields for faster queries.
- Introduce threshold-based alerts for unreliable sensors.

---

**Previous:** [Mock Data Generator](mock-data-generator.md)  
**Next:** [Websocket](websocket.md)
