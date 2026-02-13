# PhysioApp

A physiotherapy exercise web application built with Node.js, Express, EJS, Bootstrap 5, and MySQL.

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/vls24asu/SER-517-physio-app.git
cd SER-517-physio-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database
- Install MySQL if not already installed
- Open MySQL Workbench or terminal and run:
```sql
SOURCE database/DDL.sql;
SOURCE database/DML.sql;
```

### 4. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` with your local MySQL credentials.

### 5. Run the app
```bash
npm run dev
```
The app will be running at `http://localhost:3000`

## Tech Stack
- **Backend:** Node.js, Express 4
- **Frontend:** EJS, Bootstrap 5
- **Database:** MySQL
- **Auth:** bcrypt, express-session, speakeasy (2FA)
