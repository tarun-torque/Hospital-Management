import crons from 'node-cron';
import prisma from '../../DB/db.config.js';
import { doctorReminder, patientReminder } from '../push_notification/notification.js';

export const reminderAutomate = crons.schedule('* * * * *', async () => {
    const now = new Date();
    console.log("current time is",now)
    const tenMinutesLater = new Date(now.getTime() + 10 * 60000);
    
    try {
        const upcomingBookings = await prisma.booking.findMany({
            where: {
                slotStart: {
                    gte: now,
                    lte: tenMinutesLater
                }
            }
        });

        if (upcomingBookings.length > 0) {
            for (const session of upcomingBookings) {
                const { patientId, doctorId, channelName, id: bookingId } = session;

                const findDoctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
                const doctorFcmToken = findDoctor?.fcmToken; // Use optional chaining to avoid errors

                const findPatient = await prisma.patientGoogleSingIn.findUnique({ where: { id: patientId } });
                const patientFcmToken = findPatient?.fcmToken; // Use optional chaining to avoid errors

                if (doctorFcmToken) {
                    await doctorReminder(doctorFcmToken);
                } else {
                    console.log(`No FCM token found for doctor ID: ${doctorId}`);
                }

                if (patientFcmToken) {
                    await patientReminder(doctorId, bookingId, channelName, patientFcmToken);
                } else {
                    console.log(`No FCM token found for patient ID: ${patientId}`);
                }

                console.log("Reminder notification sent for both patient and doctor");
            }
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});
