package utils

import (
	"fmt"
	"os"

	mail "github.com/wneessen/go-mail"
)

func SendVerificationEmail(email, username, verifyCode string) error {
	sender := os.Getenv("SENDER_EMAIL")
	password := os.Getenv("APP_PASSWORD")

	m := mail.NewMsg()
	if err := m.From(sender); err != nil {
		return err
	}
	if err := m.To(email); err != nil {
		return err
	}
	m.Subject("SilentEcho Verification Code")

	// Plain text
	plainText := fmt.Sprintf("Hello %s,\n\nYour verification code is: %s\n", username, verifyCode)
	m.SetBodyString(mail.TypeTextPlain, plainText)

	// HTML
	htmlBody := fmt.Sprintf("<h2>Hello %s,</h2><p>Your verification code is: <b>%s</b></p>", username, verifyCode)
	m.AddAlternativeString(mail.TypeTextHTML, htmlBody)

	c, err := mail.NewClient("smtp.gmail.com",
		mail.WithPort(587),
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithUsername(sender),
		mail.WithPassword(password),
	)
	if err != nil {
		return err
	}

	if err := c.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send verification email: %v", err)
	}
	return nil
}
