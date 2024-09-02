import jwt from 'jsonwebtoken'
import prisma from '../DB/db.config.js'
import nodemailer from 'nodemailer'
import 'dotenv/config'
import transporter from '../utils/transporter.js'
import bcrypt from 'bcryptjs'
import vine from '@vinejs/vine'
import contentCategory_validation from '../validations/validatons.js'
import { messages } from '@vinejs/vine/defaults'
import path from 'path'
import { json } from 'express'
import footer from './mailComponents/footer.js'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import exp from 'constants'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// approve request of doctor
export const approveDoctorRequest = async (req, res) => {
    try {
        const DoctorId = +req.params.DoctorId;

        const verify = await prisma.doctor.update({ where: { id: DoctorId }, data: { verified: 'yes' } })

        // send mail to the doctor
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${verify.email}`,
            subject: 'Congratulations! Your Application Has Been Approved',
            html:
                `Congratulations, Dr. ${verify.doctor_name}!

     <p>We are pleased to inform you that your application has been approved by our team.</p>

     <p>You are now officially part of the Harmony platform, and we are excited to have you on board!</p>

     <p>To get started, please log in to your account and complete your profile by adding your availability and any other necessary information. If you have any questions or need assistance, feel free to contact us at <a href="mailto:support@yourcompany.com">support@yourcompany.com</a>.</p>
     
     <p>We look forward to your valuable contributions to our community.</p>
     
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
                console.log(error);
                res.status(500).json({ message: `${verify.username} is verified but email not sent` });
            } else {
                console.log('Email sent')
                res.status(200).json({ message: `${verify.username} is verified and sent succesfully` })
            }
        })

    } catch (error) {
        res.status(400).json({ message: 'Something went wromg' })
        console.log(error)
    }
}


// reject doctor request
export const rejectDoctor = async (req, res) => {
    try {
        const DoctorId = +req.params.DoctorId;
        const { reason } = req.body;
        // update verified as rejected
        const rejected = await prisma.doctor.update({ where: { id: DoctorId }, data: { verified: 'rejected' } })

        // send mail
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${rejected.email}`,
            subject: 'Application Status: Your Request Has Been Rejected',
            html:
                `
      <p> Dear Dr. ${rejected.doctor_name}</p>
      <p> We regret to inform you that your application has been rejected for the following reason: </p>
      <p>${reason} </p>
      <p>We understand that this may be disappointing news, and we encourage you to reach out if you have any questions or if you would like to discuss this decision further.Please do not hesitate to contact us for any assistance you may need.</p>

      
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
                console.log(error);
                res.status(500).json({ message: `${rejected.username} is rejected but email not sent` });
            } else {
                console.log('Email sent')
                res.status(200).json({ message: `${rejected.username} is rejected and email sent succesfully` })
            }
        })

    } catch (error) {
        res.status(400).json({ message: 'Something went wromg' })
        console.log(error)
    }
}


