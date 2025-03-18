package test

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"sync"
	"testing"
	"time"

	"spaceprobe-backend/models"
)

// Start a TCP server for testing with a stop condition
func startTestTCPServer(address string, stop chan struct{}, wg *sync.WaitGroup) {
	defer wg.Done()

	listener, err := net.Listen("tcp", address)
	if err != nil {
		fmt.Println("Error starting TCP server:", err)
		return
	}
	defer listener.Close()

	fmt.Println("Test TCP server running on", address)

	// Accept a single connection and process one message
	conn, err := listener.Accept()
	if err != nil {
		fmt.Println("Error accepting connection:", err)
		return
	}
	go handleTestConnection(conn)

	// Wait for stop signal
	<-stop
	fmt.Println("Stopping test TCP server")
}

func handleTestConnection(conn net.Conn) {
	defer conn.Close()
	scanner := bufio.NewScanner(conn)
	for scanner.Scan() {
		fmt.Println("Received from client:", scanner.Text()) // Print received data for debugging
		break                                                // Stop after receiving one message
	}
}

// Test case that starts the TCP server and then connects to it
func TestTCPConnection(t *testing.T) {
	address := "localhost:9000"

	// Channel to stop the server
	stop := make(chan struct{})

	// Start TCP server in a separate goroutine
	var wg sync.WaitGroup
	wg.Add(1)
	go startTestTCPServer(address, stop, &wg)

	// Wait for server to start
	time.Sleep(500 * time.Millisecond)

	// Dial the TCP server
	conn, err := net.Dial("tcp", address)
	if err != nil {
		t.Fatalf("Failed to connect to TCP server: %v", err)
	}
	defer conn.Close()

	// Prepare mock sensor data
	mockData := models.SensorData{
		SensorID:    "test-sensor",
		Temperature: 22.5,
		Humidity:    55.0,
		Pressure:    1005.0,
		Visibility:  9.0,
		AQI:         100,
		Occupancy:   200,
		CreatedAt:   time.Now(),
	}

	// Send data to the server
	dataBytes, _ := json.Marshal(mockData)
	_, err = conn.Write(append(dataBytes, '\n'))
	if err != nil {
		t.Errorf("Failed to send mock data over TCP: %v", err)
	}

	// Allow time for processing before stopping the server
	time.Sleep(500 * time.Millisecond)

	// Signal the server to stop
	close(stop)

	// Wait for the server to exit
	wg.Wait()
}
