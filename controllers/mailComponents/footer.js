import path from 'path'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import exp from 'constants'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const footer = () => {
    return
    `
 <p><a href="https://phoenix-sage.vercel.app/">Visit Our website</strong></a></p>

    <p>Follow us on Social Meadia :<br/>
    <img src="cid:insta" alt="insta icon" style="width: 30px; height: 30px;" />
    <img src="cid:fb" alt="fb icon" style="width:30px; height:30px" />
    <img src="cid:yt" alt="yt icon" style="width:30px; height:30px" />
  
     </p>
    <p>Best regards,<br>Kanika Jindal<br>Founder<br>example@gmail.com</p>
    
 `
}


export default footer