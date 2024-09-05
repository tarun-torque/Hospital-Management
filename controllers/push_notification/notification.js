import admin from 'firebase-admin'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');
const serviceAccount = JSON.parse(await fs.promises.readFile(serviceAccountPath, 'utf8'));


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});



// Function to send push notification
const sendNotification = async (tokens, title, body, data = {}) => {
    const message = {
        notification: {
            title,
            body,
        },
        data,
        tokens, // FCM will send to all these tokens
    };

    try {
        const response = await admin.messaging().sendMulticast(message);
        console.log('Successfully sent message:', response);
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};



// register notification
const registerNotificationToken = async(req,res)=>{
    const { userId, token, userType } = req.body; 

    if (!userId || !token || !userType) {
        return res.status(400).json({ message: 'userId, token, and userType are required.' });
    }

    try {
        if (userType === 'doctor') {
            await prisma.deviceToken.create({
                data: {
                    token,
                    doctorId: userId,
                },
            });
        } else if (userType === 'patient') {
            await prisma.deviceToken.create({
                data: {
                    token,
                    patientId: userId,
                },
            });
        }
        res.status(200).json({ message: 'Token registered successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering token.' });
    }
}


// send notifications to doctor or patients
export const sendNotificationsPatientDoctor = async(req,res)=>{
    const { userId, userType, title, body, data } = req.body;

    if (!userId || !userType || !title || !body) {
        return res.status(400).json({ message: 'userId, userType, title, and body are required.' });
    }
    
    try {
        let tokens = [];

        if (userType === 'doctor') {
            const doctor = await prisma.doctor.findUnique({
                where: { id: userId },
                include: { deviceTokens: true },
            });
            tokens = doctor.deviceTokens.map(dt => dt.token);
        } else if (userType === 'patient') {
            const patient = await prisma.patient.findUnique({
                where: { id: userId },
                include: { deviceTokens: true },
            });
            tokens = patient.deviceTokens.map(dt => dt.token);
        }

        if (tokens.length === 0) {
            return res.status(404).json({ message: 'No device tokens found for the user.' });
        }

        const response = await sendNotification(tokens, title, body, data);
        res.status(200).json({ message: 'Notification sent successfully.', response });
    } catch (error) {
        res.status(500).json({ message: 'Error sending notification.', error });
    }
}


export const testFirbase  = async(req,res)=>{
    try {
        const message = {
            notification: {
                title: 'Testing !!!!',
                body: 'Firebase Admin SDK is properly initialized.',
            },
            token: 'c_ud1WzKRXOBhaZ9S11WuF:APA91bGSofhwfpXkpQSBadt2HJZIkragKRehku7SzhWNz7ij5oLa334BnnWUo5MxL8YgQwiGTiYuTiQBamsMFpLSrwMh2isIlxu8Yov0iE_3nX3jQ9cILN75bmsLCeYSvLrd0Iv7FYa-', // Replace with a valid device token
        };
    
        const response = await admin.messaging().send(message);
        console.log('Test message sent successfully:', response);
        res.status(200).json({ message: 'Firebase test message sent successfully.', response });
    } catch (error) {
        console.error('Error sending test message:', error);
        res.status(500).json({ message: 'Error sending test message.', error });
    }
}



export async function toDoctor(title,body){
        try {
            const message = {
                notification: {
                    title,
                    body,
                },
                token: 'fUKE6JUSTUmsfa-72dPsST:APA91bF-cQDEY1XljcKkbt7PaP38mfIAYR0guk-uJ9cWb_fKuGBBq_npPj8s0uCC0VgBCKT5WGvgqOFI96fClvcZRj_e0NgegCCCX5BlFBHb2f_gtWsCwXeR8KRjv1IjhxhepldUKfaK', // Replace with a valid device token
            };
        
            const response = await admin.messaging().send(message);
            console.log('Test message sent successfully:', response);
            // res.status(200).json({ message: 'Firebase test message sent successfully.', response });
        } catch (error) {
            console.error('Error sending test message:', error);
            // res.status(500).json({ message: 'Error sending test message.', error });
        }
    
}

