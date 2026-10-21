🏡 Airbnb Clone

A full-stack Airbnb-inspired web application that allows users to explore property listings, create accounts, book stays, and leave reviews.
This project focuses on core backend logic, authentication, and database design, built using Node.js, Express, MongoDB, and server-rendered views.

🚀 Features

🔐 User Authentication (Register / Login / Logout)

🏘️ Property Listings (Add, View, Edit, Delete)

📅 Booking System

⭐ Reviews & Ratings

🔍 Search & Filter Listings

🖼️ Image Upload for Properties

🛡️ Authorization & Secure Routes

📱 Responsive UI

👤 Host and admin approval workflows

🛠️ Tech Stack
Frontend

HTML5

CSS3

JavaScript

Bootstrap

EJS (Server-Side Templating)

Backend

Node.js

Express.js

Database

MongoDB

Mongoose

Authentication & Utilities

BCrypt password hashing

Express Session


📸 Screenshots

Screenshots will be added soon.

🎯 Learning Outcomes

Hands-on experience with MVC architecture

Real-world authentication & authorization

Database modeling using MongoDB

Backend-focused full-stack development

File uploads & session management

🔮 Future Improvements

Payment gateway integration

Advanced search with map view

Wishlist functionality

React frontend upgrade (optional 🚀)

🤝 Contributing

Contributions are welcome!
Feel free to fork the repository and submit a pull request.

📄 License

This project is for learning and educational purposes.

## Setup

The app runs at `http://localhost:5000` by default and connects to a local
MongoDB instance at `mongodb://127.0.0.1:27017/airbnb`. Start MongoDB before
running `npm start`. You can override these defaults with `MONGO_URI` and
`PORT` in `.env`. Local development uses a built-in session secret; set a
unique `SESSION_SECRET` for deployments. Cloudinary credentials (`CLOUD_NAME`,
`CLOUD_API_KEY`, and `CLOUD_API_SECRET`) are needed for listing image uploads.
New accounts are logged in immediately after signup. Booking validation
messages are shown as dismissible notifications on the stay page.
To create or promote an administrator, set `ADMIN_USERNAME`, `ADMIN_EMAIL`,
and `ADMIN_PASSWORD` in `.env`; the configured username is promoted when the
server starts. Existing username/password accounts remain supported, including
accounts created with the previous Passport local strategy.

## Tests

Run the project checks with `npm test`.
