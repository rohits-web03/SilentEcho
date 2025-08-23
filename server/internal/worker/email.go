package worker

import (
	"encoding/json"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/rohits-web03/SilentEcho/server/internal/utils"
)

type EmailJob struct {
	To        string `json:"to"`
	Subject   string `json:"subject"`
	PlainBody string `json:"plain_body,omitempty"`
	HTMLBody  string `json:"html_body,omitempty"`
}

// ProcessEmail consumes a single message and tries to send an email
func ProcessEmail(d amqp.Delivery) {
	var msg EmailJob
	if err := json.Unmarshal(d.Body, &msg); err != nil {
		log.Printf("Invalid message format: %v", err)
		d.Nack(false, false) // reject, don’t requeue
		return
	}

	log.Printf("Sending email to %s...", msg.To)
	if err := utils.SendEmail(msg.To, msg.Subject, msg.PlainBody, msg.HTMLBody); err != nil {
		log.Printf("Failed to send email: %v", err)
		d.Nack(false, true) // retry later
		return
	}

	d.Ack(false)
	log.Printf("Email sent to %s successfully", msg.To)
}
