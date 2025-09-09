FROM node:18-alpine

WORKDIR /app

# Copy only package files first for better caching
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN npm install

# Copy frontend specific files if you have a frontend directory
COPY Frontend/ ./Frontend/
COPY Backend/ ./Backend/
COPY Other files as needed...

# Build the frontend
RUN npm start

EXPOSE 3000

CMD ["npm", "start"]
