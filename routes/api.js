import { Router } from "express";
import multer from "multer";
import path from 'path'
import fs from 'fs'
const router = Router()


import {create_yt_Content, create_blog_content, create_arcticle_content, get_all_content, get_profile, update_article, update_yt, update_blog, delete_yt, delete_article, delete_blog, search_creator, login_creator, stateContent, languagePost, categoryContent, get_blogs, eachBlog, eachArticle, eachYT, eachCreator } from "../controllers/creater.controller.js";
import { bookSlot, CreateDoctor_profile, deleteDoctor_profile, doctorLogin, getAllAvailableSlots, getAvailableSlotsDoctor, updateAvailability, updateDoctorProfile, updateDoctorRemarks, updateDoctorStatus } from "../controllers/doctor.controller.js";
import { delete_support, get_mood, get_support, getGooglePatientProfile, loginPatient, mood, otpSend, post_support, registerPatient, resetPassword, signInPatientFromGoogle, test, update_support, verifyPatientEmail, verifyPatientOTP } from "../controllers/patient.controller.js";
import { creator_profile,approveDoctorRequest, contentCategory, deleteCategory, getActiveDoctors, getApprovedDoctors, getInactiveDoctors, getPendingDoctors, getRejectedDoctors, getTemporaryoffDoctors, register_manager, rejectDoctor, getContentCategory, update_ContentCategory, getAllManager, delete_manager, updateManager, filterPatient, allPatient, getCreators, setInactiveManager, setOffManager, getActiveManager, getInactiveManager, getOffManager, setActiveManager, updateRemarks, deleteCreator, setInactiveCreator, setActiveCreator, setOffCreator, activeCreators, inactiveCreators, offCreators, updateRemarkCreator, assignManager_doctor, updateCreatorProfile,statusOfContent , articleAction, blogAction, ytAction, staff, allContentAdmin, category, updateCategory, allCategory, categoryDelete, createService, updateService, deleteService, allService, getServiceFromCategoryId, getServiceFromServiceId, topArticle, topBlogs, topYt, consultants, registeredUser} from "../controllers/admin.controller.js";
import {eachManager, getContentByManager, login_manager } from "../controllers/manager.controller.js";
import { sendNotificationsPatientDoctor, testFirbase } from "../controllers/push_notification/notification.js";


// to make dynamic directory
function ensureDirectoryExistence(filePath){
    const dirname = path.dirname(filePath);
    if(fs.existsSync(dirname)){
        return true;
    }
    ensureDirectoryExistence(dirname)
    fs.mkdirSync(dirname)  
}
// multer storage
const storage  = multer.diskStorage({
    destination:function(req,file,cb){
        let uploadPath = './uploads';

         if(req.baseUrl==='/api/admin/create/content/category'){
            uploadPath = path.join(uploadPath,'contentCategoryImage')
        }
        else if(req.baseUrl==='/api/admin/create/category'){
            uploadPath = path.join(uploadPath,'category')
        }
        else if(req.baseUrl==='/api/admin/create/category'){
            uploadPath = path.join(uploadPath,'service')
        }
        else if(req.baseUrl==='/api/admin/create/manager'){
            uploadPath = path.join(uploadPath,'managerProfile')
        }
        else if(req.baseUrl==='/api/create/patient/profile'){
            uploadPath = path.join(uploadPath,'patientProfile')
        }
        else if(req.baseUrl==='/api/createDoctorProfile'){
            uploadPath = path.join(uploadPath,'doctorProfile')
        }
        else if(req.baseUrl==='/api/admin/creatorProfile'){
            uploadPath = path.join(uploadPath,'creatorProfile')
        }
        else if(req.baseUrl==='/api/user/:id/createArticleContent'){
            uploadPath = path.join(uploadPath,'articleImage')
        }
        
        cb(null,uploadPath)
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname)
    }
})

