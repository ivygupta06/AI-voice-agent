import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    numberOfGuests: { type: Number, required: true },
    bookingDate: { type: String, required: true },
    bookingTime: { type: String, required: true },
    status: { type: String, default: "confirmed" },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
