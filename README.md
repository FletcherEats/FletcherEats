Fletcher Eats Backend (Render + MongoDB + Socket.IO)

Deploy:
  - Push this repo to GitHub.
  - On Render, create a Web Service from GitHub (point at /backend if monorepo).
  - Build command: npm install
  - Start command: npm start
  - Environment variables on Render:
      - MONGODB_URI (MongoDB Atlas connection string) to use MongoDB (optional; otherwise uses data.json)
      - JWT_SECRET (set a strong secret)
Default accounts (db_stub):
  Admin: admin@fletchereats.co.za / admin123
  Driver1: driver1@fletchereats.co.za / driver1pass
  Driver2: driver2@fletchereats.co.za / driver2pass
