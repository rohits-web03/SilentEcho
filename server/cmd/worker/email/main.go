package main

import (
	"log"

	"github.com/rohits-web03/SilentEcho/server/internal/config"
	"github.com/rohits-web03/SilentEcho/server/internal/queue"
	"github.com/rohits-web03/SilentEcho/server/internal/worker"
)

func main() {
	rmq, err := queue.NewRabbitMQ(config.Envs.MQ_URL)
	if err != nil {
		log.Fatalf("Failed to connect RabbitMQ: %v", err)
	}
	defer rmq.Close()

	_, err = rmq.DeclareQueue(config.Envs.EMAIL_QUEUE)
	if err != nil {
		log.Fatalf("Failed to declare queue: %v", err)
	}

	msgs, ch, err := rmq.Consume(config.Envs.EMAIL_QUEUE)
	if err != nil {
		log.Fatalf("Failed to register consumer: %v", err)
	}
	defer ch.Close()

	log.Println(" [*] Waiting for email messages. To exit press CTRL+C")

	forever := make(chan bool)
	go func() {
		for d := range msgs {
			worker.ProcessEmail(d)
		}
	}()
	<-forever
}
