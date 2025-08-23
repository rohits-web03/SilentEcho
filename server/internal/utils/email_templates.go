package utils

import "fmt"

func VerificationEmail(username, code string) (subject, plain, html string) {
	subject = "SilentEcho Verification Code"
	plain = fmt.Sprintf("Hello %s,\n\nYour verification code is: %s\n", username, code)
	html = fmt.Sprintf("<h2>Hello %s,</h2><p>Your verification code is: <b>%s</b></p>", username, code)
	return
}
