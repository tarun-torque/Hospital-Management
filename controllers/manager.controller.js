import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from '../DB/db.config'

// register manager
export const register_manager = async (req, res) => {
    try {
        // get info.
        // check manager is present or not 
        // encrypt password
        // save in db
        //send token

    } catch (error) {

    }

}

// login manager
export const login_manager = async(req,res)=>{
    // get info 
    // check present in db or not, compare password
    // generate token
}

// get creator of state
// approve creator
// approve their content 
// see views of approved content only their state
// reply to the support of their state only 


