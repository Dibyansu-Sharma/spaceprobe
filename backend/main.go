package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"spaceprobe-backend/models"
	"spaceprobe-backend/ws"
)

var db *gorm.DB
var websocketServer *ws.Server

func initDB() {

	dsn := "host=" + os.Getenv("DB_HOST") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_PASSWORD") +
		" dbname=" + os.Getenv("DB_NAME") +
		" port=" + os.Getenv("DB_PORT") +
		" sslmode=" + os.Getenv("DB_SSLMODE")

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database: " + err.Error())
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

		newReliability := 1 - (newVariance / (newVariance + newMean + 0.01))

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

		var bestSensor models.SensorReliability
		timeThreshold := time.Now().Add(-1 * time.Minute)

		db.Where("updated_at > ?", timeThreshold).
			Order("reliability DESC, count DESC, updated_at DESC").
			First(&bestSensor)

		var bestSensorData models.SensorData
		if err := db.Where("sensor_id = ?", bestSensor.SensorID).Order("created_at DESC").First(&bestSensorData).Error; err != nil {
			log.Println("Error fetching best sensor data:", err)
			return
		}

		jsonData, _ := json.Marshal(map[string]interface{}{
			"sensor_id":         bestSensorData.SensorID,
			"temperature":       bestSensorData.Temperature,
			"humidity":          bestSensorData.Humidity,
			"pressure":          bestSensorData.Pressure,
			"visibility":        bestSensorData.Visibility,
			"aqi":               bestSensorData.AQI,
			"occupancy":         bestSensorData.Occupancy,
			"reliability_score": bestSensor.Reliability,
			"created_at":        bestSensorData.CreatedAt,
		})

		websocketServer.BroadcastUpdate(bestSensorData.SensorID, jsonData)

		log.Printf("Stored and broadcasted data for sensor: %s", bestSensorData.SensorID)
	}
}

func startTCPServer() {
	tcpPort := os.Getenv("TCP_PORT")
	if tcpPort == "" {
		tcpPort = "9000"
	}

	listener, err := net.Listen("tcp", ":"+tcpPort)
	if err != nil {
		panic("Failed to start TCP server")
	}
	defer listener.Close()
	fmt.Printf("TCP Server started on port %s\n", tcpPort)

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
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Could not load .env file")
	}
	initDB()
	websocketServer = ws.StartServer()
	go startTCPServer()
	go generateMockData()

	select {}
}
