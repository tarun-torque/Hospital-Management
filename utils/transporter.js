import nodemailer from 'nodemailer'
import 'dotenv/config'

 const transporter = nodemailer.createTransport({
    service:'gmail',
    secure:true,
    port:465,
    auth:{
        user:process.env.ADMIN_EMAIL,
        pass:process.env.EMAIL_PASSWORD
    }
})

export default transporter
