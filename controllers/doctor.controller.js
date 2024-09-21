import 'dotenv/config'
import { json } from "express";
import prisma from "../DB/db.config.js";
import { messages } from "@vinejs/vine/defaults";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import transporter from '../utils/transporter.js';
import { testFirbase, toDoctor } from './push_notification/notification.js';
import extractContent from '../utils/htmlExtractor.js';
import { allPatient } from './admin.controller.js';
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import exp from 'constants';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// doctor price of service
export const doctorPrice = async (req, res) => {
    const doctorId = +req.params.doctorId;
    const serviceId = +req.params.serviceId;
    const { yourPrice } = req.body;
    try {
        if (!yourPrice) {
            return res.status(400).json({ status: 400, msg: 'Your Price is required' })
        }

        const updatePrice = await prisma.doctorPrice.create({ data: { doctorId, serviceId, yourPrice } })
        res.status(200).json({ status: 200, msg: 'Your Price is added' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

// doctor update price of service
export const updateDoctorPrice = async (req, res) => {
    const doctorId = +req.params.doctorId;
    const serviceId = +req.params.serviceId;
    const { yourPrice } = req.body;
    try {
        if (!yourPrice) {
            return res.status(400).json({ status: 400, msg: 'Your Price is required' })
        }
        const updatePrice = await prisma.doctorPrice.update({
            where: {
                doctorId_serviceId: { doctorId, serviceId },

            },
            data: { yourPrice }
        })
        res.status(200).json({ status: 200, msg: 'Your Price is updated' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

// get doctor Price 
export const getDoctorPrice = async (req, res) => {
    const doctorId = +req.params.doctorId;
    const serviceId = +req.params.serviceId;
    try {
        const yourPrice = await prisma.doctorPrice.findUnique({
            where: {
                doctorId_serviceId: { doctorId, serviceId }
            }
        })
        res.status(200).json({ status: 200, yourPrice })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}









// post ticket
export const recentTicket = async (req, res) => {
    const { title, description } = req.body
    const patientId = +req.params.patientId
    try {

        if (!title || !description) {
            return res.status(400).json({ msg: 400, msg: 'All fields are required' })
        }

        if (!patientId) {
            return res.status(400).json({ msg: 400, msg: 'Patient id is required' })
        }

        const patient = await prisma.patient.findUnique({ where: { id: patientId } })

        const data = { patientId, title, description }
        const save = await prisma.recentTicket.create({ data })
        res.status(201).json({ status: 201, msg: 'Ticket added Successfully' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Sometging went wrong' })
    }
}

// get all recent ticket 
export const getAllRecentTicket = async (req, res) => {
    try {
        const tickets = await prisma.recentTicket.findMany({
            include: {
                Patient: {
                    select: {
                        username: true,
                        patient_name: true,
                        profile_path: true
                    }
                }
            }
        });
        res.status(200).json({ status: 200, tickets });

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' });
    }
}

// get trending consultant
export const trendingConsultant = async (req, res) => {
    try {
        const consultants = await prisma.doctor.findMany({ where: { verified: 'yes' }, orderBy: { noOfBooking: 'desc' } })
        res.status(200).json({ status: 200, consultants })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, consultants })
    }
}


// get alll doctors
export const allDoctors = async (req, res) => {
    try {
        const allDoctors = await prisma.doctor.findMany({ where: { verified: 'yes' } })
        const doctorsCount = allDoctors.length
        const data = { allDoctors, doctorsCount }

        if (allDoctors.length === 0) {
            return res.status(404).json({ status: 404, msg: 'No Counsultant Found' })
        }

        res.status(200).json({ status: 200, data })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })

    }
}

// app --  search doctor and services
export const searchDoctorAndServices = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            res.status(400).json({ status: 400, msg: 'Search query is required' })
        }

        // Search for doctors 
        const doctors = await prisma.doctor.findMany({
            where: {
                OR: [
                    { doctor_name: { contains: query, mode: 'insensitive' } },
                    { username: { contains: query, mode: 'insensitive' } }
                ],
            },
        });


        // Search for services 
        const services = await prisma.service.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { tags: { has: query } },
                    { benefits: { has: query } },
                    { what_we_will_discuss: { has: query } },
                ],
            },
        });



        if (doctors.length === 0 && services.length === 0) {
            return res.status(404).json({ status: 404, msg: 'No result found please try again' });
        }

        res.status(200).json({ status: 200, doctors, services })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

// support system 
export const patientSupport = async (req, res) => {
    try {
        const patientId = +req.params.patientId;
        const { title, description } = req.body;
        const fileInfo = req.file;
        if (!title) {
            return res.status(400).json({ status: 400, msg: 'Title is required' })
        }
        const fileType = fileInfo.mimetype == 'image/jpeg' || fileInfo.mimetype == 'image/png'
        const fileSize = fileInfo.size / (1024 * 1024) <= 2

        if (!fileType || !fileSize) {
            return res.status(400).json({ status: 400, msg: 'Image type must be JPG/PNG and size less than 2MB' })
        }

        const data = { patientId, title, description, image: fileInfo.path }
        const saveData = await prisma.support.create({ data })
        res.status(201).json({ status: 201, msg: 'Support Added', saveData })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

// to delete support 
export const deletePatientSupport = async (req, res) => {
    try {
        const supportId = +req.params.supportId
        const deleteSupport = await prisma.support.delete({ where: { id: supportId } })
        res.status(200).json({ status: 200, msg: 'Support deleted' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}
// get support patient specific
export const patientAllSupport = async (req, res) => {
    try {
        const patientId = +req.params.patientId
        const allSupport = await prisma.support.findMany({ where: { patientId } })
        if (allSupport.length === 0) {
            return res.status(404).json({ status: 404, msg: 'No Support Found' })
        }
        res.status(200).json({ status: 200, allSupport })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}
// get particular support 
export const eachSupport = async (req, res) => {
    try {

        const supportId = + req.params.supportId
        const support = await prisma.support.findUnique({ where: { id: supportId } })
        res.status(200).json({ status: 200, support })
    } catch (error) {
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

// to update support 
export const updateSupport = async (req, res) => {
    try {
        const supportId = +req.params.supportId
        const { title, description } = req.body
        const fileInfo = req.file

        const updatedData = {}
        if (title) {
            updatedData.title = title
        }
        if (description) {
            updatedData.description = description
        }
        if (fileInfo) {
            const fileType = fileInfo.mimetype == 'image/jpeg' || fileInfo.mimetype == 'image/png'
            const fileSize = fileInfo.size / (1024 * 1024) <= 2

            if (!fileType || !fileSize) {
                return res.status(400).json({ status: 400, msg: 'Image type must be JPG/PNG and size less than 2MB' })
            }

            updatedData.image = fileInfo.path
        }

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ status: 400, msg: 'No valid fields to update' });
        }

        const updatedSupport = await prisma.support.update({
            where: { id: supportId },
            data: updatedData,
        });

        res.status(200).json({ status: 200, msg: 'Support updated' });
    } catch (error) {
        res.status(500).json({ status: 500, msg: 'Something went wrong', error: error.message });
    }
}


// admin dashboard search bar (staff,services,content)
export const adminSearchBar = async (req, res) => {
    try {

        const { query } = req.query

        if (!query) {
            return res.status(400).json({ status: 400, msg: 'Search Query is required' })
        }

        const doctor = await prisma.doctor.findMany({
            where: {
                OR: [
                    { doctor_name: { contains: query, mode: 'insensitive' } },
                    { username: { contains: query, mode: 'insensitive' } },
                ]
            }
        })

        const manager = await prisma.manager.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { username: { contains: query, mode: 'insensitive' } },
                    { states: { has: query } },
                    { countries: { has: query } }
                ]
            }
        })


        const creator = await prisma.creator.findMany({
            where: {
                OR: [
                    { username: { contains: query, mode: 'insensitive' } },
                    { country: { contains: query, mode: 'insensitive' } },
                    { state: { contains: query, mode: 'insensitive' } },
                    { language: { has: query } }

                ]
            }
        })

        const categories = await prisma.category.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } }
                ]
            }
        })

        const services = await prisma.service.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { tags: { has: query } },
                    { subtitle: { has: query } },
                    { what_we_will_discuss: { has: query } },
                    { benefits: { has: query } },
                    { language: { contains: query, mode: 'insensitive' } },
                ]
            }
        })

        const articles = await prisma.article_content.findMany({
            where: {
                OR: [
                    { heading: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                    { tags: { has: query } },
                    { category: { has: query } }
                ]
            }
        })

        const blogs = await prisma.blog_content.findMany({
            where: {
                OR: [
                    { content: { contains: query, mode: 'insensitive' } },
                    { tags: { has: query } },
                    { category: { has: query } }
                ]
            }
        })

        const ytContent = await prisma.yt_content.findMany({
            where: {
                OR: [
                    { heading: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                    { tags: { has: query } },
                    { category: { has: query } }
                ]
            }
        })

        if (doctor.length === 0 && manager.length === 0 && creator.length === 0 && categories.length === 0 && services.length === 0 && articles.length === 0 && blogs.length === 0 && ytContent.length === 0) {
            return res.status(404).json({ status: 404, msg: 'No result found' })
        }

        res.status(200).json({ status: 200, doctor, manager, creator, categories, services, articles, blogs, ytContent, })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}


// manager dashboard search bar
export const managerSearchBar = async (req, res) => {
    const { managerId } = req.params;
    const { query } = req.query;

    try {
        const managerDetails = await prisma.manager.findUnique({
            where: { id: parseInt(managerId) },
            include: {
                doctors: {
                    where: {
                        OR: [
                            { doctor_name: { contains: query, mode: 'insensitive' } },
                            { email: { contains: query, mode: 'insensitive' } },
                            { doctorServices: { some: { service: { title: { contains: query, mode: 'insensitive' } } } } }
                        ],
                    },
                    select: {
                        doctor_name: true,
                        email: true,
                        noOfBooking: true,
                        doctorServices: {
                            include: { service: true }
                        },
                    },
                },
                creators: {
                    where: {
                        OR: [
                            { username: { contains: query, mode: 'insensitive' } },
                            { email: { contains: query, mode: 'insensitive' } },
                            { yt_contents: { some: { heading: { contains: query, mode: 'insensitive' } } } },
                            { blog_contents: { some: { tags: { has: query } } } },
                            { article_content: { some: { heading: { contains: query, mode: 'insensitive' } } } },
                        ],
                    },
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        yt_contents: true,
                        blog_contents: true,
                        article_content: true,
                    },
                },
            },
        });

        if (!managerDetails) {
            return res.status(404).json({ status: 404, msg: 'Results not found' });
        }
        res.status(200).json({ status: 200, managerDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, msg: 'Something went wrong' });
    }
}

