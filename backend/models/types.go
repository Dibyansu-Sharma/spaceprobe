package models

import (
	"time"
)

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
