package test

import (
	"log"
	"os"
	"testing"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"spaceprobe-backend/models"
	"spaceprobe-backend/ws"
)

var testDB *gorm.DB
var websocketServer *ws.Server

func TestMain(m *testing.M) {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Could not load .env file")
	} else {
		log.Println(".env file loaded successfully")
	}

	dsn := "host=" + os.Getenv("DB_HOST") +
		" user=" + os.Getenv("DB_USER") +
		" password=" + os.Getenv("DB_PASSWORD") +
		" dbname=" + os.Getenv("DB_NAME") +
		" port=" + os.Getenv("DB_PORT") +
		" sslmode=" + os.Getenv("DB_SSLMODE")

	log.Println("DSN:", dsn)

	testDB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to initialize test database: %v", err)
	}

	testDB.AutoMigrate(&models.SensorData{}, &models.SensorReliability{})

	websocketServer = ws.StartServer()

	exitCode := m.Run()
	os.Exit(exitCode)
}
