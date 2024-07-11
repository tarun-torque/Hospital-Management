import jwt from 'jsonwebtoken'
import prisma from '../DB/db.config.js'
import nodemailer from 'nodemailer'
import 'dotenv/config'
import transporter from '../utils/transporter.js' 
import bcrypt from 'bcryptjs'
import { messages } from '@vinejs/vine/defaults'


// approve request of doctor
export const approveDoctorRequest = async(req,res)=>{
    try {
        const DoctorId = +req.params.DoctorId;

        const verify = await prisma.doctor.update({where:{id:DoctorId},data:{verified:'yes'}}) 
      
        // send mail to the doctor
        const mailOptions = {
            from:process.env.ADMIN_EMAIL,
            to:`${verify.email}`,
            subject:`${verify.username},Congratulations from Harmony`,
            text:'Grettings from Harmony,You request has been approved!'
        }

        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error);
                res.status(500).json({message:`${verify.username} is verified but email not sent`});
            }else{
                console.log('Email sent')
                res.status(200).json({message:`${verify.username} is verified and sent succesfully`})
            }
        })

    } catch (error) {
        res.status(400).json({message:'Something went wromg'})
        console.log(error)
        
    }
}

// reject doctor request
export const rejectDoctor = async(req,res)=>{
    try {
        const DoctorId  = +req.params.DoctorId;
        const {reason} =  req.body;
        // update verified as rejected
        const rejected = await prisma.doctor.update({where:{id:DoctorId},data:{verified:'rejected'}})

        // send mail
        const mailOptions = {
            from:process.env.ADMIN_EMAIL,
            to:`${rejected.email}`,
            subject:`${rejected.username},Info. from Harmony`,
            text:reason
        }

        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error);
                res.status(500).json({message:`${rejected.username} is rejected but email not sent`});
            }else{
                console.log('Email sent')
                res.status(200).json({message:`${rejected.username} is rejected and email sent succesfully`})
            }
        })

    } catch (error) {
        res.status(400).json({message:'Something went wromg'})
        console.log(error)
    }
}

// get rejected doctors
export const getRejectedDoctors = async(req,res)=>{
    try {

        const rejectedDoctors  =  await prisma.doctor.findMany({where:{verified:'rejected'}})
        const count = rejectedDoctors.length
        const data = {count,rejectedDoctors}
        res.status(200).json({data})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Something went wrong'})
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
export const getApprovedDoctors  = async(req,res)=>{
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
export const getActiveDoctors  = async(req,res)=>{
    try {
        const activeDoctors  = await prisma.doctor.findMany({where:{verified:'yes',status:'active'}})
        const count = activeDoctors.length
        const data = {count,activeDoctors}
        res.status(200).json({data})
        
    } catch (error) {
        res.status(400).json({data:'Something went wrong'})
        console.log(error)
    }
}

// get inactive doctors list
export const getInactiveDoctors = async(req,res)=>{
    try {
        const InactiveDoctors  = await prisma.doctor.findMany({where:{verified:'yes',status:'inactive'}})
        const count = InactiveDoctors.length
        const data = {count,InactiveDoctors}
        res.status(200).json({data})
        
    } catch (error) {
        res.status(400).json({data:'Something went wrong'})
        console.log(error)
    }
}


// get temporary off doctors list 
export const getTemporaryoffDoctors  =async(req,res)=>{
    try {
        const temporayOffDoctors  = await prisma.doctor.findMany({where:{verified:'yes',status:'temporaryoff'}})
        const count = temporayOffDoctors.length
        const data = {count,temporayOffDoctors}
        res.status(200).json({data})
        
    } catch (error) {
        res.status(400).json({data:'Something went wrong'})
        console.log(error)
    }
}


// create content category
export const contentCategory = async(req,res)=>{
    try {
        const {category} = req.body;
        const data = {category}
        const createCategory = await prisma.contentCategory.create({data})
        res.status(201).json({message:`${category} has been added in Content Categories`})
        
    } catch (error) {
        res.status(400).json({message:'something went wrong'})
        console.log(error)
    }
}
// delete category
export const deleteCategory =  async(req,res)=>{
    try {
        const CategoryId  =  +req.params.CategoryId;
        const deleteCategory = await prisma.contentCategory.delete({where:{id:CategoryId}})
        res.status(200).json({message:`${deleteCategory.category} has been deleted`})

    } catch (error) {
        res.status(400).json({message:'something went wrong'})
        console.log(error)
    }
}



// create service 
export const createService = async(req,res)=>{
    try {
        const {title,description,tags,subtitle,what_we_will_discuss,benefits,languages,duration} = req.body;
        const file  = req.file;

        // check service image
        const  type = file.mimetype;
        const size = file.size/(1024*1024)  //size in MB
        const checkFile  = ( (type=='image/jpg' || type=='image/png') && (size<=2) )
        if(! checkFile){
            return res.status(400).json({message:'File Must be jpg/png and size less than 2MB'})
        }

        const data= {title,description,tags,subtitle,what_we_will_discuss,benefits,languages,duration,imagePath:file.path}

        const createService = await prisma.service.create({data})
        res.status(201).json({createService})
        }

     catch (error) {
        res.status(400).json({message:'something went wrong'})
        console.log(error)
    }
}


// create category of service
export const servieCategory = async(req,res)=>{
    try {
        const ServiceId = req.params.ServiceId;
        const {name,description} = req.body;
        const file=req.file;

        // check file
        const  type = file.mimetype;
        const size = file.size/(1024*1024)  //size in MB
        const checkFile  = ( (type=='image/jpg' || type=='image/png') && (size<=2) )
        if(! checkFile){
            return res.status(400).json({message:'File Must be jpg/png and size less than 2MB'})
        }

        const data={name,description,coverPath:file.path}
        const Category = await prisma.category.create({wh})

    } catch (error) {
        
    }
}

// admin create creator