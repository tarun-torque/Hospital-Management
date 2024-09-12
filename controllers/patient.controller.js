import prisma from "../DB/db.config.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import transporter from "../utils/transporter.js";
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import exp from "constants";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// to add journal patient journal 
export const patientJournal = async(req,res)=>{
    const patientId = +req.params.patientId
    const {title,description} = req.body;
    try {
        if(!title){
            return res.status(400).json({status:400,msg:'Title is required'})
        }
        if(!description){
            return res.status(400).json({status:400,msg:'Description is required'})
        }

        const saveJournal = await prisma.journal.create({data:{patientId,title,description}})
         res.status(201).json({status:201,msg:'Journal is added'})

    } catch (error) {
        console.log(error)
        res.status(500).json({status:500,msg:'Something went wrong'})
    }
}

// to update journal
export const updateJounal = async(req,res)=>{
    const journalId = req.params.journalId
    const {title,description} = req.body
    try {
        const updatedData = {}
        if(title){
            updatedData.title=title
        }
        if(description){
            updatedData.description=description
        }

        if(Object.keys(updatedData).length===0){
            return res.status(400).json({ status:400,msg:'No fields to update' });
        }

        const updateJounal  = await prisma.journal.update({where:{id:journalId},data:{updatedData}})
        res.status(200).json({ status:200,msg:'Journal Updated Successfully' });

    } catch (error) {
        console.log(error)
        res.status(500).json({status:500,msg:'Something went wrong'})
    }
}

// to delete journal 
export const deleteJournal  = async(req,res)=>{
    const journalId = +req.params.journalId
    try {
        const deleteJournal = await prisma.journal.delete({where:{id:journalId}})
        if(! deleteJournal){
            return res.status(400).json({status:400,msg:'Journal does not exist'})
        }
        res.status(200).json({status:200,msg:'Journal deleted Successfully'})

    } catch (error) {
        console.log(error)
        res.status(500).json({status:500,msg:'Something went wrong'})
    }
}

// get all patient specific journal
export const patientJournalAll = async(req,res)=>{
    const patientId =  + req.params.patientId
    try {
        const journal = await prisma.journal.findMany({where:{patientId}})

        if(journal.length===0){
            return res.status(404).json({status:404,msg:'No Journal found'})
        }
        res.status(200).json({status:200,journal})

    } catch (error) {
        console.log(error)
        res.status(500).json({status:500,msg:'Something went wrong'})

    }
}




//rating to the docttor 
export const giveRatingToDoctor  = async(req,res)=>{
    const bookingId = +req.params.bookingId
    const patientId = +req.params.patientId
    const doctorId = +req.params.doctorId
    const {stars,review} =  req.body

    try {

        if(!stars){
            return res.status(400).json({status:400,msg:'Please give rating first'})
        }

        if(stars<1 || stars>5){
            return res.status(400).json({status:400,msg:'Give stars between 1 to 5'})
        }

        const existingRating = await prisma.rating.findUnique({
            where: {
              bookingId_patientId_doctorId: {
                bookingId,
                patientId,
                doctorId
              }
            }
          });
      
          if (existingRating) {
            return res.status(400).json({ status:400,msg: 'You have already rated' });
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

         res.status(201).json({status:201,msg:'Thanks for giving rating'})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({status:500,msg:'Something went wrong'})
    }
}



// signIn patient from google
export const signInPatientFromGoogle = async (req, res) => {
    const { username, email, profileUrl, fcmToken } = req.body;
    try {
        const requiredFields = ['username', 'email', 'fcmToken'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ status: 400, msg: `${field} is required` });
            }
        }

        let patient = await prisma.patientGoogleSingIn.findUnique({ where: { email } });

        const data = { username, email, profileUrl, fcmToken };
        const token = jwt.sign({ data }, process.env.SECRET_KEY, { expiresIn: '999h' });

        if (patient) {
          
            await prisma.patientGoogleSingIn.update({
                where: { email },
                data: { fcmToken }
            });
            return res.status(200).json({ status: 200, msg: 'Token refreshed', token });
        } else {
          
            await prisma.patientGoogleSingIn.create({ data });
            return res.status(201).json({ status: 201, msg: 'Profile created successfully', token });
        }

    } catch (error) {
        res.status(500).json({ status: 500, msg: error.message });
    }
};


export const getGooglePatientProfile = async(req,res)=>{
    const patinetId =  +req.params.patinetId;
    try {

        if(!patinetId){
            return res.status(400).json({status:400,msg:'Patinet id is required'})
        }
        const profile  = await prisma.patientGoogleSingIn.findUnique({where:{id:patinetId}})
        res.status(200).json({status:200,msg:profile})
    } catch (error) {
        
    }
}


