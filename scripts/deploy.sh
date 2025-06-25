#!/bin/bash

# XFansTube Deployment Script
set -e

echo "🚀 Starting XFansTube deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# Check if running in production
if [ "$1" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo -e "${YELLOW}🏭 Production deployment mode${NC}"
else
    echo -e "${YELLOW}🔧 Development deployment mode${NC}"
fi

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: $ENV_FILE file not found!${NC}"
    echo -e "${YELLOW}💡 Please copy .env.example to .env and configure your environment variables${NC}"
    exit 1
fi

# Load environment variables
source $ENV_FILE

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running!${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Error: docker-compose is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Pull latest images (for production)
if [ "$1" = "prod" ]; then
    echo -e "${YELLOW}📥 Pulling latest images...${NC}"
    docker-compose -f $COMPOSE_FILE pull
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f $COMPOSE_FILE down

# Build and start containers
echo -e "${YELLOW}🔨 Building and starting containers...${NC}"
docker-compose -f $COMPOSE_FILE up -d --build

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 30

# Check service health
echo -e "${YELLOW}🔍 Checking service health...${NC}"

# Check MongoDB
if docker-compose -f $COMPOSE_FILE exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB is healthy${NC}"
else
    echo -e "${RED}❌ MongoDB health check failed${NC}"
fi

# Check Backend
if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

# Check Frontend
if curl -f http://localhost/health > /dev/null 2>&1 || curl -f http://localhost:80/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
fi

# Show running containers
echo -e "${YELLOW}📋 Running containers:${NC}"
docker-compose -f $COMPOSE_FILE ps

# Clean up old images
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Application is available at:${NC}"
echo -e "   Frontend: http://localhost"
echo -e "   Backend API: http://localhost:5001/api"
echo -e "   Health Check: http://localhost:5001/api/health"

if [ "$1" = "prod" ]; then
    echo -e "${YELLOW}📊 To view logs: docker-compose -f $COMPOSE_FILE logs -f${NC}"
    echo -e "${YELLOW}🔧 To stop: docker-compose -f $COMPOSE_FILE down${NC}"
fi