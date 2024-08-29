import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from '../DB/db.config.js'

// login manager
export const login_manager = async(req,res)=>{
try {
    // get data
const {email,password} = req.body;
// check email and password
const isEmail = await prisma.manager.findUnique({where:{email}})
const isPassword = bcrypt.compareSync(password,isEmail.password)

if(isEmail || isPassword){
    return res.status(400).json({message:'Invalid Credentials'})
}

 const data = {
    id:isEmail.id,
    username:isEmail.username,
    profile_path:isEmail.profile_path,
    state:isEmail.state,
    country:isEmail.country,
    state:isEmail.state
}
// send token
const token  = jwt.sign(data,process.env.SECRET_KEY,{expiresIn:'999h'})
res.status(200).json({message:'Logged in Succesfully',token:token})
    
} catch (error) {
    console.log(error)
    res.status(400).json({message:'Something went wrong'})
    
}

}

// get each manager profile
export const eachManager = async(req,res)=>{
    try {
        const managerId = +req.params.managerId
        const manager = await prisma.manager.findUnique({where:{id:managerId}})
        
        if(! manager){
            return res.status(404).json({msg:'No Manager found'})
        }
        
        const assignedCreator = await prisma.creator.findMany({where:{assignedManager:manager.username}})

        res.status(200).json({manager,assignedCreator})
        
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}










// get creator of state
// approve creator
// approve their content 
// see views of approved content only their state
// reply to the support of their state only 


