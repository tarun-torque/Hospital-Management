import admin from 'firebase-admin'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
import { channel } from 'diagnostics_channel';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');
const serviceAccount = JSON.parse(await fs.promises.readFile(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export const testFirbase  = async(req,res)=>{
    try {
        const message = {
            notification: {
                title: 'Testing !!!!',
                body: 'Firebase Admin SDK is properly initialized.',
            },
            token: 'eOrchMfsTuSHMUidKneYrz:APA91bG1kS3UXb37X4V0dqIZBTWyLfq-cURTJa_3PAeaO2IiLZ4zADF3ZxyiCrN63t99Ig2ksQfPUJOY4HyQmcVSG-5Eg1rOh2MJiyeIJ9mVN-zc63fRoM67tqfJd8Fzk_OL0vtLoghz', // Replace with a valid device token
        };
        const response = await admin.messaging().send(message);
        console.log('Test message sent successfully:', response);
        res.status(200).json({ message: 'Firebase test message sent successfully.', response });
    } catch (error) {
        console.error('Error sending test message:', error);
        res.status(500).json({ message: 'Error sending test message.', error });
    }
}

export async function toDoctor(title,body,channelName,token){
        try {
            const message = {
                notification: {
                    title,
                    body,
                },
                data:{
                     channelName
                },
                token
            };
            const response = await admin.messaging().send(message);
            console.log('Test message sent successfully:', response);
        } catch (error) {
            console.error('Error sending test message:', error);
        }
}
