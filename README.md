<div align="center">

# 🌾 Agro Saathi

### *Kisan se Bazaar Tak — From Farm to Market*

**A demand-driven digital agricultural marketplace connecting farmers and buyers directly — eliminating middlemen, ensuring fair pricing, and building transparent trade.**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 📖 What is Agro Saathi?

Agro Saathi (*Agro Companion*) is a **buyer-demand-driven agricultural marketplace** built to bring transparency and structure to farm trade in India. Instead of farmers guessing market prices or relying on middlemen, buyers post their raw material requirements and farmers can browse, select, and fulfil those demands directly.

The platform supports **multilingual access** (English, Marathi, Hindi) to ensure even rural, non-English-speaking farmers can participate with confidence.

---

## ✨ Key Features

### ✅ Live / Implemented
| Feature | Status | Description |
|---|---|---|
| 🔐 User Registration | ✅ Live | Role-based signup for Farmers, Buyers, and Admins |
| 🔑 JWT Authentication | ✅ Live | Secure login with JSON Web Token session management |
| 🛡️ Role-Based Access Control | ✅ Live | Separate dashboards and permissions per role |
| 🏪 Agricultural Marketplace | ✅ Live | Core marketplace for farm produce listing and trading |
| 🌿 Fertilizer Marketplace | ✅ Live | Buy and sell agricultural inputs directly |

### ⚙️ In Progress
| Feature | Status |
|---|---|
| 🗄️ PostgreSQL Database Integration | ⚠️ In Progress |
| 🔗 Frontend–Backend Connection | ⚠️ In Progress |
| 📋 Buyer Demand Posting Module | ⚠️ In Progress |
| 🤝 Farmer Demand Selection Workflow | ⚠️ In Progress |

### 🔮 Upcoming & Future Phases
| Feature | Phase |
|---|---|
| 🌐 Multilingual Support (English, Marathi, Hindi) | Phase 2 |
| 📊 Farmer Analytics Dashboard | Phase 2 |
| 🤖 AI-Based Fertilizer Recommendations | Phase 3 |
| ⛓️ Blockchain-Based Transaction Records | Phase 4 |
| 📱 Mobile App (Android/iOS) | Phase 4 |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│              React.js + Bootstrap UI                     │
│     Farmer Dashboard │ Buyer Dashboard │ Admin Panel     │
└─────────────────────────┬────────────────────────────────┘
                          │ REST API (HTTPS)
┌─────────────────────────▼────────────────────────────────┐
│                   BACKEND LAYER                          │
│                 Spring Boot (Java)                       │
│  Auth Module │ Marketplace │ Demand Engine │ Admin API   │
│              JWT Security Filter                         │
└─────────────────────────┬────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────┐
│                   DATABASE LAYER                         │
│                 PostgreSQL 16                            │
│   Users │ Demands │ Products │ Transactions │ Roles      │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React.js 18, Bootstrap 5 | Responsive UI, component-based design |
| **Backend** | Spring Boot 3.x (Java) | REST API, business logic, security |
| **Database** | PostgreSQL 16 | Persistent, relational data storage |
| **Authentication** | JWT (JSON Web Tokens) | Stateless, secure session management |
| **Testing** | JUnit 5, Postman | Unit testing & API integration testing |
| **Version Control** | Git & GitHub | Source control, collaboration |

---

## 👥 User Roles

### 🧑‍🌾 Farmer
- Browse active buyer demands
- Select demands to fulfil
- List produce in the marketplace
- Access the fertilizer marketplace
- View transaction history

### 🏢 Buyer
- Post raw material demands with quantity, quality specs, and price
- Browse available farmer listings
- Manage and track active demands
- Communicate with selected farmers

### 🛡️ Admin
- Manage users and role assignments
- Monitor marketplace activity
- Moderate listings and resolve disputes
- View platform analytics

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 16+
- Maven 3.8+

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/agro-saathi.git
cd agro-saathi
```

### 2. Configure the Database

Create a PostgreSQL database and update the configuration:

```properties
# src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/agro_saathi
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update

# JWT Configuration
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000
```

### 3. Start the Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The API will be live at `http://localhost:8080`

### 4. Start the Frontend

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`

---

## 📡 API Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login and receive JWT | Public |
| `GET` | `/api/demands` | List all active buyer demands | Farmer |
| `POST` | `/api/demands` | Post a new demand | Buyer |
| `POST` | `/api/demands/{id}/select` | Farmer selects a demand | Farmer |
| `GET` | `/api/marketplace` | Browse produce listings | All |
| `GET` | `/api/fertilizers` | Browse fertilizer listings | All |
| `GET` | `/api/admin/users` | Manage platform users | Admin |

> 📬 Full API documentation available via Postman collection — see `/docs/postman_collection.json`

---

## 🧪 Running Tests

```bash
# Run all backend unit tests
cd backend
mvn test

# Test API endpoints
# Import /docs/postman_collection.json into Postman
```

---

## 🗂️ Project Structure

```
agro-saathi/
├── backend/                    # Spring Boot application
│   ├── src/
│   │   ├── main/java/
│   │   │   ├── auth/           # JWT authentication & security
│   │   │   ├── user/           # User management & roles
│   │   │   ├── marketplace/    # Produce marketplace module
│   │   │   ├── demand/         # Buyer demand engine
│   │   │   ├── fertilizer/     # Fertilizer marketplace
│   │   │   └── admin/          # Admin panel APIs
│   │   └── resources/
│   │       └── application.properties
│   └── pom.xml
│
├── frontend/                   # React.js application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Role-based page views
│   │   ├── services/           # API service layer
│   │   └── i18n/               # Multilingual support files
│   └── package.json
│
├── docs/                       # Documentation & Postman collection
└── README.md
```

---

## 🌍 Multilingual Support *(Coming in Phase 2)*

Agro Saathi is being built with rural accessibility at its core. The platform will support:

- 🇬🇧 **English** — Default
- 🇮🇳 **Marathi** — Primary regional language
- 🇮🇳 **Hindi** — National language support

---

## 🤝 Contributing

Contributions are welcome! Here's how to get involved:

1. **Fork** this repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m 'Add: your feature description'`
4. **Push** to your branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please read `CONTRIBUTING.md` for coding standards and commit conventions.

---





## 📬 Contact

Have a question or want to collaborate?

- 📧 Email: naikshatrughna12@gmail.com
- 🐙 GitHub: github.com/Shatrughna19
- 🌐 Project Link: https://github.com/Shatrughna19/AgroSaathi.git
---

<div align="center">

**Built with ❤️ for Indian Farmers**

*Agro Saathi — Empowering every kisan, one demand at a time.*

</div>
