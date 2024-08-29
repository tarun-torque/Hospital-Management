import prisma from "../DB/db.config.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import transporter from "../utils/transporter.js";
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// register patient 
export const registerPatient = async (req, res) => {
    try {

        // get fields
        const { username, patient_name, email, country, contact_number, dob, gender, new_patient, password } = req.body;
        const fileInfo = req.file;

        // check patient is present or not
        const isUsername = await prisma.patient.findUnique({ where: { username } })
        if (isUsername) {
            return res.status(409).json({ message: `Username ${username} is not available` })
        }
        const isEmail = await prisma.patient.findUnique({ where: { email } })
        if (isEmail) {
            return res.status(409).json({ message: `Email ${email} is already registered` })
        }

        // validate file
        const isFile = (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpg') && ((req.file.size) / 1024 * 1024 <= 20)
        if (isFile) {
            return res.send(400).json({ message: 'Profile Picture must be png/jpg and size less than 2MB' })
        }
        // hash password
        const salt = bcrypt.genSaltSync(10)
        const hash_pass = bcrypt.hashSync(password, salt)
        // create data object 
        const data = {
            username,
            password: hash_pass,
            email,
            gender,
            patient_name,
            country,
            contact_number,
            dob,
            new_patient,
            profile_path: req.file.path,
            profileType: req.file.mimetype
        }
        // save info. in db
        const info = await prisma.patient.create({ data })
        // generate token
        const forClient =
        {
            id: info.id,
            username,
            patient_name,
            profile_path: info.profile_path
        }
        const token = jwt.sign(forClient, process.env.SECRET_KEY, { expiresIn: '999h' })
        res.status(201).json({ message: 'Patient Profile is created', token })
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })
    }

}


// login patient 
export const loginPatient = async (req, res) => {
    try {
        // get data
        const { email, password } = req.body;

        // check email and password
        const isEmail = await prisma.patient.findUnique({ where: { email } })
        if (!isEmail) {
            return res.status(404).json({ message: 'Invalid Credentials' })
        }
        const isPassword = bcrypt.compareSync(password, isEmail.password)
        if (!isPassword) {
            return res.status(404).json({ message: 'Invalid Credentials' })
        }

        //generate token
        const data = { id: isEmail.id, username: isEmail.username, patient_name: isEmail.patient_name, profile_path: isEmail.profile_path }
        const token = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: '999h' })
        res.status(200).json({ message: 'LoggedIn', token })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })
    }

}