// creator dashboard search bar
export const creatorSearchBar = async (req, res) => {
    const { creatorId } = req.params;
    const { query } = req.query;

    try {

        const creatorDetails = await prisma.creator.findUnique({
            where: { id: parseInt(creatorId) },
            include: {
                yt_contents: {
                    where: {
                        OR: [
                            { heading: { contains: query, mode: 'insensitive' } },
                            { content: { contains: query, mode: 'insensitive' } },
                            { tags: { has: query } }
                        ],
                    },
                    select: {
                        heading: true,
                        content: true,
                        views: true,
                        tags: true,
                        verified: true
                    }
                },
                blog_contents: {
                    where: {
                        OR: [
                            { content: { contains: query, mode: 'insensitive' } },
                            { tags: { has: query } }
                        ]
                    },
                    select: {
                        content: true,
                        tags: true,
                        views: true,
                        verified: true
                    }
                },
                article_content: {
                    where: {
                        OR: [
                            { heading: { contains: query, mode: 'insensitive' } },
                            { content: { contains: query, mode: 'insensitive' } },
                            { tags: { has: query } }
                        ]
                    },
                    select: {
                        heading: true,
                        content: true,
                        articleImagePath: true,
                        views: true,
                        verified: true
                    }
                }
            }
        });

        if (!creatorDetails) {
            return res.status(404).json({ status: 404, msg: 'No results found' });
        }

        res.status(200).json({ status: 200, creatorDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, msg: 'Something went wrong' });
    }
};