// send OTP and verify OTP and then register user from a single route
export const test  = async(req,res)=>{
    try {
        const {email,otp,patient_name,username,country,contact_number,dob,gender,new_patient,password  } = req.body;

        if(!email && !otp && !patient_name  ){
            return res.status(400).json({status:400,msg:'Enter email'})
        }

        // for sending email
         if( 
            (email !==undefined && email !== null && email !=='') 
            && (otp===undefined || otp === null || otp ==='')
            && (patient_name===undefined || patient_name === null || patient_name ==='')
        ){

            const isEmail = await prisma.patient.findUnique({where:{email}})
            if(isEmail){
                    await prisma.patient.delete({where:{email}})
                    return res.status(400).json({status:400,msg:'Try again'})
            }
 

            const otpNumber = Math.floor(100000 + Math.random() * 900000).toString();
            const otpToken = jwt.sign({otpNumber},process.env.SECRET_KEY,{expiresIn:'2m'})

            const saveEmail = await prisma.patient.create({data:{email}})
            const saveOtpToken =  await prisma.patient.update({where:{email},data:{otp:otpToken}})
              
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

        transporter.sendMail (mailOptions, async(error, info) => {
            if (error) {
                await prisma.patient.delete({where:{email}})
                return res.status(400).json({msg:'OTP not sent'})
            } else {
                // await prisma.patient.update({where:{email},data:{email:null}})
                return res.status(200).json({msg:'OTP sent check your Email'})
            }
        });
        
    }
    

    // verify OTP
    else if(  
        (email !==undefined  && email !== null && email !=='') 
        && (otp!==undefined || otp !== null || otp !=='')
        && (patient_name===undefined || patient_name === null || patient_name ==='')
    ){
           try {
            const findOtp  = await prisma.patient.findUnique({where:{email}})
            const realOtp = findOtp.otp
            
            const decode = jwt.verify(realOtp,process.env.SECRET_KEY)
            if(decode.otpNumber==otp){
                await prisma.patient.update({where:{email},data:{emailVerified:'yes'}})
                return res.status(200).json({status:200,msg:"Email verified" })
            }
            if(decode.otpNumber !== otp){
                return res.status(400).json({status:400,msg:'OTP is invalid or expired'})
            }
            
           } catch (error) {
                  return res.status(400).json({status:400,msg:'OTP is invalid or expired'})
           }
        }

    // then register patient
        else if(  
            (email !==undefined || email !== null || email !=='') 
            && (otp!==undefined || otp !== null || otp !=='')
            && (patient_name!==undefined)
        ){
           const isEmailVerified = await prisma.patient.findUnique({where:{email}})
           if(isEmailVerified.emailVerified==='no'){
            return res.status(400).json({status:400,msg:'verify email first'})
           }
            const requiredField  = ['patient_name','username','country','contact_number','dob','gender','new_patient','password']
            for(const field of requiredField){
                if(req.body[field] === undefined || req.body[field]==='' || req.body[field]===null){
                    return res.status(400).json({status:400,msg:`${field} is required`})
                }
            }

            const salt  = bcrypt.genSalt(10)
            const hash_pass = bcrypt.hashSync(password,salt)

            const data = {patient_name,username,country,contact_number,dob,gender,new_patient,password:hash_pass}

            const token = jwt.sign(data,process.env.SECRET_KEY,{expiresIn:'999h'})
            const saveData = await prisma.patient.update({where:{email},data:data})
            res.status(200).json({status:200,msg:'Profile created',token})
        }
        
        
    } catch (error) {
        res.status(500).json({status:500,msg:'Something went wrong'})
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


      const mailSent =   transporter.sendMail (mailOptions, async(error, info) => {
            if (error) {
                return res.status(400).json({msg:'OTP not sent'})
            } else {
                return res.status(200).json({msg:'OTP sent check your Email'})
            }
        });




    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};


// verify otp
export const verifyPatientOTP = async (req, res, next) => {
    const email = req.params.email
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
export const registerPatient = async(req,res)=>{
    try {
        
        const {username,patient_name,country,contact_number,dob,gender,new_patient,password} = req.body
        const fileInfo =  req.file;
        const email = req.params.email

        const requiredField = ['username', 'patient_name', 'country', 'contact_number', 'dob', 'gender', 'new_patient', 'password']
        for (const field of requiredField){
            if(req.body[field]===undefined || req.body[field]==='' || req.body ===null ){
                return res.status(400).json({msg:`${field} is required`})
            }
        }

        const fileType = fileInfo.mimetype =='image/jpeg' || fileInfo.mimetype =='image/png'
        const fileSize = fileInfo.size / (1024 * 1024) <=2 


        if(!fileType || !fileSize){
            return res.status(400).json({msg:'File size must be less than 2 MB and PNG or JPG type'})
        }

        // hash password 
        const salt =  bcrypt.genSaltSync(10)
        const hash_pass=bcrypt.hashSync(password,salt)

        const data = {username,patient_name,country,contact_number,dob,gender,new_patient,password:hash_pass,profile_path:fileInfo.path,profileType:fileInfo.mimetype}
        const saveData = await prisma.patient.update({where:{email},data:{data}})

        res.send("saved")

    } catch (error) {
        res.status(400).json({msg:error.message})
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

// reset patient password  
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