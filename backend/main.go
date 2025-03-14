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
	db.AutoMigrate(&models.SensorData{})
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
