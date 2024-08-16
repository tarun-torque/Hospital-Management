import jwt from 'jsonwebtoken'
import prisma from '../DB/db.config.js'
import nodemailer from 'nodemailer'
import 'dotenv/config'
import transporter from '../utils/transporter.js'
import bcrypt from 'bcryptjs'
import vine from '@vinejs/vine'
import contentCategory_validation from '../validations/validatons.js'
import { messages } from '@vinejs/vine/defaults'
import { json } from 'express'

// approve request of doctor
export const approveDoctorRequest = async (req, res) => {
    try {
        const DoctorId = +req.params.DoctorId;

        const verify = await prisma.doctor.update({ where: { id: DoctorId }, data: { verified: 'yes' } })

        // send mail to the doctor
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: `${verify.email}`,
            subject: `${verify.username},Congratulations from Harmony`,
            text: 'Grettings from Harmony,You request has been approved!'
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

// assign manager to approve doctors


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
            subject: `${rejected.username},Info. from Harmony`,
            text: reason
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

// create service 
export const createService = async (req, res) => {
    try {
        const { title, description, tags, subtitle, what_we_will_discuss, benefits, languages, duration } = req.body;
        const file = req.file;
        const intDuration = parseInt(duration)

        // check service image
        const type = file.mimetype;
        const size = file.size / (1024 * 1024)  //size in MB
        const checkFile = ((type == 'image/jpeg' || type == 'image/png') && (size <= 2))
        if (!checkFile) {
            return res.status(400).json({ message: 'File Must be jpg/png and size less than 2MB' })
        }


        const data = { title, description, tags, subtitle, what_we_will_discuss, benefits, languages, duration: intDuration, imagePath: file.path }

        const createService = await prisma.service.create({ data })
        res.status(201).json({ createService })
    }

    catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// create category of service
export const servieCategory = async (req, res) => {
    try {
        const serviceId = +req.params.serviceId;
        const { name, description } = req.body;
        const file = req.file;

        // check file
        const type = file.mimetype;
        const size = file.size / (1024 * 1024)  //size in MB
        const checkFile = ((type == 'image/jpg' || type == 'image/png') && (size <= 2))
        if (!checkFile) {
            return res.status(400).json({ message: 'File Must be jpg/png and size less than 2MB' })
        }

        const data = { serviceId: serviceId, name, description, coverPath: file.path }
        const Category = await prisma.category.create({ data })
        res.status(201).json({ message: 'Service Category has been added' })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// update service 
export const update_service = async (req, res) => {
    try {
        const serviceId = +req.params.serviceId;
        const fileInfo = req.file;
        const { title, description, tags, subtitle, what_we_will_discuss, benefits, languages, duration } = req.body;

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

        if (languages) {
            updatedData.languages = languages
        }

        if (duration) {
            updatedData.duration = parseInt(duration)
        }

        if (fileInfo) {

            // check service image
            const type = file.mimetype;
            const size = file.size / (1024 * 1024)  //size in MB
            const checkFile = ((type == 'image/jpg' || type == 'image/png') && (size <= 2))
            if (!checkFile) {
                return res.status(400).json({ message: 'File Must be jpg/png and size less than 2MB' })
            }
            updatedData.imagePath = fileInfo.path
        }

        console.log('Updated Data:', updatedData);

        if (Object.keys(updatedData).length === 0) {
            return res.status(404).json({ message: 'No valid field to update' })
        }

        const updateService = await prisma.service.update({ where: { id: serviceId }, data: updatedData })
        res.status(200).json({ message: 'service has been updated' })


    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// update category of service
export const update_serviceCategory = async (req, res) => {
    try {
        const serviceId = +req.params.serviceId;
        const { name, description } = req.body;
        const file = req.file;
        // check image
        const type = file.mimetype;
        const size = file.size / (1024 * 1024)  //size in MB
        const checkFile = ((type == 'image/jpg' || type == 'image/png') && (size <= 2))
        if (!checkFile) {
            return res.status(400).json({ message: 'File Must be jpg/png and size less than 2MB' })
        }

        const data = { serviceId: serviceId, name, description, coverPath: file.path }
        const updatedData = await prisma.category.update({ where: { serviceId }, data: { data } })
        res.status(200).json({ message: 'Service category has been updated' })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// get all service/categories and stats
export const getService = async (req, res) => {
    try {
        const allServices = await prisma.service.findMany()
        const allCategory = await prisma.category.findMany()
        const serviceCount = allServices.length
        const categoriesCount = allCategory.length
        const data = { serviceCount, categoriesCount, allServices }

        res.status(200).json({ data })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// delete service 
export const deleteService = async (req, res) => {
    try {
        const serviceId = +req.params.serviceId;
        const deleteService = await prisma.service.delete({ where: { id: serviceId } })
        const deleteCategory = await prisma.category.delete({ where: { serviceId } })
        res.status(200).json({ message: `Service ${deleteService.title} has been deleted` })

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// delete category of service
export const deleteCategoryService = async (req, res) => {
    try {
        const serviceId = +req.params.serviceId;
        const categoryId = +req.params.categoryId;

        const deleteCategory = await prisma.category.delete({ where: { serviceId: serviceId, id: categoryId } })
        res.status(200).json({ message: `Service Category ${deleteCategory.name} has been deleted` })
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
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
            text: `You are Manager in Harmony Your email is ${email} and Password is ${password}.Please Log in to start your journey `
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

        const alllManager = await prisma.manager.findMany({ include: { creators: true, doctors: true, service: true } })
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
        const deleteManager = await prisma.manager.delete({ where: { id: creatorId } })
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
        const blogId = +req.params.articleId;
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

        if (action == 'publish' || action == 'rejected' || action == 'unpublish' || action=='pending') {
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

        if (action == 'publish' || action == 'rejected' || action == 'unpublish' || action=='pending') {
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

        if (action == 'publish' || action == 'rejected' || action == 'unpublish' || action=='pending') {
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