// filter file types 
const fileFilter = function(req,file,cb){
    if(file.mimetype==='image/jpeg' ||file.mimetype==='image/png' || file.mimetype==='application/zip'){
        cb(null,true)
    }else{
        cb(new Error('Only JPG,PNG or Zip files are allowed'),false)
    }
}


const upload = multer({storage:storage,fileFilter:fileFilter})

// creator api
router.post('/login/creator',login_creator)
router.post('/user/:id/createYtContent', create_yt_Content)
router.post('/user/:id/createBlogContent', create_blog_content)
router.post('/user/:id/createArticleContent',upload.single('articleImage') , create_arcticle_content)
router.get('/user/:id/getProfile',get_profile)
router.get('/user/:id/getAllContent', get_all_content)   //except blog content 
router.get('/user/get/blogs/:id',get_blogs)
router.put('/user/:userId/updateArticle/:articleId',upload.single('articleImage'),update_article)
router.put('/user/:creatorId/updateYt/:ytId', update_yt)
router.put('/user/:creatorId/updateBlog/:blogId',update_blog)
router.delete('/user/:creatorId/deleteYt/:ytId', delete_yt)
router.delete('/user/:creatorId/deleteArticle/:articleId', delete_article)
router.delete('/user/:creatorId/deleteBlog/:blogId', delete_blog)
router.get('/searchCreator', search_creator)
router.get('/state/content',stateContent)
router.get('/filter/language/content',languagePost)
router.get('/filter/category/content',categoryContent)
router.get('/get/blog/:blogId',eachBlog)
router.get('/get/article/:articleId',eachArticle)
router.get('/get/yt/:ytId',eachYT)
router.get('/get/creator/profile/:creatorId',eachCreator)


// doctor api
router.post('/createDoctorProfile', upload.fields([{ name: 'doctorProfile', maxCount: 1 }, { name: 'doctorDocument', maxCount: 1 }]), CreateDoctor_profile)
router.post('/doctor/login',doctorLogin)
router.put('/update/doctor/profile/:DoctorId',updateDoctorProfile)
router.delete('/delete/doctor/profile/:DoctorId',deleteDoctor_profile)
router.put('/update/status/:DoctorId',updateDoctorStatus)
router.put('/update/remarks/:DoctorId',updateDoctorRemarks)
router.post('/doctor/:doctorId/availability',updateAvailability)
router.get('/doctor/:doctorId/availability',getAvailableSlotsDoctor)
router.post('/booking/:patientId/:doctorId',bookSlot)
router.get('/get/all/slots',getAllAvailableSlots)


// patient api
router.post('/test',test)


router.post('/verify/patient/mail',verifyPatientEmail)
router.post('/verify/patient/otp/:email',verifyPatientOTP)
router.post('/create/patient/profile/:email',registerPatient)

router.post('/patient/signIn/google',signInPatientFromGoogle)
router.get('/get/patient/from/google/:patinetId',getGooglePatientProfile)

router.post('/login/patient',loginPatient)
router.post('/:patientId/support',post_support)
router.put('/update/:patientId/:supportId',update_support)
router.get('/get/support/:id',get_support)
router.delete('/delete/:supportId',delete_support)
router.post('/mood/:patientId',mood)
router.get('/get/:patientId/mood',get_mood)
router.post('/forgot/password',otpSend)
router.post('/reset/password',resetPassword)


// admin routes
//-----doctor api
router.put('/admin/approveDoctorRequest/:DoctorId',approveDoctorRequest)
router.put('/admin/assign/manager/doctor/:doctorId',assignManager_doctor)
router.put('/admin/reject/doctor/request/:DoctorId',rejectDoctor)
router.get('/admin/getPendingDoctors',getPendingDoctors)
router.get('/admin/get/rejectedDoctors',getRejectedDoctors)
router.get('/admin/getApprovedDoctors',getApprovedDoctors)
router.get('/admin/get/active/doctors',getActiveDoctors)
router.get('/admin/get/inactive/doctors',getInactiveDoctors)
router.get('/admin/get/temporaryoff/doctors',getTemporaryoffDoctors)


