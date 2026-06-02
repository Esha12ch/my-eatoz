🍔 Eatoz
🚀 Full-Stack Food Delivery & Grocery Platform

Order delicious food, groceries, and essentials from your favorite restaurants and stores with a seamless online experience.

🍕 Food Ordering | 🛒 Grocery Shopping | 💳 Online Payments | 📦 Order Management

🌟 Overview

Eatoz is a modern full-stack food delivery and grocery ordering platform built using the MERN stack. The platform enables users to browse restaurants, order food and groceries, manage carts, make secure online payments, and track orders through an intuitive and responsive interface.

It also includes a powerful Admin Dashboard for managing products, restaurants, orders, and users.

✨ Features
👤 User Features
🔐 User Registration & Login
🍕 Browse Food Categories
🛒 Grocery Shopping
🏪 Restaurant Listings
❤️ Add Products to Cart
💳 Secure Online Payments
📦 Order Management
📅 Booking Functionality
⭐ Customer Reviews & Ratings
🎁 Special Offers & Discounts
📱 Fully Responsive Design
👑 Admin Features
📊 Admin Dashboard
🍔 Food Item Management
🛒 Grocery Product Management
🏪 Restaurant Management
📦 Order Monitoring
👥 User Management
📈 Platform Analytics
⚙️ Content & Inventory Management

🧠 How It Works
graph TD
A[User Signup/Login] --> B[Browse Restaurants & Products]
B --> C[Add Items to Cart]
C --> D[Checkout]
D --> E[Secure Payment]
E --> F[Order Confirmation]
F --> G[Track & Manage Orders]

🛠️ Tech Stack

Frontend: React.js, Vite, Axios, React Router
Backend: Node.js, Express.js
Database: MongoDB
Authentication: JWT, Firebase
Payments: Stripe
Others: Cloudinary, Multer, Nodemailer

Payment Gateway
💳 Stripe Payment Integration

📂 Project Structure
Eatoz/
│
├── client/
│   ├── src/
│   │   ├── Components/
│   │   ├── Pages/
│   │   ├── Context/
│   │   ├── Services/
│   │   └── Assets/
│
├── server/
│   ├── Controllers/
│   ├── Models/
│   ├── Routes/
│   ├── Middleware/
│   ├── Config/
│   └── Utils/
│
└── README.md

⚙️ Installation
1️⃣ Clone Repository
git clone https://github.com/yourusername/eatoz.git

cd eatoz

2️⃣ Install Dependencies
Frontend
npm install
npm run dev
Backend
cd server
npm install
npm run dev


🔑 Environment Variables
Create a .env file inside the server folder:

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

STRIPE_SECRET_KEY=your_stripe_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

📊 Admin Dashboard
The Admin Panel allows administrators to:

Manage food products
Manage grocery inventory
View and process orders
Manage restaurants
Track platform activity
Manage users and customer data

🔒 Security Features
JWT Authentication
Password Encryption (Bcrypt)
Protected Routes
Secure Payment Handling
Input Validation
Cloud-Based Image Storage

🚀 Future Enhancements
📍 Real-Time Order Tracking
🚚 Delivery Partner Module
❤️ Wishlist Functionality
📈 Advanced Analytics Dashboard
📱 Mobile Application

👩‍💻 Author

Esha Chauhan
MCA Graduate | Full Stack Developer
