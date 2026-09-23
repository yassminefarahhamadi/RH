# ESPRIT RH — Human Resources Management Platform

## 1. Project Overview

**ESPRIT RH** is a full-stack web application developed to digitalize and simplify Human Resources management processes within an academic environment.

The platform provides different functionalities according to the user's role and implements a centralized system for managing employees, students, administrative users, and HR-related information.

The application follows a client-server architecture based on a React frontend, a Node.js/Express backend, and a MySQL relational database.

---

## 2. Project Objectives

| Objective       | Description                                          |
| --------------- | ---------------------------------------------------- |
| HR Management   | Centralize and simplify human resources management   |
| User Management | Manage employees, students, and administrative users |
| Access Control  | Restrict functionalities according to user roles     |
| Data Management | Store and manage structured HR information           |
| Web Interface   | Provide an accessible and user-friendly interface    |
| API Integration | Enable communication between frontend and backend    |
| Maintainability | Separate application layers for easier maintenance   |

---

## 3. Main Features

| Module              | Main functionalities                                    |
| ------------------- | ------------------------------------------------------- |
| Authentication      | User login and authentication                           |
| User Management     | Create, update, delete and consult users                |
| Employee Management | Manage employee-related information                     |
| Student Management  | Manage student-related information                      |
| Role Management     | Manage access according to user roles                   |
| HR Management       | Manage HR-related data and operations                   |
| Dashboard           | Display relevant information according to the user role |
| Database            | Persistent storage using MySQL                          |

---

## 4. User Roles and Permissions

The application implements a **Role-Based Access Control (RBAC)** mechanism.

| Role         | Access Level | Main Responsibilities               |
| ------------ | ------------ | ----------------------------------- |
| Admin        | Full         | Global application administration   |
| Admin RH     | HR           | Human Resources management          |
| Admin Études | Academic     | Student and academic management     |
| Employé      | Limited      | Access to employee-related services |
| Étudiant     | Limited      | Access to student-related services  |

The authorization layer ensures that users can only access resources and operations associated with their assigned role.

---

## 5. System Architecture

The application follows a **three-layer architecture**:

```text
                         ┌─────────────────────────┐
                         │        CLIENT           │
                         │                         │
                         │       React.js          │
                         │     User Interface      │
                         └────────────┬────────────┘
                                      │
                                      │ HTTP / REST API
                                      │
                         ┌────────────▼────────────┐
                         │       APPLICATION       │
                         │                         │
                         │    Node.js / Express    │
                         │                         │
                         │  ┌───────────────────┐  │
                         │  │ Routes            │  │
                         │  │ Controllers       │  │
                         │  │ Business Logic    │  │
                         │  │ Authentication    │  │
                         │  │ Authorization     │  │
                         │  └───────────────────┘  │
                         └────────────┬────────────┘
                                      │
                                      │ SQL Queries
                                      │
                         ┌────────────▼────────────┐
                         │        DATABASE         │
                         │                         │
                         │          MySQL          │
                         │                         │
                         │   Users / Employees     │
                         │   Students / HR Data    │
                         └─────────────────────────┘
```

### Architecture Layers

| Layer              | Technology           | Responsibility                          |
| ------------------ | -------------------- | --------------------------------------- |
| Presentation Layer | React.js             | User interface and user interaction     |
| Application Layer  | Node.js / Express.js | Business logic and REST API             |
| Data Layer         | MySQL                | Data persistence and relational storage |

---

## 6. Application Flow

The general communication flow between the different components is:

```text
User
  │
  ▼
React Frontend
  │
  │ HTTP Request
  ▼
Express REST API
  │
  ▼
Authentication / Authorization
  │
  ▼
Business Logic
  │
  │ SQL Query
  ▼
MySQL Database
  │
  │ Query Result
  ▼
Express API
  │
  │ HTTP Response
  ▼
React Frontend
  │
  ▼
User Interface
```

---

## 7. Backend Architecture

