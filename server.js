import 'dotenv/config'
import express from 'express'
import ApiRoutes from './routes/api.js'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import numCPUs from 'os'
import cluster from 'cluster'
import http from 'http'
import process from 'process'
import checkApiKey from './middleware/apiKey.js'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import { reminderAutomate } from './controllers/reminder/reminder.js'


const ncpus = numCPUs.cpus().length
// console.log(ncpus)


if(cluster.isPrimary){
  for(let i=0;i<ncpus;i++){
    cluster.fork()
  }
}else{


  const __fileName = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__fileName)
  
  const app = express()
  
  app.use('/uploads',express.static(path.join(__dirname,'uploads')))
  
  app.use(helmet())
  app.use(cors())
  app.use(bodyParser.json())
  app.use(express.json())
  app.use(express.urlencoded({extended:false}))
  app.use('/api',checkApiKey,ApiRoutes)
  
  const PORT = process.env.PORT || 4000
  
  app.get('/',(req,res)=>{
    res.send(`hello world on process id  ${process.pid}`)
  })
  
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}