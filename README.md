# Kalender 2.1

Full-stack appointment booking application with a Spring Boot backend and a React frontend.

The project supports user registration/login, role-based access, appointment booking, category management, working-day locks, opening hours, and an admin view for managing bookings and users.

## Tech Stack

- Backend: Java 21, Spring Boot 3.5, Spring Security, JWT, Spring Data JPA
- Database: MySQL
- Frontend: React, React Router, React Big Calendar/date utilities
- Build tools: Maven Wrapper, npm

## Features

- JWT authentication with user and admin roles
- User appointment booking by category, date, and available time slot
- Admin appointment creation for selected users
- Admin booking confirmation/rejection and cancellation
- Category management
- Working-day lock/unlock
- Date-specific opening hours
- User password change

## Configuration

Runtime secrets are read from environment variables. Do not commit real credentials.

Backend variables:

```env
DB_URL=jdbc:mysql://localhost:3306/kalenderdb
DB_USERNAME=root
DB_PASSWORD=
JWT_SECRET=change-this-secret-before-deployment
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=no-reply@example.com
MAIL_ENABLED=false
ADMIN_SEED_ENABLED=false
ADMIN_SEED_NAME=admin
ADMIN_SEED_EMAIL=
ADMIN_SEED_PHONE=
ADMIN_SEED_PASSWORD=
```

Frontend variable:

```env
REACT_APP_API_BASE=http://localhost:8080
```

## Local Development

Backend:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Frontend:

```bash
cd my-app
npm install
npm start
```

The frontend runs on `http://localhost:3000` and expects the backend at `http://localhost:8080` by default.

## Build

Frontend:

```bash
cd my-app
npm run build
```

Backend:

```bash
./mvnw -DskipTests package
```

This project requires a JDK, not only a JRE. The backend is configured for Java 21.

## Portfolio Notes

This repository is intended as a portfolio project. Before making it public, verify that no local credentials, database dumps, IDE metadata, or generated dependency folders are committed.
