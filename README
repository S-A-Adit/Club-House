# Clubhouse App

A simple members-only clubhouse web app built with **Node.js, Express, Passport.js, PostgreSQL**, and **bcrypt**.  
This project demonstrates **user authentication**, **authorization**, and **role-based permissions** in a real-world scenario.

---

## 🚀 Features

- **User Authentication**
  - Sign-up with validation and password hashing (bcrypt)
  - Login/logout with Passport.js
  - Confirm password field for secure signup

- **Membership System**
  - Regular users can sign up but do **not** become members by default
  - “Join the Club” page allows users to enter a **secret passcode** to gain membership status

- **Messaging**
  - Logged-in users can create new messages (title + content + timestamp)
  - All messages are visible to everyone, but:
    - Only **members** can see the author and date of each message
    - Non-members see messages anonymously

- **Admin Role**
  - Users with `admin = true` have extra privileges
  - Admins can delete any message
  - Admin role can be granted via a secret passcode or during setup

- **Security**
  - Passwords stored securely using bcrypt hashing
  - Input fields validated and sanitized

---

## 🗂️ Database Models

### User
- `id` (primary key)  
- `first_name` (string)  
- `last_name` (string)  
- `email` (string, unique)  
- `hashed_password` (string)  
- `membership_status` (boolean, default: false)  
- `admin` (boolean, default: false)  

### Message
- `id` (primary key)  
- `title` (string)  
- `text` (text)  
- `timestamp` (date)  
- `user_id` (foreign key → User.id)  

---