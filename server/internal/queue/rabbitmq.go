package queue

import (
	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQ struct {
	Conn *amqp.Connection
}

func (r *RabbitMQ) NewChannel() (*amqp.Channel, error) {
	return r.Conn.Channel()
}

func NewRabbitMQ(url string) (*RabbitMQ, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, err
	}

	return &RabbitMQ{Conn: conn}, nil
}

func (r *RabbitMQ) DeclareQueue(name string) (amqp.Queue, error) {
	ch, err := r.NewChannel()
	if err != nil {
		return amqp.Queue{}, err
	}
	defer ch.Close()
	return ch.QueueDeclare(
		name,
		true,  // durable
		false, // auto-delete
		false, // exclusive
		false, // no-wait
		nil,
	)
}

func (r *RabbitMQ) Publish(queue string, body []byte) error {
	ch, err := r.NewChannel()
	if err != nil {
		return err
	}
	defer ch.Close()

	return ch.Publish(
		"",    // default exchange
		queue, // routing key = queue name
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
}

func (r *RabbitMQ) Consume(queue string) (<-chan amqp.Delivery, *amqp.Channel, error) {
	ch, err := r.NewChannel()
	if err != nil {
		return nil, nil, err
	}

	msgs, err := ch.Consume(
		queue,
		"",
		false, // manual ack
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, nil, err
	}

	return msgs, ch, nil
}

func (r *RabbitMQ) Close() {
	if r.Conn != nil {
		r.Conn.Close()
	}
}