//get doctor profile
export const getDoctorProfile = async (req, res) => {
    try {
        const doctorId = +req.params.doctorId;
        const profile = await prisma.doctor.findUnique({ where: { id: doctorId }, include: { doctorServices: true } })
        res.status(200).json({ status: 200, profile })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}
// add service
export const addDoctorService = async (req, res) => {
    try {
        const { serviceId, doctorId } = req.body;

        // Validate that the doctorId and serviceId exist
        const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
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

        return res.status(201).json({ status: 201, message: 'Service added successfully', doctorService });
    } catch (error) {
        console.error('Error adding service:', error);
        return res.status(500).json({ status: 500, msg: 'Internal server error' });
    }
};

//   get upcoming session of doctor
export const upcomingSession = async (req, res) => {
    try {
        const doctorId = +req.params.doctorId;

        // Get the current date and time
        const currentDateTime = new Date();

        // Query to get upcoming sessions only
        const upcomingSession = await prisma.booking.findMany({
            where: {
                doctorId,
                slotStart: {
                    gt: currentDateTime // Only future sessions
                }
            },
            include: {
                Patient: true
            },
            orderBy: {
                slotStart: 'desc' // Order by upcoming sessions in descending order
            }
        });

        // If there are no upcoming sessions
        if (upcomingSession.length === 0) {
            return res.status(400).json({ status: 400, msg: 'No upcoming session' });
        }

        const upcomingSessionCount = upcomingSession.length;

        // Return response with upcoming sessions and count
        res.status(200).json({ status: 200, upcomingSession, upcomingSessionCount });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, msg: 'Something went wrong' });
    }
};


