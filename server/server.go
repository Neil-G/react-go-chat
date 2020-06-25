// +build ignore

package main

import (
		"fmt"
		"log"
    "net/http"
    "github.com/gorilla/websocket"
		"github.com/gin-gonic/gin"
		"github.com/gin-contrib/cors"
)

/* Types */
type Message struct {
    Author string
    Text string
}

type Messages []Message

/* Variables */
var messages = Messages {}

var upgrader = websocket.Upgrader {
	ReadBufferSize: 1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool { return true },
}

var clients = make(map[*websocket.Conn]bool) // connected clients
var broadcast = make(chan Message)           // broadcast channel

/* Websocket handler */
func handleSocketConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
			fmt.Println("Failed to set websocket upgrade: %+v", err)
			return
	}

	/* Register our new client */
	defer conn.Close()
	clients[conn] = true

	for {
		var msg Message
		// Read in a new message as JSON and map it to a Message object
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, conn)
			break
		}
		// send the new message to the broadcast channel
		broadcast <- msg
	}
}

/* Broadcast new messages to connected clients */
func broadcastNewMessages() {
	for {
		// get next message from the broadcast channel
		msg := <-broadcast
		// send message to currently connected
		messages = append(messages, msg)
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

/* Main */
func main() {
	r := gin.Default()   

	r.Use(cors.Default())

	// loads all messages 
	r.GET("/get-all-messages", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"messages": messages,
		})
	})

	r.GET("/ws", func(c *gin.Context) {
		handleSocketConnection(c.Writer, c.Request)
	})
		
	go broadcastNewMessages()

	r.Run()
}