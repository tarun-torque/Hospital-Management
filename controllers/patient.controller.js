import prisma from "../DB/db.config.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import transporter from "../utils/transporter.js";
import path from 'path'
import { fileURLToPath, parse } from 'url';
import { dirname, join } from 'path';
import exp from "constants";
import { title } from "process";
import { consultants } from "./admin.controller.js";
import { assert } from "console";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getBookingOfPatient = async (req, res) => {
    const patientId = +req.params.patientId
    try {
        const appointment = await prisma.booking.findMany({
            where: { patientId },
            include: { Doctor: true },
            orderBy: [
                { slotStart: 'asc' },
                { slotEnd: 'asc' }
            ]
        })
        const appointmentCount = appointment.length
        if (appointment.length === 0) {
            return res.status(400).json({ status: 400, msg: 'No Appointment' })
        }

        res.status(200).json({ status: 200, appointmentCount, appointment })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}




// to add journal patient journal 
export const patientJournal = async (req, res) => {
    const patientId = +req.params.patientId
    const { title, description } = req.body;
    try {
        if (!title) {
            return res.status(400).json({ status: 400, msg: 'Title is required' })
        }
        if (!description) {
            return res.status(400).json({ status: 400, msg: 'Description is required' })
        }

        const saveJournal = await prisma.journal.create({ data: { patientId, title, description } })
        res.status(201).json({ status: 201, msg: 'Journal is added' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

// to update journal
export const updateJounal = async (req, res) => {
    const journalId = req.params.journalId
    const { title, description } = req.body
    try {
        const updatedData = {}
        if (title) {
            updatedData.title = title
        }
        if (description) {
            updatedData.description = description
        }

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ status: 400, msg: 'No fields to update' });
        }

        const updateJounal = await prisma.journal.update({ where: { id: journalId }, data: updatedData })
        res.status(200).json({ status: 200, msg: 'Journal Updated Successfully' });

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

// to delete journal 
export const deleteJournal = async (req, res) => {
    const journalId = +req.params.journalId
    try {
        const deleteJournal = await prisma.journal.delete({ where: { id: journalId } })
        if (!deleteJournal) {
            return res.status(400).json({ status: 400, msg: 'Journal does not exist' })
        }
        res.status(200).json({ status: 200, msg: 'Journal deleted Successfully' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

// get all patient specific journal
export const patientJournalAll = async (req, res) => {
    const patientId = + req.params.patientId
    try {
        const journal = await prisma.journal.findMany({ where: { patientId } })

        if (journal.length === 0) {
            return res.status(404).json({ status: 404, msg: 'No Journal found' })
        }
        res.status(200).json({ status: 200, journal })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })

    }
}




//rating to the doctor 
export const giveRatingToDoctor = async (req, res) => {
    const bookingId = +req.params.bookingId
    const patientId = +req.params.patientId
    const doctorId = +req.params.doctorId
    const { stars, review } = req.body

    try {

        if (!stars) {
            return res.status(400).json({ status: 400, msg: 'Please give rating first' })
        }

        if (!(stars > 1 || stars <= 5)) {
            return res.status(400).json({ status: 400, msg: 'Give stars between 1 to 5' })
        }

        const existingRating = await prisma.rating.findUnique({
            where: {
                bookingId_patientId_doctorId: {
                    bookingId,
                    patientId,
                    doctorId
                }
            }
        })

        if (existingRating) {
            return res.status(400).json({ status: 400, msg: 'You have already rated' });
        }

        const rating = await prisma.rating.create({
            data: {
                patientId,
                doctorId,
                bookingId,
                stars,
                review
            }
        })

        // send notification for manager
        // find assigned manager id of doctor
        const patient = await prisma.patient.findUnique({ where: { id: patientId } })
        const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } })
        const findManager = await prisma.manager.findUnique({ where: { username: doctor.assignedManager } })
        const sendNotification = await prisma.managerNotification.create({
            data: {
                managerId: findManager.id,
                title: `${patient.patientName} rated Consultant ${doctor.doctorName} with ${stars} stars`,
                content: `${patient.patientName} commented: "${review}"`,
                data: JSON.stringify({
                    doctorId: doctorId,
                    patientId: patientId,
                    bookingId: bookingId,
                    patientProfilePath: patient.profileUrl,
                })
            }
        })

        res.status(201).json({ status: 201, msg: 'Thanks for giving rating' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}



// signIn patient from google
export const signInPatientFromGoogle = async (req, res) => {
    const { patientName, email, profileUrl, fcmToken } = req.body;
    try {
        const requiredFields = ['patientName', 'email', 'fcmToken'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ status: 400, msg: `${field} is required` });
            }
        }

        let patient = await prisma.patient.findUnique({ where: { email } });

        const data = { patientName, email, profileUrl, fcmToken }
        if (patient) {
            const updatePatient = await prisma.patient.update({
                where: { email },
                data: { fcmToken }
            })
            const token = jwt.sign({ token: updatePatient }, process.env.SECRET_KEY, { expiresIn: '999h' });
            return res.status(200).json({ status: 200, msg: 'Token refreshed', token });
        } else {
            const saveDoctor = await prisma.patient.create({ data });
            const newToken = jwt.sign({ token: saveDoctor }, process.env.SECRET_KEY, { expiresIn: '999h' })
            return res.status(201).json({ status: 201, msg: 'Profile created successfully', token: newToken });
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: error.message });
    }
}

export const getPatientProfile = async (req, res) => {
    const patientId = +req.params.patientId;
    try {
        if (!patientId) {
            return res.status(400).json({ status: 400, msg: 'PatientId id is required' })
        }
        const profile = await prisma.patient.findUnique({ where: { id: patientId } })
        res.status(200).json({ status: 200, msg: profile })
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Something went wrong' })
    }
}


// verify email
// -------- sent email
export const verifyPatientEmail = async (req, res, next) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ msg: 'Email is required' });
        }

        const isEmail = await prisma.patient.findUnique({ where: { email } });
        if (isEmail) {
            return res.status(400).json({ msg: 'Email is already present' });
        }

        const otpNumber = Math.floor(100000 + Math.random() * 900000).toString();
        const otpToken = jwt.sign({ otpNumber }, process.env.SECRET_KEY, { expiresIn: '2m' });


        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: 'Your One-Time Password (OTP) for Verification',
            html: `
                <p>Hello</p>
                <p>Thank you for signing up. Please use the following OTP to verify your email address. This OTP is valid for 2 minutes.</p>
                <h3>${otpNumber}</h3>
                <p>If you did not request this, please contact our support team immediately at support@example.com.</p>
                <p><a href="https://phoenix-sage.vercel.app/">Visit Our website</a></p>
                <p>Follow us on Social Media:<br/>
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
        };


        const mailSent = transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                return res.status(400).json({ msg: 'OTP not sent' })
            } else {
                return res.status(200).json({ msg: 'OTP sent check your Email' })
            }
        });

    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};


// verify otp
export const verifyPatientOTP = async (req, res, next) => {
    const email = req.query
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({ msg: 'OTP is required' });
        }

        const retrieveOtp = await prisma.patient.findUnique({ where: { email } });

        const realOtp = retrieveOtp.otp;
        const payload = jwt.verify(realOtp, process.env.SECRET_KEY);

        if (payload.otpNumber === otp) {
            return res.status(200).json({ msg: 'Email is verified' });

        } else {
            return res.status(400).json({ msg: 'OTP is invalid or expired' });
        }
    } catch (error) {

        return res.status(400).json({ msg: 'Something went wrong' });
    }
};


// register patient
export const registerPatient = async (req, res) => {
    try {

        const { username, patient_name, country, contact_number, dob, gender, new_patient, password } = req.body
        const fileInfo = req.file;
        const email = req.params.email

        const requiredField = ['username', 'patient_name', 'country', 'contact_number', 'dob', 'gender', 'new_patient', 'password']
        for (const field of requiredField) {
            if (req.body[field] === undefined || req.body[field] === '' || req.body === null) {
                return res.status(400).json({ msg: `${field} is required` })
            }
        }

        const fileType = fileInfo.mimetype == 'image/jpeg' || fileInfo.mimetype == 'image/png'
        const fileSize = fileInfo.size / (1024 * 1024) <= 2


        if (!fileType || !fileSize) {
            return res.status(400).json({ msg: 'File size must be less than 2 MB and PNG or JPG type' })
        }

        // hash password 
        const salt = bcrypt.genSaltSync(10)
        const hash_pass = bcrypt.hashSync(password, salt)

        const data = { username, patient_name, country, contact_number, dob, gender, new_patient, password: hash_pass, profile_path: fileInfo.path, profileType: fileInfo.mimetype }
        const saveData = await prisma.patient.update({ where: { email }, data: { data } })

        res.send("saved")

    } catch (error) {
        res.status(400).json({ msg: error.message })
    }
}



// login patient 
export const loginPatient = async (req, res) => {
    try {
        // get data
        const { email, password, fcmToken } = req.body;

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
        const data = { id: isEmail.id, username: isEmail.username, patientName: isEmail.patientName, profile_path: isEmail.profileUrl }
        const updateFcm = await prisma.patient.update({ where: { email }, data: { fcmToken } })
        const token = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: '999h' })
        res.status(200).json({ status: 200, msg: 'LoggedIn', token, id: isEmail.id })

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
        if (!isPatient) {
            return res.status(404).json({ msg: "User not Found" })
        }

        // otp
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpToken = jwt.sign({ otp }, process.env.SECRET_KEY, { expiresIn: '2m' })

        // store otp in db
        const saveOtp = await prisma.patient.update({ where: { email }, data: { otp: otpToken } })

        // send OTP via mail
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${email}`,
            subject: 'OTP to reset Password',
            html:
                `
            Dear ${isPatient.patientName},

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

// reset patient password  
export const patientVerifyForgotOtp = async (req, res) => {
    const { otp, email } = req.body
    try {
        if (!otp) {
            return res.status(400).json({ status: 400, msg: 'OTP is required' })
        }

        const checkOtp = await prisma.patient.findUnique({ where: { email } })

        if (!checkOtp) {
            return res.status(400).json({ status: 400, msg: 'Invalid Email or OTP' })
        }

        if (checkOtp.otp === null) {
            return res.status(400).json({ status: 400, msg: 'Invalid Email or OTP' })
        }

        // verify otp
        const decodedOtp = jwt.verify(checkOtp.otp, process.env.SECRET_KEY)

        if (decodedOtp.otp !== otp) {
            return res.status(400).json({ status: 400, msg: 'OTP is Invalid or expired' })
        }

        res.status(200).json({ status: 200, msg: 'OTP verified  successful' })

    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired OTP' })
        console.log(error)
    }
}

// patient reset password
export const resetPatientPassword = async (req, res) => {
    const { newPassword, email } = req.body
    try {
        if (!newPassword) {
            return res.status(400).json({ status: 200, msg: 'New Password is required' })
        }
        //  hash password 
        const salt = bcrypt.genSaltSync(10)
        const hash_pass = bcrypt.hashSync(newPassword, salt)
        const updatePswd = await prisma.patient.update({ where: { email }, data: { password: hash_pass } })
        res.status(200).json({ status: 200, msg: 'Password reset Succesfully' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}





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
        const { mood, note, factor } = req.body
        // save in db 
        const info = await prisma.mood.create({ data: { mood, note, factor, patientId } })
        // send succesfull note 
        res.status(201).json({ status: 201, msg: 'Your mood saved' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: error.message })
    }
}
// get mood patient
export const get_mood = async (req, res) => {
    try {
        const patientId = +req.params.patientId
        const isPatient = await prisma.mood.findFirst({ where: { patientId } })
        if (!isPatient) {
            return res.status(404).json({ status: 404, msg: 'Patient is not found' })
        }
        const mood = await prisma.mood.findMany({ where: { patientId } })
        if (mood.length === 0) {
            return res.status(404).json({ status: 404, msg: 'No mood is post by the patient till now' })
        }
        res.status(200).json({ status: 200, mood })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: error.message })
    }
}

// resheduling the session 
export const rescheduleBooking = async (req, res) => {
    const { newStartTime, newEndTime } = req.body
    const bookingId = +req.params.bookingId
    console.log("rescheduling time from frontend", newStartTime, newEndTime)
    try {
        const slotStartTime = new Date(new Date(newStartTime).getTime() - 5.5 * 60 * 60 * 1000)
        const slotEndTime = new Date(new Date(newEndTime).getTime() - 5.5 * 60 * 60 * 1000)
        console.log("rescheduling time after adjust ", slotStartTime, slotEndTime)
        const slotStartTimeISO = new Date(newStartTime).toISOString()
        const slotEndTimeISO = new Date(newEndTime).toISOString()

        console.log("rescheduling after iso saved in DB", slotStartTimeISO, slotEndTimeISO)

        const existingBooking = await prisma.booking.findUnique({
            where: { id: bookingId },
        })

        const doctorId = existingBooking.doctorId
        const patientId = existingBooking.patientId

        if (!existingBooking) {
            return res.status(404).json({ status: 404, msg: 'Booking not found' });
        }

        const isSlotAvailable = await prisma.availableSlots.findUnique({
            where: {
                doctorId_startTime_endTime: {
                    doctorId,
                    startTime: slotStartTimeISO,
                    endTime:slotEndTimeISO,
                },
            },
        })

        if (!isSlotAvailable || isSlotAvailable.isBooked === "yes") {
            return res.status(400).json({ status: 400, msg: 'New time slot is not available' });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                slotStart: slotStartTimeISO,
                slotEnd:slotEndTimeISO,
            },
        })

        res.status(200).json({
            status: 200,
            msg: 'Booking rescheduled successfully',
            booking: updatedBooking,
        })

    } catch (error) {
        console.error('Error occurred while rescheduling booking:', error);
        res.status(500).json({ status: 500, msg: 'Something went wrong' });
    }
}

// update patient profile
export const updatePatientProfile = async (req, res) => {
    const patientId = +req.params.patientId
    const fileInfo = req.file
    const { contactNumber } = req.body
    try {

        const updatedData = {}
        if (contactNumber) {
            updatedData.contactNumber = contactNumber
        }

        if (fileInfo) {

            const fileType = fileInfo.mimetype
            const fileSizeMB = fileInfo.size / (1024 * 1024)
            const isImage = (fileType === 'image/jpeg' || fileType === 'image/png') && fileSizeMB <= 2
            if (!isImage) {
                return res.status(400).json({
                    status: 400,
                    msg: 'Profile Image must  be a JPG or PNG image and size must be less than 2MB',
                })
            }
            updatedData.profileUrl = fileInfo.path
        }

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ status: 400, msg: 'No fields to update' })
        }
        const update = await prisma.patient.update({ where: { id: patientId }, data: updatedData })
        res.status(200).json({ status: 200, msg: 'Profile  is updated Succesfully' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

// patient dashboard stats
export const patientDashboardStats = async (req, res) => {
    const patientId = +req.params.patientId
    try {
        // total consultant
        const consultant = await prisma.doctor.findMany({ where: { verified: 'yes' } })
        const consultantsCount = consultant.length
        // total services
        const service = await prisma.service.findMany()
        const servicesCount = service.length
        // meeting till now
        const meeting = await prisma.booking.findMany({ where: { patientId, isCompleted: 'yes' } })
        const meetingsTillNowCount = meeting.length
        res.status(200).json({ status: 200, consultantsCount, servicesCount, meetingsTillNowCount })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}


// patient upcomming session 
export const patientUpcomingSessions = async (req, res) => {
    const patientId = +req.params.patientId;
    try {
        const upcomingSessions = await prisma.booking.findMany({
            where: { patientId, isCompleted: 'no' },
        });

        const serviceIds = upcomingSessions.map(session => session.serviceId);
        const doctorIds = upcomingSessions.map(session => session.doctorId);

    
        const services = await prisma.service.findMany({
            where: { id: { in: serviceIds } },
            select: { id: true, title: true },
        });

    
        const doctors = await prisma.doctor.findMany({
            where: { id: { in: doctorIds } },
            select: { id: true, doctorName: true, profileUrl: true },
        });

   
        const serviceMap = services.reduce((map, service) => {
            map[service.id] = service.title;
            return map;
        }, {});

        const doctorMap = doctors.reduce((map, doctor) => {
            map[doctor.id] = {
                doctorName: doctor.doctorName,
                doctorProfile: doctor.profileUrl, 
            };
            return map;
        }, {});

    
        const sessionsWithDetails = upcomingSessions.map(session => ({
            id: session.id,
            patientId: session.patientId,
            doctorId: session.doctorId,
            slotStart: session.slotStart,
            slotEnd: session.slotEnd,
            channelName: session.channelName,
            notes: session.notes,
            isCompleted: session.isCompleted,
            notified: session.notified,
            serviceTitle: serviceMap[session.serviceId], 
            doctorName: doctorMap[session.doctorId]?.doctorName, 
            doctorProfile: doctorMap[session.doctorId]?.doctorProfile,
        }));

        res.status(200).json({ status: 200, sessions: sessionsWithDetails });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, msg: 'Something went wrong' });
    }
}


// patient session history
export const patientSessionHistory = async (req, res) => {
    const patientId = +req.params.patientId;
    try {
        const bookings = await prisma.booking.findMany({ where: { patientId,isCompleted:'yes' } });

        if (bookings.length === 0) {
            return res.status(404).json({ status: 404, msg: 'No bookings found for this patient' });
        }

        const sessionHistories = await Promise.all(bookings.map(async (booking) => {
            const doctor = await prisma.doctor.findUnique({ where: { id: booking.doctorId } });
            const service = await prisma.service.findUnique({ where: { id: booking.serviceId } });
            const rating = await prisma.rating.findUnique({ 
                where: { bookingId_patientId_doctorId: { bookingId: booking.id, patientId, doctorId: booking.doctorId } }
            });

            return {
                doctorName: doctor.doctorName,
                doctorImageUrl: doctor.profileUrl,
                gender: doctor.gender,
                serviceName:service.title,
                price: service.price,
                dateAndTime: booking.slotStart,
                stars: rating?.stars || null,
                review: rating?.review || null
            };
        }));

        res.status(200).json({
            status: 200,
            sessionHistories
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, msg: 'Something went wrong' });
    }
};
