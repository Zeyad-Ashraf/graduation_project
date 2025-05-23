import * as bookingRepo from "../repo/bookingRepo.js";


export const bookSlot = async (patientId, scheduleId, slotId, next) => {
    const schedule = await bookingRepo.findScheduleById(scheduleId);
    if (!schedule) return next(new Error("Schedule not found" , {cause : 404}));

    const slot = schedule.slots.id(slotId);
    if (!slot || slot.status !== "available") throw new Error("Slot not available");

    await bookingRepo.updateSlotStatus(scheduleId, slotId, {
        status: "pending",
        patientId,
        isBooked: true
    });

    const booking = await bookingRepo.createBooking({
        patientId,
        doctorId: schedule.doctorId,
        scheduleId,
        slotId
    });

    return booking;
};

export const respondToBooking = async (bookingId, doctorId, accept, next) => {
    const booking = await bookingRepo.updateBookingStatus(bookingId, accept ? "confirmed" : "rejected");
    if (!booking || booking.doctorId.toString() !== doctorId) return next(new Error("Unauthorized or booking not found" , {cause : 404}))

    const status = accept ? "confirmed" : "available";
    const updates = { status, isBooked: accept, patientId: accept ? booking.patientId : null };
    await bookingRepo.updateSlotStatus(booking.scheduleId, booking.slotId, updates);

    return booking;
};

export const getAvailableSlots = async (doctorId) => {
    const schedules = await bookingRepo.findAvailableSlots(doctorId);
    return schedules.map(schedule => ({
        scheduleId: schedule._id,
        day: schedule.day,
        date: schedule.date,
        slots: schedule.slots.filter(slot => slot.status === "available")
    }));
};