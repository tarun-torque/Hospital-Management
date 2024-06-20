import { messages } from "@vinejs/vine/defaults";
import prisma from "../DB/db.config.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


// register patient 
export const registerPatient = async (req, res) => {
    // req.body and file
    const { username, patient_name, email, profile_path, profileType, country_code, contact_number, dob, gender, new_patient, password } = req.body;
    const fileInfo = req.file

    //   check user is present or not
    // const isUsername = await prisma.patient.findUnique({ where: { username } })
    // const isEmail = await prisma.patient.findUnique({ where: { email } })
    // if ((isUsername) || isEmail) {
    //     return res.status(409).json({ message: 'Patient is already Registered' })
    // }




    //if user is not present
    // hash password
    const salt = bcrypt.genSaltSync(10)
    const hash_pswd = bcrypt.hashSync(password, salt)
    // check profile size and type

    // save in db
    const data = {
        username,
        patient_name,
        email,
        profile_path: fileInfo.path,
        profileType: fileInfo.mimetype,
        contact_number,
        country_code,
        dob,
        gender,
        new_patient,
        password: hash_pswd
    }
    // generate token
    
    // send token
    res.send(fileInfo)




}

// login patient 
export const loginPatient = async (req, res) => {

}


// update patient profile


//delete patient profile


// filter old patients
export const oldPatients = async (req, res) => {

}

// filter new patients
export const newPatients = async (req, res) => {

}



// post support
// update support
// get support
// post mood of patient
// get mood patient





