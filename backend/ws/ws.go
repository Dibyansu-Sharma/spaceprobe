package ws

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type MessageType string

const (
	Subscribe    MessageType = "subscribe"
	Unsubscribe  MessageType = "unsubscribe"
	SensorUpdate MessageType = "sensor_update"
)

type Client struct {
	conn       *websocket.Conn
	subscribed map[string]bool
}

type Server struct {
	clients  map[*Client]bool
	mu       sync.Mutex
	upgrader websocket.Upgrader
}

func StartServer() *Server {
	server := &Server{
		clients: make(map[*Client]bool),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		},
	}

	http.HandleFunc("/ws", server.handleConnections)
	go func() {
		log.Println("WebSocket server running at ws://localhost:8081/ws")
		log.Fatal(http.ListenAndServe(":8081", nil))
	}()

	return server
}

func (s *Server) handleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	client := &Client{conn: conn, subscribed: make(map[string]bool)}

	s.mu.Lock()
	s.clients[client] = true
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		delete(s.clients, client)
		s.mu.Unlock()
		conn.Close()
	}()

	for {
		var msg struct {
			Type     MessageType `json:"type"`
			SensorID string      `json:"sensor_id,omitempty"`
		}

		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("WebSocket read error:", err)
			break
		}

		switch msg.Type {
		case Subscribe:
			client.subscribed[msg.SensorID] = true
			log.Printf("Client subscribed to sensor: %s", msg.SensorID)
		case Unsubscribe:
			delete(client.subscribed, msg.SensorID)
			log.Printf("Client unsubscribed from sensor: %s", msg.SensorID)
		}
	}
}

func (s *Server) BroadcastUpdate(sensorID string, data []byte) {
	s.mu.Lock()
	defer s.mu.Unlock()

	for client := range s.clients {
		if client.subscribed[sensorID] {
			err := client.conn.WriteMessage(websocket.TextMessage, data)
			if err != nil {
				log.Println("WebSocket write error:", err)
				client.conn.Close()
				delete(s.clients, client)
			}
		}
	}
}
