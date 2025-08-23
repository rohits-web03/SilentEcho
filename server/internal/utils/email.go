package utils

import (
	"errors"
	"fmt"
	"os"

	mail "github.com/wneessen/go-mail"
)

func SendEmail(to, subject, plainBody, htmlBody string) error {
	sender := os.Getenv("SENDER_EMAIL")
	password := os.Getenv("APP_PASSWORD")

	if to == "" || subject == "" {
		return errors.New("to and subject are required")
	}
	if plainBody == "" && htmlBody == "" {
		return errors.New("either plainBody or htmlBody must be provided")
	}

	m := mail.NewMsg()
	if err := m.From(sender); err != nil {
		return err
	}
	if err := m.To(to); err != nil {
		return err
	}
	m.Subject(subject)

	// Choose bodies based on what you pass in
	switch {
	case plainBody != "" && htmlBody != "":
		// multipart/alternative: plain as primary, HTML as alternative
		m.SetBodyString(mail.TypeTextPlain, plainBody)
		m.AddAlternativeString(mail.TypeTextHTML, htmlBody)
	case plainBody != "":
		m.SetBodyString(mail.TypeTextPlain, plainBody)
	case htmlBody != "":
		m.SetBodyString(mail.TypeTextHTML, htmlBody)
	}

	c, err := mail.NewClient(
		"smtp.gmail.com",
		mail.WithPort(587),
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithUsername(sender),
		mail.WithPassword(password),
	)
	if err != nil {
		return err
	}

	if err := c.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}
	return nil
}
