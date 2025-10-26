# Orbis — Containerized Event Management Platform

**Tags:** Docker - Containerization - Nginx - SSL  
**Project Type:** WEC Systems Task  
**Application:** [WebClub-NITK/orbis](https://github.com/WebClub-NITK/orbis)

---

## Introduction

This project focuses on **containerizing** and **orchestrating** the Orbis event management platform using **Docker and Docker Compose**.  
The goal is to understand how multiple services — frontend, backend, database, and reverse proxy — can be built, connected, and run together in isolated containers.

Unlike a full production deployment, this setup is a **local development environment** that demonstrates how containerization simplifies dependency management, networking, and multi-service integration.

---

## Objectives

1. Containerize the frontend and backend using Docker.
2. Set up a PostgreSQL database container with persistent storage.
3. Connect services via a shared Docker network.
4. Configure Nginx as a reverse proxy and SSL terminator.
5. Bring the entire stack up using a single `docker-compose` command.

---

## Tech Stack

| Component | Technology |
|------------|-------------|
| **Frontend** | React, TypeScript, Vite, TailwindCSS |
| **Backend** | Node.js (Express) + Prisma ORM |
| **Database** | PostgreSQL |
| **Proxy** | Nginx |
| **Orchestration** | Docker Compose |

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/antonyth18/Containerization-WEC.git
cd Containerization-WEC
```

### 2. Useful setup commands
```bash
# Build containers
docker-compose build

# Run the containers and get the entire stack up in a single command
docker compose up --scale backend=3 --scale frontend=2 -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Access a container shell
docker exec -it <container_name> sh
```

### 3. Access the Application

Create a .env file in this format:

POSTGRES_USER="YOUR_POSTGRES_USER"
POSTGRES_PASSWORD="YOUR_POSTGRES_PASSWORD"
POSTGRES_DB="YOUR_POSTGRES_DB_NAME"

Once all containers are up and running, open your browser and visit:

- **HTTP:** [http://localhost](http://localhost)  
- **HTTPS (if SSL is enabled):** [https://localhost](https://localhost)

---

**Backend Environment Configuration**

Create a `.env` file in the backend directory with the following variables:
```
DATABASE_URL="your-supabase-postgres-connection-string"
PORT=4000
NODE_ENV=development

# Use your frontend deployment URL in production
CORS_ORIGIN="https://your-frontend-domain.com"
# For local development
# CORS_ORIGIN="http://localhost:3000"

AUTH0_ISSUER_BASE_URL="your-auth0-issuer-url"
AUTH0_AUDIENCE="your-auth0-audience"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"
```

**Frontend Environment Configuration**
Create a `.env` file in the frontend directory with the following variables:
```
# Use your backend deployment URL in production
VITE_API_URL="https://your-backend-domain.com"
# For local development 
# VITE_API_URL="http://localhost:4000"

# Supabase
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Auth0
VITE_AUTH0_DOMAIN="your-auth0-domain"
VITE_AUTH0_CLIENT_ID="your-auth0-client-id"
VITE_AUTH0_AUDIENCE="your-auth0-audience"
VITE_AUTH0_SCOPE="openid profile email"
VITE_AUTH0_REDIRECT_URI="https://your-frontend-domain.com"
```

---

## Docker Setup Overview

### Backend (`backend/Dockerfile`)

- **Base Image:** `node:20-alpine`  
- Installs dependencies and starts the Express server.  
- Connects to PostgreSQL via environment variables.

### Frontend (`frontend/Dockerfile`)

- **Base Image:** `node:20-alpine`  
- Builds the Vite app and serves it via the development server.  
- Communicates with the backend through the Nginx reverse proxy.


### Database

- Uses the official **PostgreSQL 16-alpine** image.  
- Persistent data stored in a **named Docker volume** (`pgdata`).  
- Accessible internally only through the Docker network.


### Nginx

- Acts as a **reverse proxy**:
  - `/` → Frontend  
  - `/api` → Backend  
- Handles **SSL termination** using local self-signed certificates.  
- Redirects all HTTP traffic to HTTPS.

---

## Docker Compose Configuration

All services are defined in `docker-compose.yml`:

| Service | Description |
|----------|--------------|
| **db** | PostgreSQL container with volume persistence |
| **backend** | Node.js + Prisma service connected to db |
| **frontend** | React + Vite development server |
| **nginx** | Reverse proxy exposing ports **80 (HTTP)** and **443 (HTTPS)** |

---

## SSL Setup

Self-signed certificates are stored in:
   nginx/ssl/cert.pem
   nginx/ssl/key.pem


To generate new ones:

```bash
openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365
```

---

## Key Takeaways

- Learned how to **containerize multi-service applications**.  
- Configured **internal networking** and **environment variables**.  
- Implemented **Nginx reverse proxying** for a full-stack application.  
- Used **Docker Compose** to manage and orchestrate all containers efficiently.  

---

## Conclusion

This project demonstrates a complete, working example of **containerization and orchestration** using **Docker** and **Nginx**.  
It connects multiple services into a **cohesive, reproducible environment** suitable for **local development** and **testing**.

---






   

