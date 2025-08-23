BINARY_SERVER=server
BINARY_WORKER=worker

# Run targets
server:
	go run cmd/server/main.go

worker:
	go run cmd/worker/email/main.go

run-all:
	$(MAKE) -j 2 server worker

# Build binaries
build:
	go build -o bin/$(BINARY_SERVER) cmd/server/main.go
	go build -o bin/$(BINARY_WORKER) cmd/worker/email/main.go

# Format code
fmt:
	go fmt ./...

# Tidy dependencies
tidy:
	go mod tidy

# Run tests
test:
	go test ./...

# Clean build artifacts
clean:
	rm -rf bin
