package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net"
	"os"
	"spaceprobe-backend/models"
	"time"

	"github.com/joho/godotenv"
)

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
