package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"spaceprobe-backend/models"
)

var db *gorm.DB

func initDB() {
	dsn := "host=localhost user=postgres password=1234 dbname=postgres port=5432 sslmode=disable"
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database")
	}

	err = db.AutoMigrate(&models.SensorData{}, &models.SensorReliability{})
	if err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	fmt.Println("Database connected and migrated successfully")
}

func updateReliability(data models.SensorData) {
	var reliability models.SensorReliability
	result := db.Where("sensor_id = ?", data.SensorID).First(&reliability)
	if result.Error != nil {
		reliability = models.SensorReliability{
			SensorID:    data.SensorID,
			Count:       1,
			Mean:        data.Temperature,
			Variance:    0,
			Reliability: 0,
			UpdatedAt:   time.Now(),
		}
		db.Create(&reliability)
	} else {
		newCount := reliability.Count + 1
		delta := data.Temperature - reliability.Mean
		newMean := reliability.Mean + delta/float64(newCount)
		newVariance := ((reliability.Variance * float64(reliability.Count)) + delta*(data.Temperature-newMean)) / float64(newCount)

		newReliability := newMean / (newVariance + 0.01)

		reliability.Count = newCount
		reliability.Mean = newMean
		reliability.Variance = newVariance
		reliability.Reliability = newReliability
		reliability.UpdatedAt = time.Now()

		db.Save(&reliability)
	}

	fmt.Println("Updated reliability for sensor:", data.SensorID)
}
func handleConnection(conn net.Conn) {
	defer conn.Close()
	scanner := bufio.NewScanner(conn)

	for scanner.Scan() {
		var data models.SensorData
		if err := json.Unmarshal(scanner.Bytes(), &data); err != nil {
			fmt.Println("Error parsing JSON:", err)
			continue
		}

		data.CreatedAt = time.Now()
		db.Create(&data)

		fmt.Println("Stored sensor data:", data)

		updateReliability(data)
	}
}

func startTCPServer() {
	listener, err := net.Listen("tcp", ":9000")
	if err != nil {
		panic("Failed to start TCP server")
	}
	defer listener.Close()
	fmt.Println("TCP Server started on port 9000")

	for {
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("Error accepting connection:", err)
			continue
		}
		go handleConnection(conn)
	}
}

func main() {
	initDB()
	go startTCPServer()
	go generateMockData()

	select {}
}
