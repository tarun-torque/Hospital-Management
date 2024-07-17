import jwt from 'jsonwebtoken'
import prisma from '../DB/db.config.js'
import nodemailer from 'nodemailer'
import 'dotenv/config'
import transporter from '../utils/transporter.js'
import bcrypt from 'bcryptjs'
import vine from '@vinejs/vine'
import contentCategory_validation from '../validations/validatons.js'
import { messages } from '@vinejs/vine/defaults'


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
        const isFile = (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpg') && ((req.file.size / (1024 * 1024)) <= 2)
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
        // check file
        const isFile = (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpg') && ((req.file.size / (1024 * 1024)) <= 2)
        if (!isFile) {
            return res.status(400).json({ message: 'Image should be jpg/png and size less than 2MB' })
        }
        const update = await prisma.contentCategory.update({ where: { id: CategoryId }, data: { category: category, description: description, image_path: req.file.path } })
        res.status(200).json({ message: 'Category has been updated' })
    } catch (error) {
        res.status(400).json({ message: error })
        console.log(error)
    }
}

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
        const data  =  {allCategory,categoriesCount}
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
        const checkFile = ((type == 'image/jpg' || type == 'image/png') && (size <= 2))
        if (!checkFile) {
            return res.status(400).json({ message: 'File Must be jpg/png and size less than 2MB' })
        }
        

        const data = { title, description, tags, subtitle, what_we_will_discuss, benefits, languages, duration:intDuration, imagePath: file.path }

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
        const file = req.file;
        const { title, description, tags, subtitle, what_we_will_discuss, benefits, languages, duration } = req.body;
        // check service image
        const type = file.mimetype;
        const size = file.size / (1024 * 1024)  //size in MB
        const checkFile = ((type == 'image/jpg' || type == 'image/png') && (size <= 2))
        if (!checkFile) {
            return res.status(400).json({ message: 'File Must be jpg/png and size less than 2MB' })
        }

        const data = { title, description, tags, subtitle, what_we_will_discuss, benefits, languages, duration, imagePath: file.path }
        const newService = await prisma.service.update({ where: { id: serviceId }, data: { data } })
        res.status(201).json({ message: 'service has been updated' })
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
 export const getService  = async(req,res)=>{
    try {
        const allServices = await prisma.service.findMany({include:{category:true}})
        const allCategory  = await prisma.category.findMany()
        const serviceCount =  allServices.length
        const categoriesCount = allCategory.length
        const data = {serviceCount,categoriesCount,allServices}

        res.status(200).json({data})
        
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
 }

// delete service 
export const deleteService = async(req,res)=>{
    try {
        const serviceId = +req.params.serviceId;
        const deleteService  = await prisma.service.delete({where:{id:serviceId}})
        const deleteCategory = await prisma.category.delete({where:{serviceId}})
        res.status(200).json({message:`Service ${deleteService.title} has been deleted`})
        
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// delete category of service
export const deleteCategoryService = async(req,res)=>{
    try {
        const serviceId = +req.params.serviceId;
        const categoryId = +req.params.categoryId;

        const deleteCategory  = await prisma.category.delete({where:{serviceId:serviceId,id:categoryId}})
        res.status(200).json({message:`Service Category ${deleteCategory.name} has been deleted`})
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

//create manager
export const register_manager = async (req, res) => {
    try {

        // get info.
        const { name, username, email, state, country, contact_number, password } = req.body;
        const fileInfo = req.file;

     
        // check manager is present or not 
        const isManager = await prisma.manager.findUnique({ where: { email } })
        if (isManager) {
            return res.status(400).json({ message: "Manager is already Present" })
        }

        // check file  
        const isFile = (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpg') && ((req.file.size / (1024 * 1024)) <= 2)

        if (!isFile) {
            return res.status(400).json({ message: 'Profile picture should be jpg/png and size less than 2MB' })
        }

        // encrypt password
        const salt = bcrypt.genSaltSync(10);
        const hash_pswd = bcrypt.hashSync(password, salt)
        // save in db
        const data = { name, username, email, state, country, contact_number:BigInt(contact_number), password: hash_pswd, profile_path: fileInfo.path }
        //send token
        const savedData = await prisma.manager.create({ data })
        // send token
        const token = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: '999h' })

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
// get manager
export const getAllManager = async(req,res)=>{
    try {

        const alllManager = await prisma.manager.findMany()
       
        res.status(200).json({alllManager})
        
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

//delete manager 
export const delete_manager = async(req,res)=>{
    try {
        const managerId  = +req.params.managerId;
        const deleteManager  = await prisma.manager.delete({where:{id:managerId}})
        res.status(200).json({message:`Manager ${deleteManager.name} has been deleted`})
    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// update manager
export const updateManager = async(req,res)=>{
    try {
        const managerId = +req.params.managerId;
        const { name, username, email, state, country, contact_number } = req.body;
        const fileInfo = req.file;

          // check file  
          const isFile = (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpg') && ((req.file.size / (1024 * 1024)) <= 2)

          if (!isFile) {
              return res.status(400).json({ message: 'Profile picture should be jpg/png and size less than 2MB' })
          }

          const updateManager = await prisma.manager.update({where:{id:managerId},data:{profile_path:fileInfo.path,name, username, email, state, country, contact_number:BigInt(contact_number)}})
          res.status(200).json({message:'Manager Profile has been updated'})

    } catch (error) {
        res.status(400).json({ message: 'something went wrong' })
        console.log(error)
    }
}

// register creator
export const creator_profile = async (req, res) => {
    try {
        // get data
        const { username, email, country, contact_number, state, language, password } = req.body;
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
        const isFile = (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpg') && ((req.file.size / (1024 * 1024)) <= 2)

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
