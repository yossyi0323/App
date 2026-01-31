package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("Hello World!")
	http.HandleFunc("/api/timeSlots", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"timeSlots": [{"id":"test1", "title": "Go Lang Test"}]}`))
	})
	http.ListenAndServe(":8080", nil)
}
