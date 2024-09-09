import 'dotenv/config'
import { json } from "express";
import prisma from "../DB/db.config.js";
import { messages } from "@vinejs/vine/defaults";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import transporter from '../utils/transporter.js';
import { testFirbase, toDoctor } from './push_notification/notification.js';


//get doctor profile
export const getDoctorProfile = async(req,res)=>{
    try {
        const doctorId = +req.params.doctorId;
        const profile = await prisma.doctor.findUnique({where:{id:doctorId},include:{doctorServices:true}})
        res.status(200).json({status:200,profile})
    } catch (error) {
        console.log(error)
        res.status(500).json({status:500,msg:'Something went wrong'})
    }
}
// add service
export const addDoctorService = async (req, res) => {
    try {
      const { serviceId, doctorId } = req.body;
  
      // Validate that the doctorId and serviceId exist
      const doctor = await prisma.doctor.findUnique({ where: { id:doctorId  } });
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
  
      if (!doctor) {
        return res.status(404).json({ msg: 'Doctor not found' });
      }
  
      if (!service) {
        return res.status(404).json({ msg: 'Service not found' });
      }
  
      // Create or connect the DoctorService relation
      const doctorService = await prisma.doctorService.create({
        data: {
            doctorId,
            serviceId
        },
      });

      return res.status(201).json({status:201, message: 'Service added successfully', doctorService });
    } catch (error) {
      console.error('Error adding service:', error);
      return res.status(500).json({ status:500,msg: 'Internal server error' });
    }
  };

//   get upcoming session of doctor
export const upcomingSession = async(req,res)=>{
    try {

        const doctorId  = +req.params.doctorId;

        const upcomingSession  = await prisma.booking.findMany({where:{doctorId},include:{Patient:true}})
        if(upcomingSession.length===0){
            return res.status(400).json({status:400,msg:'No upcoming session'})
        }

        res.status(200).json({status:200,upcomingSession})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({status:500,msg:'Something went wrong'})
    }
}

// get service from its id :
export const getServiceFromId= async(req,res)=>{
    try {
        const serviceId = +req.params
        const service = await prisma.service.findUnique({where:{id:serviceId}})
        res.status(200).json({status:200,service})

    } catch (error) {
        console.log(error)
        res.status(500).json({status:500,msg:'Something went wrong'})
    }
}
  







// sign in doctor from google 
export const signInDoctorFromGoogle = async (req, res) => {
    const { username, email, profileUrl, fcmToken } = req.body;
    try {
        const requiredFields = ['username', 'email', 'fcmToken'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ status: 400, msg: `${field} is required` });
            }
        }
        let doctor = await prisma.doctor.findUnique({ where: { email } });

        const data = { username, email, profileUrl, fcmToken };
        const token = jwt.sign({ data }, process.env.SECRET_KEY, { expiresIn: '999h' })

        if (doctor) {

            await prisma.doctor.update({
                where: { email },
                data: { fcmToken }
            });
            return res.status(200).json({ status: 200, msg: 'Token refreshed', token });
        } else {
            await prisma.doctor.create({ data });
            return res.status(201).json({ status: 201, msg: 'Profile created successfully', token });
        }

    } catch (error) {
        res.status(500).json({ status: 500, msg: error.message });
    }
}