The backend is organized into independent components in order to separate responsibilities.

```text
backend/
│
├── controllers/
│   ├── userController.js
│   ├── employeeController.js
│   ├── studentController.js
│   └── ...
│
├── models/
│   ├── userModel.js
│   ├── employeeModel.js
│   ├── studentModel.js
│   └── ...
│
├── routes/
│   ├── userRoutes.js
│   ├── employeeRoutes.js
│   ├── studentRoutes.js
│   └── ...
│
├── middleware/
│   ├── authentication.js
│   ├── authorization.js
│   └── ...
│
├── config/
│   └── database.js
│
├── server.js
├── package.json
└── .env
```

### Backend Components

| Component   | Responsibility                         |
| ----------- | -------------------------------------- |
| Routes      | Define API endpoints                   |
| Controllers | Handle incoming requests               |
| Models      | Interact with the database             |
| Middleware  | Authentication and authorization       |
| Config      | Application and database configuration |
| Server      | Initialize and run the backend         |

---

## 8. Frontend Architecture

The React application is organized into reusable components and application modules.

```text
frontend/
│
├── public/
│
├── src/
│   │
│   ├── components/
│   │   ├── Navbar/
│   │   ├── Sidebar/
│   │   ├── Tables/
│   │   └── Forms/
│   │
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Employees/
│   │   ├── Students/
│   │   └── Users/
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── routes/
│   │
│   ├── assets/
│   │
│   ├── App.js
│   └── index.js
│
├── package.json
└── ...
```

---

## 9. Database Architecture

The application uses **MySQL** as its relational database management system.

A simplified representation of the data model is shown below:

```text
                    ┌──────────────────┐
                    │      USERS       │
                    ├──────────────────┤
                    │ id               │
                    │ name             │
                    │ email            │
                    │ password         │
                    │ role             │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │  EMPLOYEES   │ │   STUDENTS   │ │ ADMIN USERS  │
      ├──────────────┤ ├──────────────┤ ├──────────────┤
      │ employee_id  │ │ student_id   │ │ admin_id     │
      │ information  │ │ information  │ │ information  │
      └──────────────┘ └──────────────┘ └──────────────┘
```

### Data Management

| Entity    | Purpose                          |
| --------- | -------------------------------- |
| Users     | Authentication and user accounts |
| Employees | Employee-related information     |
| Students  | Student-related information      |
| Roles     | Access control                   |
| HR Data   | Human resources information      |

> The exact entities and relationships depend on the database schema implemented in the project.

---

## 10. Authentication and Authorization

The application separates **authentication** from **authorization**.

```text
                   User
                    │
                    ▼
               Login Form
                    │
                    ▼
              Authentication
                    │
              ┌─────┴─────┐
              │           │
           Valid       Invalid
              │           │
              ▼           ▼
          User Role      Error
              │
              ▼
       Authorization
              │
       ┌──────┴──────┐
       │             │
    Allowed       Forbidden
       │             │
       ▼             ▼
  Application      Access
   Resource        Denied
```

The user's role determines which routes, pages, and operations can be accessed.

---

## 11. API Architecture

The frontend communicates with the backend through RESTful APIs.

```text
React Application
       │
       │ HTTP
       ▼
┌───────────────────────┐
│      REST API         │
├───────────────────────┤
│ /api/auth             │
│ /api/users            │
│ /api/employees        │
│ /api/students         │
│ /api/hr               │
└───────────┬───────────┘
            │
            ▼
       MySQL Database
```

### HTTP Methods

| Method | Purpose              |
| ------ | -------------------- |
| GET    | Retrieve data        |
| POST   | Create new data      |
| PUT    | Update existing data |
| DELETE | Remove data          |

---

## 12. Technology Stack

| Category             | Technology         |
| -------------------- | ------------------ |
| Frontend             | React.js           |
| Backend              | Node.js            |
| API                  | Express.js         |
| Database             | MySQL              |
| Database Environment | XAMPP              |
| Version Control      | Git / GitHub       |
| API Testing          | Postman            |
| IDE                  | Visual Studio Code |

