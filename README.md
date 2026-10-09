# Restaurant Booking Voice Agent

A full stack voice-based AI assistant that allows users to **book, cancel, and list restaurant reservations** using natural language.  
The system supports **multi-turn conversations**, allowing booking details to be provided across follow-up messages.

---

## Features

- Voice input and voice response
- Create, cancel, and list bookings
- Follow-up conversation memory
- Flexible input formats (e.g. “five people”, “31st December”, “8:00 a.m.”)
- Persistent storage using MongoDB Atlas

---

## Tech Stack

- React + Vite (Frontend)
- Node.js + Express (Backend)
- MongoDB Atlas + Mongoose
- Web Speech API

---

## Setup


## Project Structure

ai-voice-agent/
├── client/
│ ├── src/
│ │ ├── App.jsx
│ │ └── main.jsx
│ └── package.json
├── server/
│ ├── models/
│ │ └── Booking.js
│ ├── server.js
│ └── package.json
├── .env.example
├── .gitignore
└── README.md


---

## Conversational Capabilities

The agent supports **follow-up conversations** using session memory.

Examples:

**Booking with follow-ups**
User: Book a table
Agent: How many people is the booking for?
User: Five people
Agent: Please tell me the booking date.
User: 31st December
Agent: Please tell me the booking time.
User: 8:00 a.m.
Agent: Booking confirmed for 5 people on Thu Dec 31 2026 at 08:00.


**Cancel using history**
User: Cancel my booking
Agent: Please tell me the booking date.
User: 31st December
Agent: Your booking on Thu Dec 31 2026 has been cancelled.


**List bookings**
User: List all my bookings
Agent: 1. Sanchi — 5 people on Thu Dec 31 2026 at 08:00


The system remembers partial information across turns and does not reset context unless the intent is completed.

---

## Supported Natural Language Formats

The agent understands variations such as:

- "Book a table for two people on 13 February at 8 am"
- "Make a booking for five guests under the name Sanchi"
- "Cancel my booking for 21st April"
- "List all bookings"
- "Table for 10 people tomorrow at 7 pm"

### Backend
cd server
npm install


Create `.env`:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/restaurant
PORT=5000


Start server:
npm start


### Frontend
cd client
npm install
npm run dev


## Notes

- Works best in Chrome (for speech recognition)
- Microphone permission required
- Booking history is maintained during conversation


# Made with ❤️ by Sanchi











