import 'dotenv/config'
import express from 'express'
import ApiRoutes from './routes/api.js'
import cors from 'cors'

const app = express()

app.use(cors({
  origin: '' // Adjust this to match your Next.js server's URL
}));



app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use('/api',ApiRoutes)

const PORT = process.env.PORT || 4000

app.get('/',(req,res)=>{
  res.send('Hello server')
})

app.listen(PORT,()=>{
    console.log(`server is listening on port ${PORT}`);
})