---

## 13. Development Workflow

The development workflow can be summarized as follows:

```text
Requirements
     │
     ▼
System Design
     │
     ▼
Database Design
     │
     ▼
Backend Development
     │
     ▼
REST API Development
     │
     ▼
Frontend Development
     │
     ▼
Frontend / Backend Integration
     │
     ▼
Testing
     │
     ▼
Deployment
```

---

## 14. Installation

### Prerequisites

The following tools are required:

| Tool    | Purpose                       |
| ------- | ----------------------------- |
| Node.js | Run the frontend and backend  |
| npm     | Manage dependencies           |
| MySQL   | Database management           |
| XAMPP   | Local development environment |
| Git     | Version control               |

### Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd ESPRIT-RH
```

### Database Configuration

Start Apache and MySQL from XAMPP.

Create the project database and import the provided SQL script.

Configure the database connection using environment variables.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=esprit_rh
PORT=5000
```

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm start
```

---

## 15. Environment Variables

Sensitive configuration values should not be committed to the repository.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=esprit_rh
PORT=5000
```

The `.env` file should be added to `.gitignore`.

```text
.env
node_modules/
build/
dist/
```

---

## 16. Testing

The application can be tested at different levels:

| Testing Type           | Purpose                               |
| ---------------------- | ------------------------------------- |
| API Testing            | Validate REST endpoints               |
| Functional Testing     | Verify application features           |
| Authentication Testing | Validate login and access control     |
| Role Testing           | Verify permissions for each user role |
| Integration Testing    | Verify frontend/backend communication |
| Database Testing       | Validate data persistence and queries |

Postman can be used to test the REST API independently from the frontend.

---

## 17. Security Considerations

The application includes several security principles:

* Role-based access control.
* Protected application resources.
* Environment variables for sensitive configuration.
* Separation between frontend and backend.
* Controlled database access.
* Validation of user operations.
* Restricted access to role-specific functionalities.

---

## 18. Deployment Architecture

The application can be deployed using a separated frontend/backend architecture.

```text
                    Internet
                       │
                       ▼
                ┌─────────────┐
                │   Browser   │
                └──────┬──────┘
                       │
                       ▼
              ┌─────────────────┐
              │    Frontend     │
              │    React.js     │
              └────────┬────────┘
                       │
                       │ HTTPS / REST API
                       ▼
              ┌─────────────────┐
              │     Backend     │
              │ Node.js/Express │
              └────────┬────────┘
                       │
                       │ SQL
                       ▼
              ┌─────────────────┐
              │     MySQL       │
              │    Database     │
              └─────────────────┘
```

---

## 19. Future Improvements

Potential improvements include:

| Area        | Improvement                                    |
| ----------- | ---------------------------------------------- |
| DevOps      | Docker containerization                        |
| CI/CD       | Automated build, test and deployment pipeline  |
| Cloud       | Deployment on AWS, Azure or OpenStack          |
| Monitoring  | Prometheus and Grafana integration             |
| Security    | Advanced authentication and authorization      |
| Testing     | Automated unit and integration tests           |
| Database    | Optimization and backup strategy               |
| Scalability | Service separation and container orchestration |

---

## 20. Academic Context

**Institution:** ESPRIT – École Supérieure Privée d'Ingénierie et de Technologie

**Project:** ESPRIT RH

**Domain:** Human Resources Management

**Architecture:** Client-Server / Three-Layer Architecture

**Frontend:** React.js

**Backend:** Node.js / Express.js

**Database:** MySQL

**Development Environment:** XAMPP

---

## 21. Conclusion

ESPRIT RH provides a centralized web-based solution for managing human resources and related information. The separation between the presentation, application, and data layers facilitates maintainability and provides a foundation for future extensions such as cloud deployment, containerization, CI/CD automation, monitoring, and enhanced security.