//admin -----category/category services and content category
router.post('/admin/create/content/category',upload.single('contentCategoryImage'),contentCategory)
router.get('/all/content/categories',getContentCategory)
router.delete('/admin/delete/category/:CategoryId',deleteCategory)
router.put('/admin/update/category/:CategoryId',upload.single('contentCategoryImage'),update_ContentCategory)

router.post('/admin/create/category',upload.single('categoryImage'),category)
router.put('/admin/update/service/category/:categoryId',upload.single('categoryImage'),updateCategory)
router.get('/get/all/category',allCategory)
router.delete('/admin/delete/category/:categoryId',categoryDelete)


router.post('/admin/create/service/:categoryId',upload.single('serviceImage'),createService)
router.put('/admin/update/service/:serviceId',upload.single('serviceImage'),updateService)
router.delete('/admin/delte/service/:serviceId',deleteService)
router.get('/get/all/service',allService)
router.get('/get/service/by/:categoryId',getServiceFromCategoryId)
router.get('/get/service/:serviceId',getServiceFromServiceId)



// admin-----creator api
router.post('/admin/creatorProfile',upload.single('creator_picture'),creator_profile)
router.put('/admin/update/creator/profile/:creatorId',upload.single('creator_picture'),updateCreatorProfile)
router.get('/admin/get/all/creators',getCreators)
router.delete('/admin/delete/creator/:creatorId',deleteCreator)
router.put('/admin/creator/status/inactive/:creatorId',setInactiveCreator)
router.put('/admin/creator/status/active/:creatorId',setActiveCreator)
router.put('/admin/creator/status/temporaryoff/:creatorId',setOffCreator)
router.get('/admin/get/active/creator',activeCreators)
router.get('/admin/get/inactive/creator',inactiveCreators)
router.get('/admin/get/off/creator',offCreators)
router.put('/admin/update/remarks/:creatorId',updateRemarkCreator)
router.get('/get/content/status',statusOfContent)
router.put('/article/action/:creatorId/:articleId',articleAction)
router.put('/blog/action/:creatorId/:blogId',blogAction)
router.put('/yt/action/:creatorId/:ytId',ytAction)
router.get('/admin/get/all/content',allContentAdmin)

router.get('/admin/get/top/articles',topArticle)
router.get('/admin/get/top/blogs',topBlogs)
router.get('/admin/get/top/yt',topYt)
router.get('/admin/consultants/stats',consultants)
router.get('/admin/registered/user',registeredUser)


// admin----manager api
router.post('/admin/create/manager',upload.single('managerProfile'),register_manager); 
router.delete('/admin/delete/manager/:managerId',delete_manager)
router.put('/admin/update/manager/:managerId',upload.single('managerProfile'),updateManager)
router.put('/admin/manager/status/inactive/:managerId',setInactiveManager)
router.put('/admin/manager/status/temporaryoff/:managerId',setOffManager)
router.put('/admin/manager/status/active/:managerId',setActiveManager)
router.get('/admin/get/all/manager',getAllManager)
router.get('/admin/get/active/manager',getActiveManager)
router.get('/admin/get/inactive/manager',getInactiveManager)
router.get('/admin/get/off/manager',getOffManager)
router.put('/admin/update/remarks/:managerId',updateRemarks)


// admin -patient routes
router.get('/admin/filter/patient',filterPatient);
router.get('/admin/all/patients',allPatient)

// admin get Api of staff
router.get('/admin/get/staff',staff)

// manager API
router.post('/manager/login',login_manager);
router.get('/get/manager/profile/:managerId',eachManager)
router.get('/manager/get/content',getContentByManager)



// notification
router.get('/test/firebase',testFirbase)
router.post('/send/notification/patient/doctor',sendNotificationsPatientDoctor)


export default router