// assingn manager to approve doctors
export const assignManager_doctor = async (req, res) => {
    try {
        const doctorId = +req.params.doctorId;
        const { assignedManager } = req.body;
        const isDoctor = await prisma.doctor.findUnique({ where: { id: doctorId, verified: 'yes' } })
        if (!isDoctor) {
            return res.status(400).json({ message: 'Doctor is not verified' })
        }
        const assigned = await prisma.doctor.update({ where: { id: doctorId }, data: { assignedManager } })
        res.status(200).json({ message: 'Manager assigned Succesfully' })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// get rejected doctors
export const getRejectedDoctors = async (req, res) => {
    try {

        const rejectedDoctors = await prisma.doctor.findMany({ where: { verified: 'rejected' } })
        const count = rejectedDoctors.length
        const data = { count, rejectedDoctors }
        res.status(200).json({ data })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong' })
    }
}

// get pending doctors
export const getPendingDoctors = async (req, res) => {

    try {
        const pendingDoctors = await prisma.doctor.findMany({ where: { verified: 'no' } })
        const count = pendingDoctors.length;

        const data = { count, pendingDoctors }
        res.status(200).json({ data })

    } catch (error) {
        res.status(400).json('Something went wrong')
        console.log(error)
    }
}

// get approved doctors
export const getApprovedDoctors = async (req, res) => {
    try {
        const approvalDoctors = await prisma.doctor.findMany({ where: { verified: 'yes' } })
        const count = approvalDoctors.length;

        const data = { count, approvalDoctors }
        res.status(200).json({ data })

    } catch (error) {
        res.status(400).json('Something went wrong')
        console.log(error)
    }
}


// get active doctors list 
export const getActiveDoctors = async (req, res) => {
    try {
        const activeDoctors = await prisma.doctor.findMany({ where: { verified: 'yes', status: 'active' } })
        const count = activeDoctors.length
        const data = { count, activeDoctors }
        res.status(200).json({ data })

    } catch (error) {
        res.status(400).json({ data: 'Something went wrong' })
        console.log(error)
    }
}

// get inactive doctors list
export const getInactiveDoctors = async (req, res) => {
    try {
        const InactiveDoctors = await prisma.doctor.findMany({ where: { verified: 'yes', status: 'inactive' } })
        const count = InactiveDoctors.length
        const data = { count, InactiveDoctors }
        res.status(200).json({ data })

    } catch (error) {
        res.status(400).json({ data: 'Something went wrong' })
        console.log(error)
    }
}

// get temporary off doctors list 
export const getTemporaryoffDoctors = async (req, res) => {
    try {
        const temporayOffDoctors = await prisma.doctor.findMany({ where: { verified: 'yes', status: 'temporaryoff' } })
        const count = temporayOffDoctors.length
        const data = { count, temporayOffDoctors }
        res.status(200).json({ data })

    } catch (error) {
        res.status(400).json({ data: 'Something went wrong' })
        console.log(error)
    }
}

// create content category
export const contentCategory = async (req, res) => {
    try {
        const data = req.body;
        const fileInfo = req.file;
        const validator = vine.compile(contentCategory_validation)
        const validateData = await validator.validate(data)
        const isCategory = await prisma.contentCategory.findUnique({ where: { category: validateData.category } })
        if (isCategory) {
            return res.status(400).json({ message: `${isCategory.category} is already Present` })
        }
        // check file
        const isFile = (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpeg') && ((req.file.size / (1024 * 1024)) <= 2)
        if (!isFile) {
            return res.status(400).json({ message: 'Image should be jpg/png and size less than 2MB' })
        }

        const allData = { category: validateData.category, description: validateData.description, image_path: req.file.path }

        const createCategory = await prisma.contentCategory.create({ data: allData })
        res.status(201).json({ message: `${validateData.category} has been added in Content Categories` })

    } catch (error) {
        res.status(400).json({ message: error })
        console.log(error)
    }
}


// update content Category
export const update_ContentCategory = async (req, res) => {
    try {
        const CategoryId = +req.params.CategoryId;
        const fileInfo = req.file;
        const { category, description } = req.body;


        const updateData = {};


        if (category) {
            updateData.category = category;
        }
        if (description) {
            updateData.description = description;
        }
        if (fileInfo) {

            const isFileValid = (fileInfo.mimetype === 'image/png' || fileInfo.mimetype === 'image/jpeg') && (fileInfo.size / (1024 * 1024)) <= 2;
            if (!isFileValid) {
                return res.status(400).json({ message: 'Image should be jpg/png and size less than 2MB' });
            }
            updateData.image_path = fileInfo.path;
        }


        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        // Update category 
        const update = await prisma.contentCategory.update({
            where: { id: CategoryId },
            data: updateData
        });

        res.status(200).json({ message: 'Category has been updated', data: update });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the category', error: error.message });
    }
};

// delete category
export const deleteCategory = async (req, res) => {
    try {
        const CategoryId = +req.params.CategoryId;
        const deleteCategory = await prisma.contentCategory.delete({ where: { id: CategoryId } })
        res.status(200).json({ message: `${deleteCategory.category} has been deleted` })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// get content category
export const getContentCategory = async (req, res) => {
    try {

        const allCategory = await prisma.contentCategory.findMany()
        const categoriesCount = allCategory.length
        const data = { allCategory, categoriesCount }
        res.status(200).json({ data })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}




//create manager
export const register_manager = async (req, res) => {
    try {

        // get info.
        const { name, username, email, states, countries, contact_number, password } = req.body;
        const fileInfo = req.file;

        // check file  
        const isFile = (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpeg') && ((req.file.size / (1024 * 1024)) <= 2)

        if (!isFile) {
            return res.status(400).json({ message: 'Profile picture should be jpg/png and size less than 2MB' })
        }

        // encrypt password
        const salt = bcrypt.genSaltSync(10);
        const hash_pswd = bcrypt.hashSync(password, salt)
        // save in db
        const data = { name, username, email, states, countries, contact_number, password: hash_pswd, profile_path: fileInfo.path }
        //send token
        const savedData = await prisma.manager.create({ data })
        const token = jwt.sign(savedData, process.env.SECRET_KEY, { expiresIn: '999h' })

        // send mail to the manager
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: 'Congratulations from Harmony',
            text: `You are Manager in Harmony Your email is ${email} and Password is ${password}.Please Log in to start your journey `,
            html:
                `<p>Dear ${name} ,</p>
    <p>I am pleased to inform you that you have been appointed as the new manager for the <strong>Harmony</strong></p>
    <p>Account Credentials :<br/> <strong>Email:</strong> ${email} <br/><strong>Password:</strong> ${password}   </p>
    <p>Please let me know if you require any further information or assistance as you transition into your new role.</p>
    <p>Thank you for taking on this responsibility. I am confident you will excel in managing Harmony and look forward to seeing your contributions.</p>
           
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
                console.log(error);
                res.status(500).json({ message: `Manager ${name} is created but email not sent` });
            } else {
                console.log('Email sent')
                res.status(201).json({ message: "Manger is Created", token: token })
            }
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error })
    }
}

// get all manager
export const getAllManager = async (req, res) => {
    try {

        const alllManager = await prisma.manager.findMany({ include: { creators: true, doctors: true } })
        const count = alllManager.length
        const data = { count, alllManager }
        res.status(200).json({ data })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// get inactive manager
export const getInactiveManager = async (req, res) => {
    try {
        const inactiveManger = await prisma.manager.findMany({ where: { status: 'inactive' } })
        const count = inactiveManger.length
        const data = { count, inactiveManger }
        res.status(200).json({ data })
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// get temporary off manager
export const getOffManager = async (req, res) => {
    try {
        const offManager = await prisma.manager.findMany({ where: { status: 'temporary off' } })
        const count = offManager.length
        const data = { offManager, count }
        res.status(200).json({ offManager })
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// get active manager
export const getActiveManager = async (req, res) => {
    try {
        const offManager = await prisma.manager.findMany({ where: { status: 'active' } })
        const count = offManager.length
        const data = { offManager, count }
        res.status(200).json({ offManager })
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

//delete manager 
export const delete_manager = async (req, res) => {
    try {
        const managerId = +req.params.managerId;
        const deleteManager = await prisma.manager.delete({ where: { id: managerId } })
        res.status(200).json({ message: `Manager ${deleteManager.name} has been deleted` })
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}


// update manager profile
export const updateManager = async (req, res) => {
    try {
        const managerId = +req.params.managerId;
        const { name, username, email, state, countries, contact_number } = req.body;
        const fileInfo = req.file;

        const updatedData = {}
        if (name) {
            updatedData.name = name
        }
        if (username) {
            updatedData.username = username
        }
        if (email) {
            updatedData.email = email
        }
        if (state) {
            updatedData.state = state
        }
        if (countries) {
            updatedData.countries = countries
        }
        if (contact_number) {
            updatedData.contact_number = contact_number
        }

        if (fileInfo) {

            // check file  
            const isFile = (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpeg') && ((req.file.size / (1024 * 1024)) <= 2)

            if (!isFile) {
                return res.status(400).json({ message: 'Profile picture should be jpg/png and size less than 2MB' })
            }

            updatedData.profile_path = fileInfo.path
        }


        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const updateManager = await prisma.manager.update({ where: { id: managerId }, data: updatedData })
        res.status(200).json({ message: 'Manager Profile has been updated' })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// update status of manager---temporary off
export const setOffManager = async (req, res) => {
    try {
        const managerId = +req.params.managerId;
        const updateStatus = await prisma.manager.update({ where: { id: managerId }, data: { status: 'temporary off' } })

        // send mail to the manager
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${updateStatus.email}`,
            subject: 'Status has been changed',
            text: `Dear ${updateStatus.name} your status has been changed to Temporary off `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: `Status of ${updateStatus.name} changed but Email not sent` });
            } else {
                console.log('Email sent')
                res.status(200).json({ message: `Now manager ${updateStatus.name} changed to Temporay off ` })
            }
        })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// update status of manager---inactive
export const setInactiveManager = async (req, res) => {
    try {
        const managerId = +req.params.managerId;
        const updateStatus = await prisma.manager.update({ where: { id: managerId }, data: { status: 'inactive' } })

        // send mail to the manager
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${updateStatus.email}`,
            subject: 'Status has been changed',
            text: `Dear ${updateStatus.name} your status has been changed to Inactive off `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: `Status of ${updateStatus.name} changed but Email not sent` });
            } else {
                console.log('Email sent')
                res.status(200).json({ message: `Now manager ${updateStatus.name} changed to Inactive` })

            }
        })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// update status of  manager ---active
export const setActiveManager = async (req, res) => {
    try {
        const managerId = +req.params.managerId;
        const updateStatus = await prisma.manager.update({ where: { id: managerId }, data: { status: 'active' } })

        // send mail to the manager
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${updateStatus.email}`,
            subject: 'Status has been changed',
            text: `Dear ${updateStatus.name} your status has been changed to Active `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: `Status of ${updateStatus.name} changed but Email not sent` });
            } else {
                console.log('Email sent')
                res.status(200).json({ message: `Now manager ${updateStatus.name} changed to Active` })

            }
        })


    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// update remarks of manager 
export const updateRemarks = async (req, res) => {
    try {
        const managerId = +req.params.managerId;
        const { remarks } = req.body;
        const updateRemark = await prisma.manager.update({ where: { id: managerId }, data: { remarks: remarks } })

        // send mail to the manager
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${updateRemark.email}`,
            subject: 'Remarks has been changed',
            text: `Dear ${updateRemark.name} Greeting from Harmony your remarks is ${remarks}  `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: `Remark of ${updateRemark.name} changed but Email not sent` });
            } else {
                console.log('Email sent')
                res.status(200).json({ message: `Remark of ${updateRemark.name} updated and Email Sent` })
            }
        })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}


// ----------------------------------------creator API of admin
// register creator
export const creator_profile = async (req, res) => {
    try {
        // get data
        const { username, email, country, contact_number, state, language, password, assignedManager } = req.body;
        const fileInfo = req.file;

        // creator is already present or not 
        const isUsername = await prisma.creator.findUnique({ where: { username } })
        if (isUsername) {
            return res.status(409).json({ message: `username ${username} is not available` })
        }
        const isEmail = await prisma.creator.findUnique({ where: { email } })
        if (isEmail) {
            return res.status(409).json({ message: `Email ${email} is already registered ` })
        }

        // check file  
        const isFile = (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpeg') && ((req.file.size / (1024 * 1024)) <= 2)

        if (!isFile) {
            return res.status(400).json({ message: 'Profile picture should be jpg/png and size less than 2MB' })
        }

        // encrypt password
        const salt = bcrypt.genSaltSync(10);
        const hash_pswd = bcrypt.hashSync(password, salt)

        // data
        const data = {
            username,
            email,
            contact_number,
            country,
            state,
            language,
            assignedManager: assignedManager,
            password: hash_pswd,
            profile_path: fileInfo.path,
            profile_type: fileInfo.mimetype
        }

        // save in database
        const info = await prisma.creator.create({
            data
        })

        // for token
        const creator = {
            id: info.id,
            username: info.username,
            email: info.email,
            state: info.state,
            language: info.language,
            profile_path: info.profile_path
        }
        // create token
        const token = jwt.sign(creator, process.env.SECRET_KEY, { expiresIn: '999h' })

        // send mail to the manager
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: `congratulations ${username},You are creator on Harmony`,
            text: `You are Creator in Harmony Your email is ${email} and Password is ${password}.Please Log in to start your journey `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: `Creator ${username} is created but email not sent` });
            } else {
                console.log('Email sent')
                res.status(201).json({ message: 'Creator is registered', token: token })
            }
        })

    } catch (error) {
        res.status(400).json({ msg: error.message || 'Something went wrong' })
    }
}

// update creator profile
export const updateCreatorProfile = async (req, res) => {
    try {
        const creatorId = +req.params.creatorId
        const { username, email, country, state, languages, contact_number } = req.body;
        const fileInfo = req.file;

        const updatedData = {}

        if (username) {
            updatedData.username = username
        }
        if (email) {
            updatedData.email = email
        }
        if (country) {
            updatedData.country = country
        }
        if (state) {
            updatedData.state = state
        }
        if (languages) {
            updatedData.languages = languages
        }
        if (contact_number) {
            updatedData.contact_number = contact_number
        }

        if (fileInfo) {
            const isFile = (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpeg') && ((req.file.size / (1024 * 1024)) <= 2)

            if (!isFile) {
                return res.status(400).json({ message: 'Profile picture should be jpg/png and size less than 2MB' })
            }

            updatedData.profile_path = fileInfo.path
            updatedData.profile_type = fileInfo.mimetype

        }

        if (Object.keys(updatedData).length == 0) {
            return res.status(400).json({ message: "No valid field to update" })
        }

        const updateCreator = await prisma.creator.update({ where: { id: creatorId }, data: updatedData })
        res.status(200).json({ message: "Profile updated succesfully" })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}
// get creators
export const getCreators = async (req, res) => {
    try {

        const allCreators = await prisma.creator.findMany({ include: { yt_contents: true, blog_contents: true, article_content: true } })
        const count = allCreators.length
        const data = { allCreators, count }
        res.status(200).json({ data })
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// delete creator
export const deleteCreator = async (req, res) => {
    try {
        const creatorId = +req.params.creatorId;
        const deleteManager = await prisma.creator.delete({ where: { id: creatorId } })
        res.status(200).json({ message: 'Creator has been deleted' })
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// update status of creator --- inactive
export const setInactiveCreator = async (req, res) => {
    try {
        const creatorId = +req.params.creatorId;
        const updateStatus = await prisma.creator.update({ where: { id: creatorId }, data: { status: 'inactive' } })

        // send mail to the manager
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${updateStatus.email}`,
            subject: 'Status has been changed',
            text: `Dear ${updateStatus.username} your status has been changed to Inactive off `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: `Status of ${updateStatus.username} changed but Email not sent` });
            } else {
                console.log('Email sent')
                res.status(200).json({ message: `Now Creator ${updateStatus.username} changed to Inactive` })
            }
        })
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// update status of creator ---temporary off
export const setOffCreator = async (req, res) => {
    try {
        const creatorId = +req.params.creatorId;
        const updateStatus = await prisma.creator.update({ where: { id: creatorId }, data: { status: 'temporary off' } })

        // send mail to the manager
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${updateStatus.email}`,
            subject: 'Status has been changed',
            text: `Dear ${updateStatus.username} your status has been changed to Temporary`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: `Status of ${updateStatus.username} changed but Email not sent` });
            } else {
                console.log('Email sent')
                res.status(200).json({ message: `Now Creator ${updateStatus.username} changed to Temporary off` })
            }
        })


    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// update status of creator ---active 
export const setActiveCreator = async (req, res) => {
    try {
        const creatorId = +req.params.creatorId;
        const updateStatus = await prisma.creator.update({ where: { id: creatorId }, data: { status: 'active' } })

        // send mail to the manager
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${updateStatus.email}`,
            subject: 'Status has been changed',
            text: `Dear ${updateStatus.username} your status has been changed to Active`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: `Status of ${updateStatus.username} changed but Email not sent` });
            } else {
                console.log('Email sent')
                res.status(200).json({ message: `Now Creator ${updateStatus.username} changed to Active` })
            }
        })
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// get active creators
export const activeCreators = async (req, res) => {
    try {
        const activeCreators = await prisma.creator.findMany({ where: { status: 'active' } })
        const count = activeCreators.length
        const data = { activeCreators, count }
        res.status(200).json({ data })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// get inactive creators
export const inactiveCreators = async (req, res) => {
    try {
        const inactiveCreators = await prisma.creator.findMany({ where: { status: 'inactive' } })
        const count = inactiveCreators.length
        const data = { inactiveCreators, count }
        res.status(200).json({ data })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// get temporary off creators
export const offCreators = async (req, res) => {
    try {
        const offCreators = await prisma.creator.findMany({ where: { status: 'temporary off' } })
        const count = offCreators.length
        const data = { offCreators, count }
        res.status(200).json({ data })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

//update remark of creator
export const updateRemarkCreator = async (req, res) => {
    try {
        const creatorId = +req.params.creatorId;
        const { remarks } = req.body;
        const updateRemark = await prisma.creator.update({ where: { id: creatorId }, data: { remarks: remarks } })

        // send mail to the creator
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${updateStatus.email}`,
            subject: 'Status has been changed',
            text: `Dear ${updateStatus.username} your remark is ${remarks}`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: `Status of ${updateStatus.username} changed but Email not sent` });
            } else {
                console.log('Email sent')
                res.status(200).json({ message: `Now Creator ${updateStatus.username} remark changed` })
            }
        })
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}


// actions on creator content



// filter old and new patients
export const filterPatient = async (req, res) => {
    try {
        const { new_patient } = req.query;
        const filteredPatients = await prisma.patient.findMany({ where: { new_patient }, include: { support: true } })
        const count = filteredPatients.length
        const data = { filteredPatients, count }
        res.status(200).json({ data })

    } catch (error) {
        console.log(error)
        res.status(400).json({ messages: error.message })
    }
}

// get all patients
export const allPatient = async (req, res) => {
    try {
        const allPatient = await prisma.patient.findMany({ include: { support: true } })
        const count = allPatient.length
        const data = { allPatient, count }
        res.status(200).json({ data })

    } catch (error) {
        console.log(error)
        res.status(400).json({ messages: error.message })
    }
}
// Action of Admin on content----------------------------------------------------------------------------


// publish,pending,unpublished,rejected,improve
// ---------------for articles 
export const articleAction = async (req, res) => {
    try {

        const creatorId = +req.params.creatorId;
        const articleId = +req.params.articleId;
        const { action } = req.query;

        //get email of creator
        const isCreator = await prisma.creator.findUnique({ where: { id: creatorId } })
        if (!isCreator) {
            return res.status(404).json({ message: 'Creator not found' })
        }

        // changed to publish
        const updateStatus = await prisma.article_content.update({
            where: { article_creatorId: creatorId, id: articleId },
            data: { verified: action }
        })

        //send email to creator
        if (action == 'improve') {
            const { reason } = req.body;
            const mailOptions = {
                from: process.env.ADMIN_EMAIL,
                to: `${isCreator.email}`,
                subject: 'Content Status has been changed',
                text: `Dear ${isCreator.username} your Article : ${updateStatus.heading} need improvement :  ${reason}   `
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ message: `Status of ${isCreator.username} changed but Email not sent` });
                } else {
                    console.log('Email sent')
                    res.status(200).json({ message: `Content of  ${isCreator.username} changed to ${action}` })
                }
            })
        }

        if (action == 'publish' || action == 'rejected' || action == 'unpublish' || action == 'pending') {
            const mailOptions = {
                from: process.env.ADMIN_EMAIL,
                to: `${isCreator.email}`,
                subject: 'Content Status has been changed',
                text: `Dear ${isCreator.username} your Article : ${updateStatus.heading} Status Changed to ${action}   `
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ message: `Status of ${isCreator.username} changed but Email not sent` });
                } else {
                    console.log('Email sent')
                    res.status(200).json({ message: `Content of  ${isCreator.username} changed to ${action}` })
                }
            })


        }


    } catch (error) {
        console.log(error)
        res.status(400).json({ messages: error.message })
    }
}

// ---------------for blogs
export const blogAction = async (req, res) => {
    try {

        const creatorId = +req.params.creatorId;
        const blogId = +req.params.blogId;
        const { action } = req.query;

        //get email of creator
        const isCreator = await prisma.creator.findUnique({ where: { id: creatorId } })
        if (!isCreator) {
            return res.status(404).json({ message: 'Creator not found' })
        }

        // changed to publish
        const updateStatus = await prisma.blog_content.update({
            where: { blog_creatorId: creatorId, id: blogId },
            data: { verified: action }
        })

        //send email to creator
        if (action == 'improve') {
            const { reason } = req.body;
            const mailOptions = {
                from: process.env.ADMIN_EMAIL,
                to: `${isCreator.email}`,
                subject: 'Content Status has been changed',
                text: `Dear ${isCreator.username} your Blog : ${updateStatus.heading} need improvement :  ${reason}   `
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ message: `Status of ${isCreator.username} changed but Email not sent` });
                } else {
                    console.log('Email sent')
                    res.status(200).json({ message: `Content of  ${isCreator.username} changed to ${action}` })
                }
            })
        }

        if (action == 'publish' || action == 'rejected' || action == 'unpublish' || action == 'pending') {
            const mailOptions = {
                from: process.env.ADMIN_EMAIL,
                to: `${isCreator.email}`,
                subject: 'Content Status has been changed',
                text: `Dear ${isCreator.username} your Blog : ${updateStatus.heading} Status Changed to ${action}   `
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ message: `Status of ${isCreator.username} changed but Email not sent` });
                } else {
                    console.log('Email sent')
                    res.status(200).json({ message: `Content of  ${isCreator.username} changed to ${action}` })
                }
            })


        }

    } catch (error) {
        console.log(error)
        res.status(400).json({ messages: error.message })
    }
}
// ---------------for yt content
export const ytAction = async (req, res) => {
    try {

        const creatorId = +req.params.creatorId;
        const ytId = +req.params.ytId;
        const { action } = req.query;

        //get email of creator
        const isCreator = await prisma.creator.findUnique({ where: { id: creatorId } })
        if (!isCreator) {
            return res.status(404).json({ message: 'Creator not found' })
        }

        // changed to publish
        const updateStatus = await prisma.yt_content.update({
            where: { yt_creatorId: creatorId, id: ytId },
            data: { verified: action }
        })

        //send email to creator
        if (action == 'improve') {
            const { reason } = req.body;
            const mailOptions = {
                from: process.env.ADMIN_EMAIL,
                to: `${isCreator.email}`,
                subject: 'Content Status has been changed',
                text: `Dear ${isCreator.username} your YouTube content : ${updateStatus.heading} need improvement :  ${reason}   `
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ message: `Status of ${isCreator.username} changed but Email not sent` });
                } else {
                    console.log('Email sent')
                    res.status(200).json({ message: `Content of  ${isCreator.username} changed to ${action}` })
                }
            })
        }

        if (action == 'publish' || action == 'rejected' || action == 'unpublish' || action == 'pending') {
            const mailOptions = {
                from: process.env.ADMIN_EMAIL,
                to: `${isCreator.email}`,
                subject: 'Content Status has been changed',
                text: `Dear ${isCreator.username} your YouTube : ${updateStatus.heading} Status Changed to ${action}   `
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ message: `Status of ${isCreator.username} changed but Email not sent` });
                } else {
                    console.log('Email sent')
                    res.status(200).json({ message: `Content of  ${isCreator.username} changed to ${action}` })
                }
            })
        }

    } catch (error) {
        console.log(error)
        res.status(400).json({ messages: error.message })
    }
}










// get content according to status------------------ pending,publish,rejected,
export const statusOfContent = async (req, res) => {

    try {
        const { status } = req.query;

        const yt = await prisma.yt_content.findMany({
            where: {
                verified: status
            }
        });

        const blog = await prisma.blog_content.findMany({
            where: {
                verified: status
            }
        });


        const articles = await prisma.article_content.findMany({
            where: {
                verified: status
            }
        });


        if (articles.length == 0 && blog == 0 && yt == 0) {
            return res.status(404).json({ message: `No ${status} content` })
        }

        const ytCount = yt.length
        const blogCount = blog.length
        const articleCount = articles.length


        const content = { articles, blog, yt, ytCount, blogCount, articleCount }
        res.status(200).json({ message: content })


    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}




// api to get  staff 
export const staff = async (req, res) => {
    try {

        const creators = await prisma.creator.findMany()
        const managers = await prisma.manager.findMany()
        const doctors = await prisma.doctor.findMany()

        const staff = { creators, managers, doctors }

        res.status(200).json({ staff })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}


export const allContentAdmin = async (req, res) => {
    try {

        const allYt = await prisma.yt_content.findMany()
        const allArticle = await prisma.article_content.findMany()
        const allBlog = await prisma.blog_content.findMany()

        res.status(200).json({ allYt, allArticle, allBlog })

    } catch (error) {
        res.status(500).res({ msg: 'Something went wrong' })
    }
}


// categories and their services
// ---to create category
export const category = async (req, res) => {
    try {
        const { name, assignedManager } = req.body
        const fileInfo = req.file

        const requiredField = ['name', 'assignedManager']
        for (const field of requiredField) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                return res.status(400).json({ status: 400, msg: `${requiredField} is required` })
            }
        }

        const fileSize = fileInfo.size / 1024 * 1024
        const fileType = fileInfo.mimetype

        if ((fileSize <= 2) && (fileType == 'image/png' || fileType == 'image/jpeg')) {
            return res.status(400).json({ status: 400, msg: 'File size must be less than 2MB and PNG/JPG' })
        }

        const data = { name, assignedManager, imagePath: fileInfo.path }

        const saved = await prisma.category.create(data)
        res.status(200).json({ status: 200, msg: 'Category is created Succesfully' })


    } catch (error) {
        return res.status(400).json({ msg: 'Something went wrong', err: error.message })
    }
}

// to update category
export const updateCategory = async (req, res) => {
    try {
        const { name, assignedManager } = req.body
        const categoryId = +req.params.categoryId
        const fileInfo = req.file;
        const updatedData = {}
        if (!id) {
            return res.status(400).json({ status: 400, msg: 'Id is required' })
        }
        if (name) {
            updatedData.name = name
        }
        if (assignedManager) {
            updatedData.assignedManager = assignedManager
        }
        if (fileInfo) {
            const fileSize = fileInfo.size / 1024 * 1024
            const fileType = fileInfo.mimetype

            if ((fileSize <= 2) && (fileType == 'image/png' || fileType == 'image/jpeg')) {
                return res.status(400).json({ status: 400, msg: 'File size must be less than 2MB and PNG/JPG' })
            }
            updatedData.imagePath = fileInfo.path
        }

        // update category
        const updateData = await prisma.category.update({ where: { id: categoryId }, data: { updatedData } })
        res.status(200).json({ status: 200, msg: 'Catagory Updated Succesfully' })
    } catch (error) {
        return res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}

// get all category
export const allCategory = async(req,res)=>{
    try {
        const allCategory  =  await prisma.category.findMany()
        if(allCategory.length==0){
            return res.status(404).json({status:400,msg:'No category found'})
        }
        const number = allCategory.length
        const data = {allCategory,number}
        res.status(200).json({status:200,msg:data})
        
    } catch (error) {
        
    }
}


// to delete category
export const categoryDelete = async (req, res) => {
    try {
        const categoryId = +req.params.categoryId

        const delCategory = await prisma.category.delete({ where: { id: categoryId } })

        if (!delCategory) {
            return res.status(404).json({ status: 404, msg: 'Category does not exist' })
        }

        res.status(200).json({ status: 200, msg: 'Catagory deleted successfully' })

    } catch (error) {
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}


// to create service of category
export const createService = async (req, res) => {
    try {
        const categoryId = +req.params.categoryId;
        const { title, description, tags, subtitle, what_we_will_discuss, benefits, language, duration } = req.body;
        const fileInfo = req.file;

        const requiredField = ['title', 'description', 'tags', 'subtitle', 'what_we_will_discuss', 'benefits', 'language', 'duration']
        for (const field of requiredField) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                return res.status(400).json({ status: 400, msg: `{} is required` })
            }
        }

        if (!fileInfo) {
            return res.status(400).json({ status: 400, msg: 'File is required' })
        }

        const fileSize = fileInfo.size / 1024 * 1024
        const fileType = fileInfo.mimetype

        if ((fileSize <= 2) && (fileType == 'image/png' || fileType == 'image/jpeg')) {
            return res.status(400).json({ status: 400, msg: 'File size must be less than 2MB and PNG/JPG' })
        }

        const data = { title, description, tags, subtitle, what_we_will_discuss, benefits, language, duration, categoryId, imagePath: fileInfo.path }

        const saveService = await prisma.service.create({ data })

    } catch (error) {
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}


// to update service of category
export const updateService = async (req, res) => {
    try {
        const serviceId = +req.params.serviceId;
        const { title, description, tags, subtitle, what_we_will_discuss, benefits, language, duration } = req.body;
        const fileInfo = req.file;

        const updatedData = {}

        if (title) {
            updatedData.title = title
        }

        if (description) {
            updatedData.description = description
        }

        if (tags) {
            updatedData.tags = tags
        }

        if (subtitle) {
            updatedData.subtitle = subtitle
        }

        if (what_we_will_discuss) {
            updatedData.what_we_will_discuss = what_we_will_discuss
        }

        if (benefits) {
            updatedData.benefits = benefits
        }

        if (language) {
            updatedData.language = language
        }

        if (duration) {
            updatedData.duration = duration
        }

        if (fileInfo) {
            const fileSize = fileInfo.size / 1024 * 1024
            const fileType = fileInfo.mimetype
            if ((fileSize <= 2) && (fileType == 'image/png' || fileType == 'image/jpeg')) {
                return res.status(400).json({ status: 400, msg: 'File size must be less than 2MB and PNG/JPG' })
            }
            updatedData.imagePath=fileInfo.path
        }

        // update service
        const updateService = await prisma.service.update({where:{id:serviceId},data:{updatedData}})

        res.status(200).json({status:200,json:'Service Updated Successfully'})

    } catch (error) {
           res.status(500).json({status:500,msg:'Something went wrong'})
    }
}



// to delete service
export const deleteService = async(req,res)=>{
    try {

        const serviceId = +req.query.params
        const deleteService = await prisma.service.delete({where:{id:serviceId}})
        res.status(200).json({status:200,msg:'Service deleted successfully'})
        
    } catch (error) {
        res.status(500).json({status:500,msg:'Something went wrong'})
    }
}

// get all service 
export const allService = async(req,res)=>{
    try {
        const allService = await prisma.service.findMany()
        const number = allService.length

        const data = {allService,number}

        if(allService.length == 0){
            return res.status(404).json({status:404,msg:data})
        }


        
    } catch (error) {
        res.status(500).json({status:500,msg:'Something went wrong'})
    }
}


// get service by category 
export const getServiceFromCategoryId = async(req,res)=>{
  try {
    const categoryId  = +req.params.categoryId;
    const category   = await prisma.service.findUnique({where:{categoryId}})

    res.status(200).json({status:200,msg:category})

  } catch (error) {
    res.status(500).json({status:500,msg:'Something went wrong'})
  }
}



