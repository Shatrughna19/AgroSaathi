<div align="center">

# 🌾 Agro Saathi

### *Kisan se Bazaar Tak — From Farm to Market*

**A direct-to-farmer digital ecosystem connecting agricultural producers and buyers — eliminating middlemen, ensuring fair pricing, and providing essential farming inputs.**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![I18Next](https://img.shields.io/badge/I18N-React--i18next-009688?style=for-the-badge&logo=i18next&logoColor=white)](https://react.i18next.com/)

</div>

---

## 📖 Overview

Agro Saathi (*Agro Companion*) is a comprehensive agricultural platform designed to empower farmers by providing direct market access. By shifting from a middleman-heavy model to a **demand-driven marketplace**, we ensure that farmers produce what the market actually needs, while buyers get quality produce at fair rates.

With the latest update, Agro Saathi now supports **multilingual accessibility** and **enhanced profile management**, allowing farmers, buyers, and shop owners to manage their listings and requirements with ease.

---

## ✨ Key Features

### ✅ Live & Implemented
| Feature | Description |
|---|---|
| 🌍 **Multilingual UI** | Support for **English** and **Marathi** using `react-i18next`. |
| 🧑‍🌾 **Farmer Hub** | List crops for sale, upload images, and manage harvest seasons. |
| 🏢 **Buyer Portal** | Broadcast crop requirements and target prices to local farmers. |
| 🛒 **Fertilizer Store** | Dedicated e-commerce space for Shop Owners to sell fertilizers and tools. |
| 🔔 **Smart Notifications** | Real-time alerts for new orders, inquiries, and contact requests. |
| 🔐 **Secure Auth** | Aadhar-based registration and secure login system. |
| 🛡️ **Role-Based Access** | Tailored dashboards for Farmers, Buyers, and Shop Owners. |

### ⚙️ Under Development
| Feature | Description |
|---|---|
| 📊 **Price Analytics** | AI-driven insights on seasonal crop pricing. |
| 🚛 **Logistics Integration** | Seamless connection with local transport providers. |
| ⛓️ **Secure Payments** | Integrated escrow system for safe transactions. |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Bootstrap 5, React-i18next |
| **Backend** | Spring Boot 3.x (Java 17) |
| **Database** | MySQL 8.x |
| **Styling** | Vanilla CSS & Bootstrap Icons |
| **Communication** | REST API with JSON payloads |

---

## 🏗️ Project Structure

```
AgroSaathi/
├── src/                        # Frontend (React + Vite)
│   ├── components/             # Reusable UI elements
│   ├── i18n/                   # Translation files (EN, MR)
│   ├── assets/                 # Images and Styles
│   └── App.jsx                 # Main entry & Routing
├── backend/                    # Backend (Spring Boot)
│   ├── src/main/java/...       # Java Controller/Service/Model
│   └── src/main/resources/     # application.properties (MySQL config)
├── public/                     # Static assets
└── index.html                  # HTML template
```

---

## 🚀 Getting Started

### Prerequisites
- **Java 17** or higher
- **Node.js 18** or higher
- **MySQL 8** (Running on port 3306)

### 1. Database Setup
Create a database named `agrosaathi` in your MySQL instance:
```sql
CREATE DATABASE agrosaathi;
```

### 2. Backend Configuration
Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/agrosaathi
spring.datasource.username=your_username
spring.datasource.password=your_password
server.port=8081
```

### 3. Run the Application

**Start Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Start Frontend:**
```bash
cd ..
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 📡 API Reference (Simplified)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users/register` | User signup (Farmer/Buyer/Shop Owner) |
| `POST` | `/api/users/login` | Aadhar-based authentication |
| `GET` | `/api/marketplace/listings` | View all available crops |
| `POST` | `/api/marketplace/listings` | Upload new crop listing (Farmer) |
| `GET` | `/api/marketplace/fertilizers` | Browse fertilizer products |
| `POST` | `/api/marketplace/orders` | Broadcast buyer requirements |

---

## 📬 Contact & Collaboration

- **Developer**: Shatrughna Naik
- **Email**: [naikshatrughna12@gmail.com](mailto:naikshatrughna12@gmail.com)
- **GitHub**: [github.com/Shatrughna19](https://github.com/Shatrughna19)
- **Repository**: [AgroSaathi](https://github.com/Shatrughna19/AgroSaathi.git)

---

<div align="center">

**Built with ❤️ for Indian Agriculture**  
*Empowering every kisan, one connection at a time.*

</div>
