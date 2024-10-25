FROM golang:1.23 AS builder
WORKDIR /app
COPY . .
# Buildanje sa statickim fileovima bez oslanjanja na dll-ove operativnog sistema
RUN CGO_ENABLED=0 go build -o go-cpp-runner .
FROM gcc:latest
WORKDIR /app
COPY --from=builder /app/go-cpp-runner .
# Kopiranje potrebnih biblioteka za Go backend
COPY --from=builder /usr/local/go /usr/local/go
CMD ["./go-cpp-runner"]
