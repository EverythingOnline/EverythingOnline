# EverythingOnline

A modular e-commerce starter built with React, Vite, Tailwind, TypeScript, Express, and Prisma. Designed to serve Kenyan shoppers with local grocery and household products.

## Local dev

Frontend:
- cd EverythingOnline
- npm install
- npm run dev

Backend:
- cd backend
- npm install
- Create a .env file from .env.example and set DATABASE_URL and JWT_SECRET
- npx prisma migrate dev --name init
- npm run dev

## Docker
- Build backend: `docker build -t everythingonline-backend ./backend`

## Notes
- Prisma schema at `backend/prisma/schema.prisma`
- Cloudinary integration planned for image uploads
