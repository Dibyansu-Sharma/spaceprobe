package test

import (
	"testing"
	"time"

	"spaceprobe-backend/models"
)

func TestInsertSensorData(t *testing.T) {
	data := models.SensorData{
		SensorID:    "test-sensor",
		Temperature: 25.5,
		Humidity:    60.0,
		Pressure:    1010.0,
		Visibility:  8.5,
		AQI:         150,
		Occupancy:   300,
		CreatedAt:   time.Now(),
	}

	if err := testDB.Create(&data).Error; err != nil {
		t.Errorf("Failed to insert sensor data: %v", err)
	}

	var retrieved models.SensorData
	if err := testDB.Where("sensor_id = ?", "test-sensor").First(&retrieved).Error; err != nil {
		t.Errorf("Failed to retrieve inserted sensor data: %v", err)
	}
}

func TestUpdateSensorReliability(t *testing.T) {
	reliability := models.SensorReliability{
		SensorID:    "test-sensor",
		Count:       5,
		Mean:        25.0,
		Variance:    1.2,
		Reliability: 0.95,
		UpdatedAt:   time.Now(),
	}

	testDB.Create(&reliability)

	reliability.Count += 1
	reliability.Mean = 26.0
	testDB.Save(&reliability)

	var updated models.SensorReliability
	if err := testDB.Where("sensor_id = ?", "test-sensor").First(&updated).Error; err != nil {
		t.Errorf("Failed to update sensor reliability: %v", err)
	}

	if updated.Mean != 26.0 {
		t.Errorf("Expected Mean to be 26.0, got %f", updated.Mean)
	}
}