// ////// forgot password implementation
// ------ send otp
export const otpSend = async (req, res) => {
    try {

        const { email } = req.body;

        const isPatient = await prisma.patient.findUnique({ where: { email } })

        if(! isPatient){
            return res.status(404).json({msg:"User not Found"})
        }

        // otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpToken = jwt.sign({ otp }, process.env.SECRET_KEY, { expiresIn: '2m' })

        // store otp in db
        const saveOtp = await prisma.patient.update({ where: { email }, data: { otp:otpToken} })

        // send OTP via mail
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${email}`,
            subject: 'OTP to reset Password',
            html:
                `
            Dear ${isPatient.patient_name},

            <p>We received a request to change your password.To proceed, please use the One-Time Password (OTP) provided below. </p>

            <h3>Your OTP is ${otp}</h3>

            <p>This OTP is valid for the next 2 minutes. Please do not share this OTP with anyone, as it is for your personal use only.</p>

            <p>If you did not request, please contact our support team immediately at @example.com.</p>

             <p><a href="https://phoenix-sage.vercel.app/">Visit Our website</strong></a></p>

                      <p>Follow us on Social Meadia :<br/>
                     <img src="cid:insta" alt="insta icon" style="width: 30px; height: 30px;" />
                      <img src="cid:fb" alt="fb icon" style="width:30px; height:30px" />
                      <img src="cid:yt" alt="yt icon" style="width:30px; height:30px" />
                          </p>
                      <p>Best regards,<br>Kanika Jindal<br>Founder<br>example@gmail.com</p>

            `,
            attachments: [
                {
                    filename: 'insta_logo.png',
                    path: path.join(__dirname, 'attachements', 'insta_logo.png'),
                    cid: 'insta'
                },
                {
                    filename: 'fb_logo.png',
                    path: path.join(__dirname, 'attachements', 'fb_logo.png'),
                    cid: 'fb'
                },
                {
                    filename: 'yt_logo.png',
                    path: path.join(__dirname, 'attachements', 'yt_logo.jpeg'),
                    cid: 'yt'
                }
            ]

        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).json({ msg: 'OTP not Sent' })
            }
            else {
                res.status(200).json({ msg: 'OTP sent Successfully' })
            }
        })

    } catch (error) {
        res.status(400).json({ message: 'Something went wromg' })
        console.log(error)
    }
}

// reset password succesfully 
export const resetPassword = async(req,res)=>{
    try {

        const {otp,email,newPassword} = req.body;

        const checkOtp =  await prisma.patient.findUnique({where:{email}})

        if(!checkOtp){
            return res.status(400).json({msg:'Invalid Email or OTP'})
        }

        if(checkOtp.otp === null){
            return res.status(400).json({msg:'Invalid Email or OTP'})
        }

        // verify otp
        const decodedOtp = jwt.verify(checkOtp.otp,process.env.SECRET_KEY)

        if(decodedOtp.otp !== otp){
            return res.status(400).json({msg:'Invalid OTP'}) 
        }

        // hash password
        const salt  = bcrypt.genSaltSync(10)
        const hash_pass = bcrypt.hashSync(newPassword,salt)

        // update password in database 
        const updatePassword  = await prisma.patient.update({where:{email},data:{password:hash_pass}})
 
        res.status(200).json({msg:'Password reset successful'})
     
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired OTP' })
        console.log(error) 
    }
}



// update patient profile



//delete patient profile




// post support
export const post_support = async (req, res) => {
    try {
        // get patient id and description
        const patientId = +req.params.patientId
        const { title, description } = req.body

        // check patient is present or not
        const isPatient = await prisma.patient.findUnique({ where: { id: patientId } })
        if (!isPatient) {
            return res.status(404).json({ message: 'Patient is not found' })
        }
        // save in db
        const data = { patientId: patientId, title, description }
        const info = await prisma.support.create({ data })
        res.status(201).json({ message: 'Thanks for the support' })
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })
    }
}



// update support
export const update_support = async (req, res) => {
    try {
        // get info
        const patientId = +req.params.patientId
        const supportId = +req.params.supportId
        const { title, description } = req.body
        // check patient is present or not
        const isPatient = await prisma.patient.findUnique({ where: { id: patientId } })
        if (!isPatient) {
            return res.status(404).json({ message: 'Patient is not found' })
        }

        // update in db
        const info = await prisma.support.update({ where: { id: supportId, patientId }, data: { title, description } })
        res.status(200).json({ message: 'Your support updated succesfully' })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })

    }
}


// get support by Id of patient
export const get_support = async (req, res) => {

    try {
        // get patient id
        const id = +req.params.id
        // check patient
        const isPatient = await prisma.patient.findUnique({ where: { id } })
        if (!isPatient) {
            return res.status(404).json({ message: 'Patient is not found' })
        }
        // get support
        const allSupport = await prisma.patient.findMany({ where: { id }, select: { support: true } })
        if (allSupport.length == 0) {
            return res.status(404).json({ message: 'No Support' })
        }
        res.status(200).json({ allSupport })

    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error.message })
    }

}

// delete support
export const delete_support = async (req, res) => {
    try {
        const supportId = +req.params.supportId
        const isSupport = await prisma.support.findUnique({ where: { id: supportId } })
        if (!isSupport) {
            return res.status(404).json({ message: 'Support is not found' })
        }
        const delete_support = await prisma.support.delete({ where: { id: supportId } })
        res.status(200).json({ message: 'Support deleted succesfully' })
    }

    catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })

    }
}

// post mood of patient
export const mood = async (req, res) => {
    try {
        // get info
        const patientId = +req.params.patientId
        const { your_mood_today, title } = req.body;

        // check patient present or not 
        const isPatient = await prisma.patient.findUnique({ where: { patientId } })
        if (!isPatient) {
            return res.status(404).json({ message: 'Patient is not found' })
        }
        // save in db 
        const info = await prisma.mood.create({ where: { patientId }, data: { your_mood_today, title } })
        // send succesfull note 
        res.status(201).json({ message: 'Thank you' })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })

    }
}
// get mood patient
export const get_mood = async (req, res) => {
    try {
        const patientId = +req.params.patientId;
        const isPatient = await prisma.mood.findUnique({ where: { patientId } })
        if (!isPatient) {
            return res.status(404).json({ message: 'Patient is not found' })
        }

        const mood = await prisma.mood.findMany({ where: { patientId } })
        if (mood.length == 0) {
            return res.status(404).json({ message: 'No mood is post by the patient till now' })
        }
        res.status(200).json({ message: mood })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })

    }
}