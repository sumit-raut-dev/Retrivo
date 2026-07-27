# Retrivo Database

This folder contains the PostgreSQL database schema for the **Retrivo – Lost & Found Portal**.

## Requirements

- PostgreSQL 18 or later
- pgAdmin 4 or DBeaver

## Files

- **retrivo_schema.sql** – Contains the complete database schema, including:
  - Tables
  - Primary Keys
  - Foreign Keys
  - Indexes
  - Constraints
  - Sequences

> **Note:** This file contains only the database structure. No user or application data is included.

## Database Setup

### 1. Create a new PostgreSQL database

```sql
CREATE DATABASE retrivodb;
```

### 2. Import the schema

Using **pgAdmin**:

1. Open pgAdmin.
2. Select the `retrivodb` database.
3. Open **Query Tool**.
4. Open `retrivo_schema.sql`.
5. Execute the script.

Using **DBeaver**:

1. Open the `retrivodb` database.
2. Open an SQL Editor.
3. Open `retrivo_schema.sql`.
4. Execute the script.

## Backend Configuration

Update the connection string in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=retrivodb;Username=postgres;Password=YOUR_PASSWORD"
}
```

## Run the Project

### Backend

```bash
dotnet restore
dotnet run
```

### Frontend

```bash
npm install
ng serve
```

The application will automatically use the imported PostgreSQL database.

## Notes

- This repository intentionally excludes application data.
- You may populate the database manually or by using the application after setup.
- The schema is compatible with the current version of the Retrivo backend.