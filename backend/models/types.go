package models

import (
	"time"
)

type SensorData struct {
	ID               uint      `gorm:"primaryKey"`
	SensorID         string    `json:"sensor_id" gorm:"not null"`
	Temperature      float64   `json:"temperature"`
	Humidity         float64   `json:"humidity"`
	Pressure         float64   `json:"pressure"`
	Visibility       float64   `json:"visibility"`
	AQI              int       `json:"aqi"`
	Occupancy        int       `json:"occupancy"`
	ReliabilityScore float64   `json:"reliability_score" gorm:"default:1.0"`
	CreatedAt        time.Time `json:"created_at" gorm:"autoCreateTime"`
}
