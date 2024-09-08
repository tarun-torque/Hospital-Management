import 'dotenv/config'
import express from 'express'
import ApiRoutes from './routes/api.js'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import os from 'os'

const num = os.cpus.length
console.log(num)

const __fileName = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__fileName)

const app = express()

app.use('/uploads',express.static(path.join(__dirname,'uploads')))


app.use(cors())
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

