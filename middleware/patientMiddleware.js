import 'dotenv/config'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'

export const patientAuthInfo = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '').trim();

        if (!token) {
            return res.status(401).json({ status: 401, msg: 'Please login first' });
        }

        console.log("Token received:", token);

        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
        console.log("Token verification successful");

        req.user = verifyToken
        next();
    } catch (error) {
        console.error("Error during token verification:", error);
        res.status(401).json({ status: 401, msg: 'Invalid or expired token' });
    }
}


export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  
    max: 2,  
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,  
    legacyHeaders: false, 
    handler: (req, res, next, options) => {
   
        console.log(`Rate limit exceeded for IP: ${req.ip}`);


        res.status(options.statusCode).json({
            message: options.message
        });
    }
})

export const check  =async(req,res)=>{
  res.send('this is limit api')
}