// get service from its id :
export const getServiceFromId = async (req, res) => {
    try {
        const serviceId = +req.params.serviceId
        const service = await prisma.service.findUnique({ where: { id: serviceId } })
        res.status(200).json({ status: 200, service })

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

// get service from doctor id 
export const getServicesByDoctorId = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const doctorServices = await prisma.doctorService.findMany({
            where: { doctorId: parseInt(doctorId) },
            include: {
                service: true,
            },
        });

        if (doctorServices.length === 0) {
            return res.status(404).json({ message: 'No services found for this doctor' });
        }

        return res.status(200).json(doctorServices);
    } catch (error) {
        console.error('Error retrieving services by doctorId:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// get doctor by service id 
export const getDoctorsByServiceId = async (req, res) => {
    try {
        const { serviceId } = req.params;

        // Find doctors related to the service
        const serviceDoctors = await prisma.doctorService.findMany({
            where: { serviceId: parseInt(serviceId) },
            include: {
                doctor: true, // Includes details of the related doctor
            },
        });

        if (serviceDoctors.length === 0) {
            return res.status(404).json({ message: 'No doctors found for this service' });
        }

        return res.status(200).json(serviceDoctors);
    } catch (error) {
        console.error('Error retrieving doctors by serviceId:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const allYt = async (req, res) => {
    try {
        const yt = await prisma.yt_content.findMany({ where: { verified: 'publish' } })
        res.status(200).json({ status: 200, yt })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

export const allArticle = async (req, res) => {
    try {
        const article = await prisma.article_content.findMany({ where: { verified: 'publish' } })
        res.status(200).json({ status: 200, article })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

export const allBlog = async (req, res) => {
    try {
        const blog = await prisma.blog_content.findMany({ where: { verified: 'publish' } })
        const blogDataArray = blog.map(blog => {
            const extractedContent = extractContent(blog.content);
            return {
                id: blog.id,
                tags: blog.tags,
                category: blog.category,
                data: extractedContent,
                verified: blog.verified,
                createdAt: blog.createdAt,
                updatedAt: blog.updatedAt,
                blog_creatorId: blog.blog_creatorId
            };
        });

        res.status(200).json({ status: 200, blog: blogDataArray });

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' });

    }
}


// for registration of doctor
export const registerDoctor = async(req,res)=>{
    const {username,email,doctorName,password,fcmToken}=req.body
    try {

        const requiredField = ['username','email','doctorName','password','fcmToken']
        for(const field of requiredField){
            if(req.body[field]===undefined || req.body[field]==='' || req.body[field]===null  ){
                return res.status(400).json({status:400,msg:`${field} is required`})
            }
        }

        const isDoctor = await prisma.doctor.findUnique({where:{email}})
        if(isDoctor){
            return res.status(400).json({status:400,msg:'Doctor with this mail is already present'})
        }
        const isUsername = await prisma.doctor.findUnique({where:{username}})
        if(isUsername){
            return res.status(400).json({status:400,msg:`${username} is not available`})
        }


        const salt = bcrypt.genSaltSync(10)
        const hash_pswd = bcrypt.hashSync(password,salt)

        
        const otpNumber = Math.floor(1000 + Math.random() * 9000).toString();
        const otpToken = jwt.sign({ otpNumber }, process.env.SECRET_KEY, { expiresIn: '2m' })
        
        const data = {username,doctorName,password:hash_pswd,email,fcmToken,otp:otpToken}

        const mailOptions = {
                         from: process.env.ADMIN_EMAIL,
                         to: email,
                         subject: 'Your One-Time Password (OTP) for Verification',
                         html: `
                             <p>Hello  ${doctorName} </p>
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
                   const mailSent =   transporter.sendMail (mailOptions, async(error, info) => {
                         if (error) {
                             return res.status(400).json({msg:'OTP not sent'})
                         } else {
                             await prisma.doctor.create({data})
                             return res.status(200).json({status:200,msg:'OTP sent check your Email'})
                         }
                     })
            
    } catch (error) {
        console.log(error)
        res.status(500).json({status:500,msg:'Something went wrong'})
        }
}

// to verify otp 
export const verifyDoctorOtp= async(req,res)=>{
    const {otp,email} = req.body
    try {

        const isDoctor = await prisma.doctor.findUnique({where:{email}})
        if(! isDoctor){
            return res.status(404).json({status:404,msg:'Doctor is not found with this email'})
        }
        const realOtp = isDoctor.otp;
        const decodeOtp = jwt.verify(realOtp,process.env.SECRET_KEY)
        if(otp!==decodeOtp.otpNumber){
            await prisma.doctor.delete({where:{email}})
            return res.status(400).json({status:400,msg:'OTP is invalid or expired'})
        }

        const saveData =  await prisma.doctor.update({where:{email},data:{emailVerified:'yes'}})
        const tokenData = {username:saveData.username,name:saveData.doctorName}
        const token = jwt.sign(tokenData,process.env.SECRET_KEY,{expiresIn:'999h'})
        res.status(200).json({status:200,msg:'Email is verified',doctorId:saveData.id,token})

    } catch (error) {
        console.log(error.message)
        if(error.message==='jwt expired'){
            await prisma.doctor.delete({where:{email}})
            return res.status(400).json({status:400,msg:'OTP is invalid or expired'})
        }
        res.status(500).json({status:500,msg:'Something went wrong'})
    }
}

// to complete doctor profile



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
            const saveDoctor = await prisma.doctor.create({ data });
            return res.status(201).json({ status: 201, msg: 'Profile created successfully', token, id: saveDoctor.id });
        }

    } catch (error) {
        res.status(500).json({ status: 500, msg: error.message });
    }
}

// register test for doctor
// export const doctorTest = async (req, res) => {
//     try {
//         const { username, fcmToken, doctor_name, email, password, country, contact_number, gender, state, otp, languages, specialities, experience, maximum_education, pricePerSession } = req.body

//         if (!email && !otp && !doctor_name) {
//             return res.status(400).json({ status: 400, msg: 'Enter email' })
//         }

//         if (
//             (email !== undefined && email !== null && email !== '')
//             && (otp === undefined || otp === null || otp === '')
//             && (doctor_name === undefined || doctor_name === null || doctor_name === '')
//         ) {
//             const isEmail = await prisma.doctor.findUnique({ where: { email } })
//             if (isEmail) {
//                 await prisma.doctor.delete({ where: { email } })
//                 return res.status(400).json({ status: 400, msg: 'Try again' })
//             }

//             const otpNumber = Math.floor(100000 + Math.random() * 900000).toString();
//             const otpToken = jwt.sign({ otpNumber }, process.env.SECRET_KEY, { expiresIn: '2m' })

//             const saveEmail = await prisma.doctor.create({ data: { email } })
//             const saveOtpToken = await prisma.doctor.update({ where: { email }, data: { otp: otpToken } })

//             const mailOptions = {
//                 from: process.env.ADMIN_EMAIL,
//                 to: email,
//                 subject: 'Your One-Time Password (OTP) for Verification',
//                 html: `
//                     <p>Hello</p>
//                     <p>Thank you for signing up. Please use the following OTP to verify your email address. This OTP is valid for 2 minutes.</p>
//                     <h3>${otpNumber}</h3>
//                     <p>If you did not request this, please contact our support team immediately at support@example.com.</p>
//                     <p><a href="https://phoenix-sage.vercel.app/">Visit Our website</a></p>
//                     <p>Follow us on Social Media:<br/>
//                     <img src="cid:insta" alt="insta icon" style="width: 30px; height: 30px;" />
//                     <img src="cid:fb" alt="fb icon" style="width:30px; height:30px" />
//                     <img src="cid:yt" alt="yt icon" style="width:30px; height:30px" />
//                     </p>
//                     <p>Best regards,<br>Kanika Jindal<br>Founder<br>example@gmail.com</p>
//                 `,
//                 attachments: [
//                     {
//                         filename: 'insta_logo.png',
//                         path: path.join(__dirname, 'attachements', 'insta_logo.png'),
//                         cid: 'insta'
//                     },
//                     {
//                         filename: 'fb_logo.png',
//                         path: path.join(__dirname, 'attachements', 'fb_logo.png'),
//                         cid: 'fb'
//                     },
//                     {
//                         filename: 'yt_logo.png',
//                         path: path.join(__dirname, 'attachements', 'yt_logo.jpeg'),
//                         cid: 'yt'
//                     }
//                 ]
//             }

//             transporter.sendMail(mailOptions, async (error, info) => {
//                 if (error) {
//                     await prisma.doctor.delete({ where: { email } })
//                     return res.status(400).json({ msg: 'OTP not sent' })
//                 } else {
//                     // await prisma.patient.update({where:{email},data:{email:null}})
//                     return res.status(200).json({ msg: 'OTP sent check your Email' })
//                 }
//             });
//         }

//         // verify OTP
//         else if (
//             (email !== undefined && email !== null && email !== '')
//             && (otp !== undefined || otp !== null || otp !== '')
//             && (doctor_name === undefined || doctor_name === null || doctor_name === '')
//         ) {
//             try {
//                 const findOtp = await prisma.doctor.findUnique({ where: { email } })
//                 const realOtp = findOtp.otp
//                 const decode = jwt.verify(realOtp, process.env.SECRET_KEY)


//                 if (decode.otpNumber == otp) {
//                     await prisma.doctor.update({ where: { email }, data: { emailVerified: 'yes' } })
//                     return res.status(200).json({ status: 200, msg: "Email verified" })
//                 }


//                 if (decode.otpNumber !== otp) {
//                     return res.status(400).json({ status: 400, msg: 'OTP is invalid or expired' })
//                 }


//                 if (decode.otpNumber !== otp) {
//                     return res.status(400).json({ status: 400, msg: 'OTP is invalid or expired' })
//                 }
//             } catch (error) {
//                 return res.status(400).json({ status: 400, msg: 'OTP is invalid or expired' })
//             }
//         }
//         // then register doctor
//         else if (
//             (email !== undefined || email !== null || email !== '')
//             && (otp !== undefined || otp !== null || otp !== '')
//             && (patient_name !== undefined)
//         ) {

//             const isEmailVerified = await prisma.doctor.findUnique({ where: { email } })
//             if (isEmailVerified.emailVerified === 'no') {
//                 return res.status(400).json({ status: 400, msg: 'verify email first' })
//             }

//             const requiredField = ['username', 'fcmToken', 'doctor_name', 'password', 'country', 'contact_number', 'gender', 'state', 'languages', 'specialities', 'experience', 'maximum_education', 'pricePerSession']
//             for (const field of requiredField) {
//                 if (req.body[field] === undefined || req.body[field] === '' || req.body[field] === null) {
//                     return res.status(400).json({ status: 400, msg: `${field} is required` })
//                 }
//             }



//         }


//     } catch (error) {

//     }
// }

//  requst for approval
// export const CreateDoctor_profile = async (req, res) => {
//     try {

//         // gather info from the doctor 
//         const { doctor_name, username, password, email, country, contact_number, state, languages, specialities, experience, maximum_education, pricePerSession, gender } = req.body
//         const fileInfo = req.files;

//         const isUsername = await prisma.doctor.findUnique({ where: { username } })
//         const isemail = await prisma.doctor.findUnique({ where: { email } })
//         if (isUsername || isemail) {
//             return res.status(409).json({ message: 'Doctor is already present with this Username or Email' })
//         }

//         // hashing password
//         const salt = bcrypt.genSaltSync(10)
//         const hash_pswd = bcrypt.hashSync(password, salt)

//         // profile pic info
//         const doctorProfile_originalName = fileInfo.doctorProfile[0].originalname;
//         const doctorProfile_path = fileInfo.doctorProfile[0].path;
//         const doctorProfile_type = fileInfo.doctorProfile[0].mimetype;
//         const doctorProfile_size = (fileInfo.doctorProfile[0].size) / (1024 * 1024); //size in MB

//         // documents info
//         const doctorDocument_originalName = fileInfo.doctorDocument[0].originalname;
//         const doctorDocument_path = fileInfo.doctorDocument[0].path;
//         const doctorDocument_type = fileInfo.doctorDocument[0].mimetype;
//         const doctorDocument_size = (fileInfo.doctorDocument[0].size) / (1024 * 1024); //size in MB

//         // check profile pic
//         const isProfilePic = (doctorProfile_type == 'image/jpg' || doctorProfile_type == 'image/png') && (doctorProfile_size <= 2)
//         if (!isProfilePic) {
//             return res.status(400).json({ message: 'Profile Photo must be jpg or png and size less than 2MB' })
//         }
//         // check document
//         const isDocument = (doctorDocument_type == 'application/zip') && (doctorDocument_size <= 20)
//         if (!isDocument) {
//             return res.status(400).json({ message: 'Document must be zip and size not greater than 20MB' })
//         }

//         const experienceInt = parseInt(experience)
//         const priceInt = parseInt(pricePerSession)

//         // for database
//         const data = {
//             doctor_name,
//             username,
//             password: hash_pswd,
//             email,
//             country,
//             contact_number,
//             state,
//             languages,
//             specialities,
//             gender,
//             experience: experienceInt,
//             pricePerSession: priceInt,
//             maximum_education,
//             profile_pic: doctorProfile_path,
//             profile_picType: doctorProfile_type,
//             documents: doctorDocument_path,
//             documents_type: doctorDocument_type
//         }

//         const info = await prisma.doctor.create({ data })


//         //  for frontend
//         const forClient = {
//             role:info.role,
//             id: info.id,
//             doctor_name,
//             username, state,
//             languages,
//             specialities,
//             experience,
//             maximum_education,
//             gender,
//             profile_pic: doctorProfile_path

//         }


//         const token = jwt.sign(forClient, process.env.SECRET_KEY, { expiresIn: '999h' })

//         res.status(201).json({ message: 'Request is done', token })

//     } catch (error) {
//         console.log(error)
//         res.send(error)
//     }
// }


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
            role:doctor.role,
            id: doctor.id,
            username: doctor.username,
            doctor_name: doctor.doctor_name,
            state: doctor.state,
            languages: doctor.languages,
            specialities: doctor.specialities,
            experience: doctor.experience,
            maximum_education: doctor.maximum_education,
            profile_pic: doctor.profile_pic
        }

        const token = jwt.sign(forClient, process.env.SECRET_KEY, { expiresIn: '999h' })

        res.status(200).json({ status:200,msg: 'LoggedIn succesfully', token })

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
        })

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
    const { slotStart, slotEnd, channelName, serviceTitle } = req.body;
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

        // update booking of doctor


        // Create a booking for the patient with the specified doctor and time slot
        const booking = await prisma.booking.create({
            data: {
                patientId,
                doctorId,
                slotStart: slotStartTime,
                slotEnd: slotEndTime,
                channelName,
                serviceTitle
            },
        });

        // Increment the noOfBooking for the doctor
        await prisma.doctor.update({
            where: { id: doctorId },
            data: {
                noOfBooking: { increment: 1 }
            },
        });

        const doctor = await prisma.doctor.findUnique({where:{id:doctorId}})
        const token = doctor.fcmToken

        const title = 'New Slot Booking';
        const body = `Slot booked from ${slotStartTime.toLocaleTimeString()} to ${slotEndTime.toLocaleTimeString()}.`;

        await toDoctor(title, body, channelName,token)

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



// doctor forgot password :
export const DoctorOtpSend = async (req, res) => {
    try {
        const { email } = req.body;
        const isDoctor = await prisma.doctor.findUnique({ where: { email } })
        if(! isDoctor){
            return res.status(404).json({msg:"User not Found"})
        }

        // otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpToken = jwt.sign({ otp }, process.env.SECRET_KEY, { expiresIn: '2m' })

        // store otp in db
        const saveOtp = await prisma.doctor.update({ where: { email }, data: { otp:otpToken} })

        // send OTP via mail
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: 'OTP to reset Password',
            html:
                `
            Dear ${isDoctor.doctor_name},

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
                res.status(400).json({status:400, msg: 'OTP not Sent' })
            }
            else {
                res.status(200).json({status:200, msg: 'OTP sent Successfully' })
            }
        })
    } catch (error) {
        res.status(400).json({ message: 'Something went wromg' })
        console.log(error)
    }
}

// doctor reset password
export const DoctorResetPassword = async(req,res)=>{
    try {
        const {otp,email,newPassword} = req.body;
        const checkOtp =  await prisma.doctor.findUnique({where:{email}})

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
        const updatePassword  = await prisma.doctor.update({where:{email},data:{password:hash_pass}})
        res.status(200).json({status:200,msg:'Password reset successful'})
     
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired OTP' })
        console.log(error) 
    }
}

// to get category from doctor id 
export const getCategoriesByDoctorId = async (req, res) => {
    const { doctorId } = req.params;
    try {
        const services = await prisma.doctorService.findMany({
            where: { doctorId: parseInt(doctorId) },
            select: { serviceId: true }
        });

        const categoryIds = [...new Set(services.map(service => service.serviceId))];

        const categories = await prisma.category.findMany({
            where: {
                id: {
                    in: categoryIds
                }
            }
        });

        return res.status(200).json({ status: 200, categories });
    } catch (error) {
        console.error('Error retrieving categories:', error);
        return res.status(500).json({ status: 500, msg: 'Something went wrong' });
    }
};

// complete doctor profile

// export const CreateDoctor_profile = async (req, res) => {
//     try {

//         // gather info from the doctor 
//         const { doctor_name, username, password, email, country, contact_number, state, languages, specialities, experience, maximum_education, pricePerSession, gender } = req.body
//         const fileInfo = req.files;

//         const isUsername = await prisma.doctor.findUnique({ where: { username } })
//         const isemail = await prisma.doctor.findUnique({ where: { email } })
//         if (isUsername || isemail) {
//             return res.status(409).json({ message: 'Doctor is already present with this Username or Email' })
//         }

//         // hashing password
//         const salt = bcrypt.genSaltSync(10)
//         const hash_pswd = bcrypt.hashSync(password, salt)

//         // profile pic info
//         const doctorProfile_originalName = fileInfo.doctorProfile[0].originalname;
//         const doctorProfile_path = fileInfo.doctorProfile[0].path;
//         const doctorProfile_type = fileInfo.doctorProfile[0].mimetype;
//         const doctorProfile_size = (fileInfo.doctorProfile[0].size) / (1024 * 1024); //size in MB

//         // documents info
//         const doctorDocument_originalName = fileInfo.doctorDocument[0].originalname;
//         const doctorDocument_path = fileInfo.doctorDocument[0].path;
//         const doctorDocument_type = fileInfo.doctorDocument[0].mimetype;
//         const doctorDocument_size = (fileInfo.doctorDocument[0].size) / (1024 * 1024); //size in MB

//         // check profile pic
//         const isProfilePic = (doctorProfile_type == 'image/jpg' || doctorProfile_type == 'image/png') && (doctorProfile_size <= 2)
//         if (!isProfilePic) {
//             return res.status(400).json({ message: 'Profile Photo must be jpg or png and size less than 2MB' })
//         }
//         // check document
//         const isDocument = (doctorDocument_type == 'application/zip') && (doctorDocument_size <= 20)
//         if (!isDocument) {
//             return res.status(400).json({ message: 'Document must be zip and size not greater than 20MB' })
//         }

//         const experienceInt = parseInt(experience)
//         const priceInt = parseInt(pricePerSession)

//         // for database
//         const data = {
//             doctor_name,
//             username,
//             password: hash_pswd,
//             email,
//             country,
//             contact_number,
//             state,
//             languages,
//             specialities,
//             gender,
//             experience: experienceInt,
//             pricePerSession: priceInt,
//             maximum_education,
//             profile_pic: doctorProfile_path,
//             profile_picType: doctorProfile_type,
//             documents: doctorDocument_path,
//             documents_type: doctorDocument_type
//         }

//         const info = await prisma.doctor.create({ data })


//         //  for frontend
//         const forClient = {
//             role:info.role,
//             id: info.id,
//             doctor_name,
//             username, state,
//             languages,
//             specialities,
//             experience,
//             maximum_education,
//             gender,
//             profile_pic: doctorProfile_path

//         }


//         const token = jwt.sign(forClient, process.env.SECRET_KEY, { expiresIn: '999h' })

//         res.status(201).json({ message: 'Request is done', token })

//     } catch (error) {
//         console.log(error)
//         res.send(error)
//     }
// }
export const completeDoctorProfile = async (req, res) => {
    const { country, contactNumber, state, languages, experience, maximumEducation, pricePerSession, gender } = req.body;
    const fileInfo = req.files;
    const doctorId = parseInt(req.params.doctorId);
  
    try {
      // Check for required fields
      const requiredFields = ['country', 'contactNumber', 'state', 'languages', 'experience', 'maximumEducation', 'pricePerSession', 'gender'];
      
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({ status: 400, msg: `${field} is required` });
        }
      }
  
      // Ensure files are present
      if (!fileInfo || !fileInfo.doctorProfile || !fileInfo.doctorDocument) {
        return res.status(400).json({ status: 400, msg: 'Profile photo and document are required' });
      }
  
      // Profile pic info
      const doctorProfile = fileInfo.doctorProfile[0];
      const doctorProfile_path = doctorProfile.path;
      const doctorProfile_type = doctorProfile.mimetype;
      const doctorProfile_size = doctorProfile.size / (1024 * 1024); // size in MB
  
      // Document info
      const doctorDocument = fileInfo.doctorDocument[0];
      const doctorDocument_path = doctorDocument.path;
      const doctorDocument_type = doctorDocument.mimetype;
      const doctorDocument_size = doctorDocument.size / (1024 * 1024); // size in MB
  
      // Validate profile pic
      const isProfilePic = (doctorProfile_type === 'image/jpg' || doctorProfile_type === 'image/png') && (doctorProfile_size <= 2);
      if (!isProfilePic) {
        return res.status(400).json({ status: 400, msg: 'Profile photo must be jpg or png and size less than 2MB' });
      }
  
      // Validate document
      const isDocument = (doctorDocument_type === 'application/zip') && (doctorDocument_size <= 20);
      if (!isDocument) {
        return res.status(400).json({ status: 400, msg: 'Document must be a zip file and size not greater than 20MB' });
      }
  
     
      const data = {
        country,
        contactNumber,
        state,
        languages,
        experience,
        maximumEducation,
        pricePerSession,
        gender,
        profileUrl: doctorProfile_path,
        documents: doctorDocument_path,
      };

      
      const saveData = await prisma.doctor.update({ where: { id: doctorId }, data });
      res.status(200).json({ status: 200, msg: 'Profile completed successfully' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 500, msg: 'Something went wrong' });
    }
  };
  
  