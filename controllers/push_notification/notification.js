import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import prisma from '../../DB/db.config.js';
import { title } from 'process';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account keys for both apps
const serviceAccountPathDoctor = path.resolve(__dirname, './serviceAccountKeyDoctorApp.json');
const serviceAccountDoctor = JSON.parse(await fs.promises.readFile(serviceAccountPathDoctor, 'utf8'));

const serviceAccountPathPatient = path.resolve(__dirname, './serviceAccountKeyPatientApp.json');
const serviceAccountPatient = JSON.parse(await fs.promises.readFile(serviceAccountPathPatient, 'utf8'));

// Initialize the doctor and patient app
const doctorApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountDoctor)
}, 'doctorApp')

const patientApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPatient)
}, 'patientApp')



// testing for doctor
export const testFirebase = async (req, res) => {
    try {
        const message = {
            notification: {
                title: 'Testing !!!!',
                body: 'Firebase Admin SDK is properly initialized.',
            },
            token: 'eOrchMfsTuSHMUidKneYrz:APA91bG1kS3UXb37X4V0dqIZBTWyLfq-cURTJa_3PAeaO2IiLZ4zADF3ZxyiCrN63t99Ig2ksQfPUJOY4HyQmcVSG-5Eg1rOh2MJiyeIJ9mVN-zc63fRoM67tqfJd8Fzk_OL0vtLoghz', // Use a valid token here
        };
        const response = await doctorApp.messaging().send(message);
        console.log('Test message sent successfully:', response);
        res.status(200).json({ message: 'Firebase test message sent successfully.', response });
    } catch (error) {
        console.error('Error sending test message:', error);
        res.status(500).json({ message: 'Error sending test message.', error });
    }
}

// Function to send notification to doctor
export async function toDoctor(title, body, channelName, token) {
    try {
        const message = {
            notification: {
                title,
                body,
            },
            data: {
                channelName,
            },
            token,
        }
        const response = await doctorApp.messaging().send(message);
        console.log('Doctor message sent successfully:', response);
    } catch (error) {
        console.error('Error sending message to doctor:', error);
    }
}

// Function to send test notification to the patient
export const testFirebasePatient = async (req, res) => {
    try {
        const message = {
            notification: {
                title: 'Patient Alert !!!!',
                body: 'This is a test message for patients.',
            },
            token: 'fisJbvnERmy00_ypGwqklq:APA91bEaCKjhM6y38EkKC2O23l4tltnSoVgYks9-UhsWDfNtLSi_kB5uK-mn11Pk_J4d519OymAnYsbLYGhxfQ3LgirJUX6uR1QF-nm6hHogqoqVkplPOD-I44WoqhAh9-A8hSFAhmFF',
        }
        const response = await patientApp.messaging().send(message);
        console.log('Test patient message sent successfully:', response);
        res.status(200).json({ message: 'Firebase test patient message sent successfully.', response });
    } catch (error) {
        console.error('Error sending test patient message:', error);
        res.status(500).json({ message: 'Error sending test patient message.', error });
    }
}

// send notification to the patient to doctor when doctor start video call
export const patientVideoCallStart = async (req, res) => {
    const patientId = +req.params.patientId
    const bookingId = +req.params.bookingId
    try {
        // find fcmToken 
        const patient = await prisma.patient.findUnique({ where: { id: patientId } })
        const getChannel = await prisma.booking.findUnique({ where: { id: bookingId } })
        const findDoctorName = await prisma.doctor.findUnique({where:{id:getChannel.doctorId}})

        const message = {
            notification: {
                title: `${findDoctorName.doctorName}`,
                body: 'Incomming video call'
            },
            data: {
                type: 'calling',
                channelName: getChannel.channelName,
                doctorId: String(getChannel.doctorId),
                bookId: String(bookingId)
            },
            token: patient.fcmToken
        }
        const response = await patientApp.messaging().send(message)
        res.status(200).json({ status: '200', msg: 'Notification sent successfully' })
        console.log('Notification of starting video call is sent:', response);
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

// reminder for doctor
export const doctorReminder = async (doctorFcmToken) => {
    try {
        const message = {
            notification: {
                title: 'Upcoming Session Reminder',
                body: 'Your session starts in 10 minutes'
            },
            data: {
                type: 'calling'
            },
            token: doctorFcmToken
        }
        const response = await doctorApp.messaging().send(message)
        console.log('reminder of doctor sent', response)
    }
    catch (error) {
        console.log(error)
        // res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

export const patientReminder = async (doctorId, bookingId, channelName, patinetFcmToken) => {
    try {
        const message = {
            notification: {
                title: 'Upcoming Session Reminder',
                body: 'Your session starts in 10 minutes'
            },
            data: {
                doctorId: String(doctorId),
                bookingId: String(bookingId), 
                channelName: String(channelName),
                type: 'calling'
            },
            token: patinetFcmToken
        }
        const response = await patientApp.messaging().send(message)
        console.log('remider for patient sent', response)
    } catch (error) {
        console.log(error)
        // res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}


export const patinetDeclineVideoCall = async (req, res) => {
    const doctorId = +req.params.doctorId
    try {
        const isDocotor = await prisma.doctor.findUnique({ where: { id: doctorId } })
        const fcmToken = isDocotor.fcmToken
        const message = {
            notification: {
                title: 'Call Rejected',
                body: 'The patient has rejected the call.'
            },
            data: {
                type: 'reject'
            },
            token: fcmToken
        }
        const response  = await doctorApp.messaging().send(message)
        console.log("decline noti send")
        res.status(200).json({status:200,msg:'Patient reject the call successfully'})
    } catch (error) {
        res.status(500).json({status:500,msg:'Something went wrong'})
        console.log(error)
    }
}