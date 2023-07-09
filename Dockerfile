FROM swift:latest AS builder

RUN apt update
RUN apt install curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt install -y nodejs

COPY . /app/
WORKDIR /app

RUN swift build -c release

WORKDIR /app/Assets

RUN npm ci
RUN npm run build:js
RUN npm run build:css

FROM swift:slim

COPY --from=builder /app/Public /app/Public
COPY --from=builder /app/.build/release/SimpleBudget /app/SimpleBudget
