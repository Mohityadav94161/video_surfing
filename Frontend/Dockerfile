# Use Node.js 18 for development
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies.
# ci Short for “Clean Install”
# --silent	Hides logs/output (makes Docker build cleaner)
RUN npm ci --silent

# Copy source code
COPY . .

EXPOSE 3000

# Run in development mode
CMD ["npm", "start"]