# 📔 Mzalendo 

A dynamic blog post web application built with vanilla JavaScript, allowing users to create, search, view, edit, like, and 
delete blog posts in real-time. Data is handled via a mock REST API using json-server.

## ✨ Features
- 🔎 Live Search — Real-time filtering of posts by title or content.
- 📝 Create Blog Posts — Submit posts with a title, author, image URL, and content.
- 📖 View Full Post — Click to view complete post details, including:
   - Date posted
   - Image preview
   - Content body
   - Like counter & view count
- ❤️ Like/Unlike Posts — Toggle likes on posts.
- ⏱️ Time Display — Shows "x minutes ago" dynamically.
- ✏️ Edit & Save — Edit posts inline with save/cancel functionality.
- 🗑️ Delete Posts — Permanently delete posts.
- 📊 View Counter — Increments views after spending 2 minutes on a post.


## 📂 Project Structure

```
index.html
├── styles.css
├── script.js
└── db.json (Mock database)
```

## 🖥️ Installation & Setup
1. Clone the repository:
```
git clone https://github.com/kaioken-glitch/Mzalendo.git
cd Mzalendo

```

2. Install json-server to mock the REST API:

```
npm install -g json-server
```

3. Start the server:

```
json-server --watch db.json
```

4. Open index.html in your browser.


## 📌 API Endpoints

| Method | Endpoint        | Description        |
| ------ | --------------- | ------------------ |
| GET    | `/postData`     | Get all posts      |
| GET    | `/postData/:id` | Get single post    |
| POST   | `/postData`     | Create new post    |
| PATCH  | `/postData/:id` | Update post fields |
| DELETE | `/postData/:id` | Delete post        |


## ⚙️ Technologies Used

- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- JSON Server (Mock REST API)
- FontAwesome Icons

## 🎨 Screenshots
![Previe](./assets/mzalendo.png)


## 📅 Upcoming Features

- ✅ Comment section for each post
- ✅ User authentication for blog edit rights
- 🌙 Dark mode toggle


## 👨‍💻 Author
- kaioken-glitch
- lightningcyranus@gmail.com