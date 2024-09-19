const checkApiKey = (req, res, next) => {
        const providedApiKey = req.headers['x-api-key']
        const correctApiKey = process.env.API_KEY
    
        if (!providedApiKey) {
            return res.status(400).json({ status: 400, msg: 'CREDENTIALS MISSING OR INVALID' });
        }

        if (providedApiKey !== correctApiKey) {
            return res.status(403).json({ status: 403, msg: 'CREDENTIALS MISSING OR INVALID' });
        }
        next();
}
export default checkApiKey