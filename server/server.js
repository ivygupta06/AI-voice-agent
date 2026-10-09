import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Booking from "./models/Booking.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- DB ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB error ❌", err));

/* ---------- AGENT ---------- */
app.post("/api/agent", async (req, res) => {
  try {
    const { message, session = {} } = req.body;
    const text = message.toLowerCase();

    /* ---------- NUMBER WORDS ---------- */
    const numberWords = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
      eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
      fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
      nineteen: 19, twenty: 20,
    };

    /* ---------- MEMORY ---------- */
    let memory = {
      intent: session.intent || null,
      guests: session.guests || null,
      date: session.date || null,
      time: session.time || null,
      name: session.name || "Guest",
    };

    /* ---------- INTENT ---------- */
    if (/cancel|delete|remove/.test(text)) memory.intent = "cancel";
    else if (/list|show|all bookings/.test(text)) memory.intent = "list";
    else if (/book|reserve|table/.test(text)) memory.intent = "book";

    /* ---------- NAME ---------- */
    const nameMatch = text.match(/under the name (\w+)/);
    if (nameMatch) memory.name = nameMatch[1];

    /* ---------- GUESTS (DIGITS + WORDS) ---------- */
    if (!memory.guests) {
      const digitMatch = text.match(/(\d+)\s*(people|guests)/);
      if (digitMatch) {
        memory.guests = Number(digitMatch[1]);
      } else {
        for (const word in numberWords) {
          if (text.includes(`${word} people`) || text.includes(`${word} guests`)) {
            memory.guests = numberWords[word];
            break;
          }
        }
      }
    }

    /* ---------- TIME (am, a.m., AM supported) ---------- */
    if (!memory.time) {
      const timeMatch = text.match(
        /(\d{1,2})(:\d{2})?\s*(am|pm|a\.m\.|p\.m\.)/
      );
      if (timeMatch) {
        let hour = Number(timeMatch[1]);
        const period = timeMatch[3];

        if ((period.includes("pm")) && hour !== 12) hour += 12;
        if ((period.includes("am")) && hour === 12) hour = 0;

        memory.time = `${hour.toString().padStart(2, "0")}:00`;
      }
    }

    /* ---------- DATE (13 february OR 13th february) ---------- */
    if (!memory.date) {
      const dateMatch = text.match(
        /(\d{1,2})(st|nd|rd|th)?\s*(january|february|march|april|may|june|july|august|september|october|november|december)/
      );
      if (dateMatch) {
        const day = Number(dateMatch[1]);
        const month = [
          "january","february","march","april","may","june",
          "july","august","september","october","november","december"
        ].indexOf(dateMatch[3]);

        memory.date = new Date(2026, month, day).toDateString();
      }
    }

    /* ================= LIST ================= */
    if (memory.intent === "list") {
      const bookings = await Booking.find();
      return res.json({
        reply: bookings.length
          ? bookings.map(
              (b, i) =>
                `${i + 1}. ${b.customerName} — ${b.numberOfGuests} people on ${b.bookingDate} at ${b.bookingTime}`
            ).join("\n")
          : "You have no bookings.",
        session: {},
      });
    }

    /* ================= CANCEL ================= */
    if (memory.intent === "cancel") {
      if (!memory.date) {
        return res.json({
          reply: "Please tell me the booking date to cancel.",
          session: memory,
        });
      }

      const deleted = await Booking.findOneAndDelete({
        bookingDate: memory.date,
      });

      return res.json({
        reply: deleted
          ? `Your booking on ${memory.date} has been cancelled.`
          : "No booking found for that date.",
        session: {},
      });
    }

    /* ================= BOOK ================= */
    if (memory.intent === "book") {
      if (!memory.guests)
        return res.json({ reply: "How many people?", session: memory });

      if (!memory.date)
        return res.json({ reply: "Please tell me the booking date.", session: memory });

      if (!memory.time)
        return res.json({ reply: "Please tell me the booking time.", session: memory });

      await Booking.create({
        customerName: memory.name,
        numberOfGuests: memory.guests,
        bookingDate: memory.date,
        bookingTime: memory.time,
      });

      return res.json({
        reply: `Booking confirmed for ${memory.guests} people on ${memory.date} at ${memory.time} under the name ${memory.name}.`,
        session: {},
      });
    }

    return res.json({
      reply: "I can help you book, cancel, or list reservations.",
      session: memory,
    });

  } catch (err) {
    console.error(err);
    res.json({ reply: "Sorry, something went wrong.", session: {} });
  }
});

/* ---------- START ---------- */
app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);
