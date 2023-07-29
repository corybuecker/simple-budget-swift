FROM swift:latest AS builder

RUN apt update
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

COPY Package.swift Package.resolved /app/
WORKDIR /app

RUN swift package resolve

COPY Resources /app/Resources
COPY Public /app/Public
COPY Sources /app/Sources

RUN swift build -c release -Xswiftc -g

WORKDIR /app/Resources

RUN npm ci
RUN npm run build:js
RUN npm run build:css

FROM swift:slim

COPY --from=builder /app/Resources /app/Resources
COPY --from=builder /app/Public /app/Public
COPY --from=builder /app/.build/release/SimpleBudget /app/SimpleBudget

WORKDIR /app

CMD ["/app/SimpleBudget", "serve", "--bind", "0.0.0.0:8080"]