// register test for doctor
export const doctorTest = async (req, res) => {
    try {
        const { username, fcmToken, doctor_name, email, password, country, contact_number, gender, state, otp, languages, specialities, experience, maximum_education, pricePerSession } = req.body

        if (!email && !otp && !doctor_name) {
            return res.status(400).json({ status: 400, msg: 'Enter email' })
        }

        if (
            (email !== undefined && email !== null && email !== '')
            && (otp === undefined || otp === null || otp === '')
            && (doctor_name === undefined || doctor_name === null || doctor_name === '')
        ) {
            const isEmail = await prisma.doctor.findUnique({ where: { email } })
            if (isEmail) {
                await prisma.doctor.delete({ where: { email } })
                return res.status(400).json({ status: 400, msg: 'Try again' })
            }

            const otpNumber = Math.floor(100000 + Math.random() * 900000).toString();
            const otpToken = jwt.sign({ otpNumber }, process.env.SECRET_KEY, { expiresIn: '2m' })

            const saveEmail = await prisma.doctor.create({ data: { email } })
            const saveOtpToken = await prisma.doctor.update({ where: { email }, data: { otp: otpToken } })

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
            }

            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    await prisma.doctor.delete({ where: { email } })
                    return res.status(400).json({ msg: 'OTP not sent' })
                } else {
                    // await prisma.patient.update({where:{email},data:{email:null}})
                    return res.status(200).json({ msg: 'OTP sent check your Email' })
                }
            });
        }

        // verify OTP
        else if (
            (email !== undefined && email !== null && email !== '')
            && (otp !== undefined || otp !== null || otp !== '')
            && (doctor_name === undefined || doctor_name === null || doctor_name === '')
        ) {
            try {
                const findOtp = await prisma.doctor.findUnique({ where: { email } })
                const realOtp = findOtp.otp
                const decode = jwt.verify(realOtp, process.env.SECRET_KEY)


                if (decode.otpNumber == otp) {
                    await prisma.doctor.update({ where: { email }, data: { emailVerified: 'yes' } })
                    return res.status(200).json({ status: 200, msg: "Email verified" })
                }


                if (decode.otpNumber !== otp) {
                    return res.status(400).json({ status: 400, msg: 'OTP is invalid or expired' })
                }


                if (decode.otpNumber !== otp) {
                    return res.status(400).json({ status: 400, msg: 'OTP is invalid or expired' })
                }
            } catch (error) {
                return res.status(400).json({ status: 400, msg: 'OTP is invalid or expired' })
            }
        }
        // then register doctor
        else if (
            (email !== undefined || email !== null || email !== '')
            && (otp !== undefined || otp !== null || otp !== '')
            && (patient_name !== undefined)
        ) {

            const isEmailVerified = await prisma.doctor.findUnique({where:{email}})
            if(isEmailVerified.emailVerified==='no'){
             return res.status(400).json({status:400,msg:'verify email first'})
            }

            const requiredField  = ['username','fcmToken','doctor_name','password','country','contact_number','gender','state','languages','specialities','experience','maximum_education','pricePerSession']
            for(const field of requiredField){
                if(req.body[field] === undefined || req.body[field]==='' || req.body[field]===null){
                    return res.status(400).json({status:400,msg:`${field} is required`})
                }
            }



        }


        }catch(error){

        }
    }

        //  requst for approval
        export const CreateDoctor_profile = async (req, res) => {
            try {

                // gather info from the doctor 
                const { doctor_name, username, password, email, country, contact_number, state, languages, specialities, experience, maximum_education, pricePerSession, gender } = req.body
                const fileInfo = req.files;

                const isUsername = await prisma.doctor.findUnique({ where: { username } })
                const isemail = await prisma.doctor.findUnique({ where: { email } })
                if (isUsername || isemail) {
                    return res.status(409).json({ message: 'Doctor is already present with this Username or Email' })
                }

                // hashing password
                const salt = bcrypt.genSaltSync(10)
                const hash_pswd = bcrypt.hashSync(password, salt)

                // profile pic info
                const doctorProfile_originalName = fileInfo.doctorProfile[0].originalname;
                const doctorProfile_path = fileInfo.doctorProfile[0].path;
                const doctorProfile_type = fileInfo.doctorProfile[0].mimetype;
                const doctorProfile_size = (fileInfo.doctorProfile[0].size) / (1024 * 1024); //size in MB

                // documents info
                const doctorDocument_originalName = fileInfo.doctorDocument[0].originalname;
                const doctorDocument_path = fileInfo.doctorDocument[0].path;
                const doctorDocument_type = fileInfo.doctorDocument[0].mimetype;
                const doctorDocument_size = (fileInfo.doctorDocument[0].size) / (1024 * 1024); //size in MB

                // check profile pic
                const isProfilePic = (doctorProfile_type == 'image/jpg' || doctorProfile_type == 'image/png') && (doctorProfile_size <= 2)
                if (!isProfilePic) {
                    return res.status(400).json({ message: 'Profile Photo must be jpg or png and size less than 2MB' })
                }
                // check document
                const isDocument = (doctorDocument_type == 'application/zip') && (doctorDocument_size <= 20)
                if (!isDocument) {
                    return res.status(400).json({ message: 'Document must be zip and size not greater than 20MB' })
                }

                const experienceInt = parseInt(experience)
                const priceInt = parseInt(pricePerSession)

                // for database
                const data = {
                    doctor_name,
                    username,
                    password: hash_pswd,
                    email,
                    country,
                    contact_number,
                    state,
                    languages,
                    specialities,
                    gender,
                    experience: experienceInt,
                    pricePerSession: priceInt,
                    maximum_education,
                    profile_pic: doctorProfile_path,
                    profile_picType: doctorProfile_type,
                    documents: doctorDocument_path,
                    documents_type: doctorDocument_type
                }

                const info = await prisma.doctor.create({ data })


                //  for frontend
                const forClient = {
                    id: info.id,
                    doctor_name,
                    username, state,
                    languages,
                    specialities,
                    experience,
                    maximum_education,
                    gender,
                    profile_pic: doctorProfile_path
                }


                const token = jwt.sign(forClient, process.env.SECRET_KEY, { expiresIn: '999h' })

                res.status(201).json({ message: 'Request is done', token })

            } catch (error) {
                console.log(error)
                res.send(error)
            }
        }


        // login doctor
        export const doctorLogin = async (req, res) => {

            try {
                const { email, password } = req.body;

                const doctor = await prisma.doctor.findUnique({ where: { email } })
                if (doctor) {
                    var isPassword = bcrypt.compareSync(password, doctor.password)
                }

                if ((!doctor) || (!isPassword)) {
                    return res.status(404).json({ message: 'Incorrect Credentials!' })
                }

                // sending info. for client
                const forClient = {
                    id: await prisma.doctor.id,
                    username: await prisma.doctor.username,
                    doctor_name: await prisma.doctor.doctor_name,
                    state: await prisma.doctor.state,
                    languages: await prisma.doctor.languages,
                    specialities: await prisma.doctor.specialities,
                    experience: await prisma.doctor.experience,
                    maximum_education: await prisma.doctor.maximum_education,
                    profile_pic: await prisma.doctor.profile_pic
                }

                const token = jwt.sign(forClient, process.env.SECRET_KEY, { expiresIn: '999h' })

                res.status(200).json({ message: 'LoggedIn succesfully', token })

            } catch (error) {
                console.log(error)
            }
        }





        // update profile
        export const updateDoctorProfile = async (req, res) => {
            try {

                const DoctorId = +req.params.DoctorId;
                const { email, country, contact_number, state, languages, specialities, experience, maximum_education, pricePerSession } = req.body;

                // check doctor
                const isDoctor = await prisma.doctor.findUnique({ where: { id: DoctorId } })
                if (!isDoctor) {
                    return res.send(404).json({ messages: 'Doctor is not found' })
                }

                //update information
                const info = await prisma.doctor.update({
                    where: { id: DoctorId }, data: {
                        email, country, contact_number, state, languages, specialities, experience, maximum_education, pricePerSession

                    }
                })

                res.status(201).json({ message: 'Profile updated succesfully' })

            } catch (error) {
                res.send(error)
                console.log(error)
            }

        }

        // // delete profile
        export const deleteDoctor_profile = async (req, res) => {

            try {
                const DoctorId = +req.params.DoctorId;

                const isDoctor = await prisma.doctor.findUnique({ where: { id: DoctorId } })
                if (!isDoctor) {
                    res.status(404).json({ message: 'Doctor is not found' })
                }

                const info = await prisma.doctor.delete({ where: { id: DoctorId } })

                res.status(200).json({ message: 'Your Profile deleted succesfully' })

            } catch (error) {
                res.send(error)
                console.log(error)
            }


        }

        // update status iff verified == yes
        export const updateDoctorStatus = async (req, res) => {
            try {
                const DoctorId = +req.params.DoctorId;
                const { status } = req.body;

                const isDoctor = await prisma.doctor.findUnique({ where: { id: DoctorId } })
                if (!isDoctor) {
                    res.status(404).json({ message: 'Something went wrong' })
                }
                if (isDoctor.verified == 'no') {
                    res.status(400).json({ message: 'You are not verified' })
                }
                const updateStatus = await prisma.doctor.update({ where: { id: DoctorId }, data: { status } })

                res.status(200).json({ message: `Your status updated to ${status}` })

            } catch (error) {
                res.status(400).json({ message: 'something went wrong' })
                console.log(error)
            }
        }

        // update remarks iff verified == yes 
        export const updateDoctorRemarks = async (req, res) => {
            try {
                const DoctorId = +req.params.DoctorId;
                const { remarks } = req.body;

                const isDoctor = await prisma.doctor.findUnique({ where: { id: DoctorId } })
                if (!isDoctor) {
                    res.status(404).json({ message: 'Something went wrong' })
                }
                if (isDoctor.verified == 'no') {
                    res.status(400).json({ message: 'You are not verified' })
                }
                const updateStatus = await prisma.doctor.update({ where: { id: DoctorId }, data: { remarks } })

                res.status(200).json({ message: 'Remarks is updated' })

            } catch (error) {
                res.status(400).json({ message: 'something went wrong' })
                console.log(error)
            }
        }

        // doctor update avalabilty
        export const updateAvailability = async (req, res) => {
            const doctorId = +req.params.doctorId;
            const { availability } = req.body;

            //  `availability` is an array of objects like [{ startTime: '2024-09-06 09:00:00', endTime: '2024-09-06 10:00:00' }]

            try {
                if (!availability) {
                    return res.status(400).json({ status: 400, msg: 'Availability is required' });
                }

                // Parse availability if it is a string
                let parsedAvailability;
                try {
                    parsedAvailability = JSON.parse(availability);
                } catch (e) {
                    return res.status(400).json({ status: 400, msg: 'Invalid availability format' });
                }

                // Get current date and time
                const now = new Date();
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Start of the current day
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);

                // Check if all slots are within the upcoming 7 days
                for (const slot of parsedAvailability) {
                    const slotStart = new Date(slot.startTime);
                    const slotEnd = new Date(slot.endTime);

                    // Check if slot is within the next 7 days
                    if (slotStart < today || slotEnd > nextWeek) {
                        return res.status(400).json({
                            status: 400,
                            msg: `Slot ${slot.startTime} - ${slot.endTime} is out of the allowed 7-day window`
                        });
                    }

                    // Prevent updating availability for past times on the current day
                    if (slotStart.toDateString() === today.toDateString() && slotStart < now) {
                        return res.status(400).json({
                            status: 400,
                            msg: `Cannot update past time ${slot.startTime} for today`
                        });
                    }

                    // Check for overlap for each slot before inserting new availability
                    const existingSlot = await prisma.doctorAvailability.findFirst({
                        where: {
                            doctorId,
                            startTime: {
                                lte: slotEnd,  // Overlap if new slot's end is greater or equal to an existing slot's start
                            },
                            endTime: {
                                gte: slotStart, // Overlap if new slot's start is less or equal to an existing slot's end
                            }
                        }
                    });

                    // If an overlap is found, return an error
                    if (existingSlot) {
                        return res.status(400).json({
                            status: 400,
                            msg: `Availability conflict: ${slot.startTime} - ${slot.endTime} is already booked`
                        });
                    }
                }

                // If no conflicts, proceed to create the new availability
                const availableSlots = await prisma.doctorAvailability.createMany({
                    data: parsedAvailability.map(slot => ({
                        doctorId,
                        startTime: new Date(slot.startTime),
                        endTime: new Date(slot.endTime)
                    }))
                });

                res.status(200).json({ status: 200, msg: 'Availability updated', availableSlots });

            } catch (error) {
                console.error(error);
                res.status(500).json({ status: 500, msg: 'Error updating availability' });
            }
        };


        // get available slots of particular docotor
        export const getAvailableSlotsDoctor = async (req, res) => {
            const doctorId = +req.params.doctorId;
            const today = new Date();
            const nextWeek = new Date(today)
            nextWeek.setDate(today.getDate() + 7)

            try {

                const availableSlots = await prisma.doctorAvailability.findMany({
                    where: {
                        doctorId,
                        startTime: {
                            gte: today,
                            lte: nextWeek
                        }
                    }
                })

                if (availableSlots.length == 0) {
                    return res.status(400).json({ status: 400, msg: 'No Slots are available' })
                }

                res.status(200).json({ status: 200, msg: availableSlots });

            } catch (error) {
                res.status(500).json({ error: 'Error fetching available slots' });
                console.log(error.message)
            }
        }


        // to book slot 
        export const bookSlot = async (req, res) => {
            const { slotStart, slotEnd, channelName } = req.body;
            const patientId = +req.params.patientId
            const doctorId = +req.params.doctorId
            try {
                const slotStartTime = new Date(slotStart);
                const slotEndTime = new Date(slotEnd);

                // Check if the slot is already booked or overlaps with an existing booking
                const existingBooking = await prisma.booking.findFirst({
                    where: {
                        doctorId,
                        OR: [
                            { slotStart: slotStartTime },
                            { slotEnd: slotStartTime },
                            {
                                AND: [
                                    { slotStart: { lte: slotEndTime } },
                                    { slotEnd: { gte: slotStartTime } },
                                ],
                            },
                        ],
                    },
                });

                if (existingBooking) {
                    return res.status(400).json({ status: 400, msg: 'Slot is already booked' });
                }

                // Create a booking for the patient with the specified doctor and time slot
                const booking = await prisma.booking.create({
                    data: {
                        patientId,
                        doctorId,
                        slotStart: slotStartTime,
                        slotEnd: slotEndTime,
                        channelName
                    },
                });

                // const token = await prisma.patientGoogleSingIn.findUnique({where:{id:patientId}})
                // const fcmToken = token.fcmToken

                const title = 'New Slot Booking';
                const body = `Slot booked from ${slotStartTime.toLocaleTimeString()} to ${slotEndTime.toLocaleTimeString()}.`;
                await toDoctor(title, body, channelName)

                // Calculate the next available time with a 2-minute buffer
                const nextAvailableTime = new Date(slotEndTime);
                nextAvailableTime.setMinutes(nextAvailableTime.getMinutes() + 2);

                // Respond with a success message and booking details, including the next available time
                res.status(200).json({
                    status: 200,
                    msg: 'Slot booked successfully',
                    booking,
                    nextAvailableTime: nextAvailableTime.toISOString(),
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ status: 200, msg: 'Error booking slot' });
            }
        }


        // get all available slots
        export const getAllAvailableSlots = async (req, res) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of today
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7); // End date (7 days from today)

            try {
                // Get all booked slots for the upcoming 7 days
                const bookedSlots = await prisma.booking.findMany({
                    where: {
                        slotStart: {
                            gte: today,
                            lt: nextWeek
                        },
                    },
                    orderBy: {
                        slotStart: 'asc'
                    }
                });

                const availableSlots = [];
                const startHour = 9; // Start slots at 9 AM each day
                const endHour = 17; // End slots by 5 PM each day

                let currentDay = new Date(today);

                while (currentDay < nextWeek) {
                    let currentStartTime = new Date(currentDay);
                    currentStartTime.setHours(startHour, 0, 0, 0); // Set to 9:00 AM
                    let currentEndTime = new Date(currentStartTime);
                    currentEndTime.setHours(currentStartTime.getHours() + 1); // Slot duration is 1 hour

                    // Loop through the day from 9 AM to 5 PM
                    while (currentStartTime.getHours() < endHour) {
                        const slotAvailable = bookedSlots.every(booked => {
                            const bookedStart = new Date(booked.slotStart);
                            const bookedEnd = new Date(booked.slotEnd);

                            return (
                                currentEndTime <= bookedStart || currentStartTime >= bookedEnd
                            );
                        });

                        if (slotAvailable) {
                            availableSlots.push({
                                startTime: currentStartTime.toISOString(),
                                endTime: currentEndTime.toISOString(),
                            });
                        }

                        // Move to the next slot with a 2-minute buffer
                        currentStartTime = new Date(currentEndTime);
                        currentStartTime.setMinutes(currentStartTime.getMinutes() + 2);
                        currentEndTime = new Date(currentStartTime);
                        currentEndTime.setHours(currentStartTime.getHours() + 1);
                    }

                    // Move to the next day
                    currentDay.setDate(currentDay.getDate() + 1);
                }

                res.status(200).json({
                    status: 200,
                    availableSlots,
                });

            } catch (error) {
                console.error(error);
                res.status(500).json({ status: 500, msg: 'Error fetching available slots' });
            }
        };



// filter doctor state
// filter doctor language
// filter doctor exp.
// filter specialities