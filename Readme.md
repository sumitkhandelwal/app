ONE STOP SHOP - AI-Powered Assistant
Welcome to ONE STOP SHOP! This is a web application that acts as an intelligent assistant to help you manage your tasks. It features a voice-activated AI named Riya who can create stories, summarize your workload, and interact with you in a conversational way.

This project is built with a modern tech stack:

Frontend: React (with Tailwind CSS for styling)

Backend: Python (with the FastAPI framework)

🚀 Prerequisites
Before you begin, ensure you have the following software installed on your computer:

Node.js and npm: Required to run the React frontend. You can download it from the official Node.js website.

Python: Required to run the FastAPI backend. You can download it from the official Python website.

⚙️ Project Configuration
Follow these steps to set up and run the application on your local machine.

Step 1: Set Up the Project Folder
Download the Code: Make sure you have the project files. You should have:

A main.py file for the backend.

A frontend folder containing the React application, including the App.js, index.css, and App.css files.

Organize Your Folder: Create a main project folder called app. Place the main.py file inside it. Then, place the entire frontend folder inside the app folder.

Your folder structure should look like this:

app/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.css
│   └── package.json
└── main.py

Step 2: Start the Backend Server (FastAPI)
The backend is the engine of your application.

Open a Terminal: Open a new terminal or command prompt.

Navigate to Project Directory: Use the cd command to move into your main project folder.

cd path/to/your/app

Install Python Dependencies: Run the following command to install the necessary libraries for the backend.

pip install "fastapi[all]" uvicorn python-jose[cryptography] passlib[bcrypt]

Run the Backend Server: Start the server using this command.

uvicorn main:app --reload

You should see a message confirming that the server is running on http://127.0.0.1:8000.

✅ Keep this terminal window open! The backend must remain running for the application to work.

Step 3: Start the Frontend Application (React)
The frontend is the user interface that you see and interact with in your browser.

Open a NEW Terminal: It is crucial to open a second, separate terminal window. Do not close the one running the backend.

Navigate to Frontend Directory: In the new terminal, navigate into the frontend subfolder.

cd path/to/your/app/frontend

Install Node.js Dependencies: If you haven't already, run this command to install all the packages required for the React app. This step is only needed the first time or after a clean setup.

npm install

This may take a few minutes.

Run the Frontend App: Start the application with this command.

npm start

This will automatically open a new tab in your default web browser, pointing to http://localhost:3000.

▶️ How to Use the Application
Your browser should now display the "ONE STOP SHOP" login screen.

Use the following test credentials to sign in:

Email: test@onestop.shop

Password: password123

Once logged in, you can interact with the AI assistant, Riya, by clicking the avatar icon and saying "Hi Riya".

Enjoy your AI-powered assistant!