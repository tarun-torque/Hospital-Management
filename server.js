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

if (cluster.isMaster) {
  console.log(`Master process is running with PID: ${process.pid}`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart a worker if it dies
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died, starting a new one...`);
    cluster.fork();
  });
}




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

app.listen(PORT, () => {
  console.log(`Worker ${process.pid} is listening on port ${PORT}`);
});
