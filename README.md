# Course Selling Platform Backend API

A backend API for a simple course selling platform built using Node.js, Express, and MongoDB.  
This project demonstrates authentication, role-based authorization, and CRUD operations using REST APIs.

## Features
- User signup and login with JWT authentication
- Admin signup and login (protected with secret key)
- Role-based access control (user / admin)
- Admin can create, update, and delete courses
- Users can view and purchase courses
- Purchased courses are user-specific
- Protected routes using middleware

## Technologies Used
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- JSON Web Token (JWT)  
- Zod  
- bcrypt  
- express-rate-limit  

## How to Run
1. Clone or download the project  
2. Install dependencies  
   npm install  
3. Create a `.env` file in root directory similar to `.env.example`  
4. Start the server  
   npm run start

Server runs at:  
http://localhost:{PORT}


## API Endpoints

### User
- POST /user/signup → Register user  
- POST /user/login → Login and get token  

### Admin
- POST /admin/signup → Register admin (protected)  
- POST /admin/login → Admin login  
- POST /admin/course → Create course  
- GET /admin/course → Get admin’s courses  
- GET /admin/course/:id → Get course by ID  
- PUT /admin/course/:id → Update course  
- DELETE /admin/course/:id → Delete course  

### Course (Protected)
- GET /course → Get all courses  
- GET /course/:id → Get course by ID  
- POST /course/purchase/:id → Purchase course  
- GET /course/purchased → Get purchased courses  

## Authorization
Pass JWT token in request headers:

authorization: `<token>`


## Notes
- Admin signup requires `ADMIN_SECRET`
- MongoDB does not support automatic cascading deletes, so related purchases are deleted manually
- All protected routes require a valid JWT token

## Author
Ashish Goyat