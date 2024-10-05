import 'dotenv/config'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import prisma from '../DB/db.config.js'

export const patientAuthInfo = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '').trim();

        if (!token) {
            return res.status(401).json({ status: 401, msg: 'Please login first' });
        }
        console.log("Token received:", token)

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
    windowMs: 24 * 60 * 60 * 1000,
    max: 1,
    message: 'You can only send one request per day.',
    keyGenerator: (req) => req.user?.id || req.ip,
    handler: (req, res, next, options) => {
        console.log(`Rate limit exceeded for user: ${req.user?.id || req.ip}`);
        res.status(options.statusCode).json({
            message: options.message
        });
    },
    standardHeaders: true,
    legacyHeaders: false
})

// create continum
export const createContinum = async (req, res) => {
    const patientId = +req.params.patientId
    const { value } = req.body
    try {
        if (!value) {
            res.status(400).json({ status: 400, msg: 'Value is Required' })
        }
        const createContt = await prisma.continum.create({ data: { value, patientId } })
        res.status(200).json({ status: 200, msg: 'Your Continumm saved ' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}


// get continumm
export const getContinum = async (req, res) => {
    const patientId = +req.params.patientId
    try {
        const continumEntries = await prisma.continum.findMany({
            where: { patientId },
            select: { value: true },
        })

        const valueCounts = continumEntries.reduce((acc, entry) => {
            acc[entry.value] = (acc[entry.value] || 0) + 1
            return acc
        }, {})


        let mostRepeatedValue = null
        let maxCount = 0

        for (const [value, count] of Object.entries(valueCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostRepeatedValue = value;
            }
        }

        // If no value is repeated
        if (maxCount <= 1) {
            mostRepeatedValue = 2;
        }

        res.status(200).json({ status: 500, msg: mostRepeatedValue })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, msg: 'Something went wrong' })
    }
}