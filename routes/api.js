import { Router } from "express";
import multer from "multer";
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'
const router = Router()

import {create_yt_Content, create_blog_content, create_arcticle_content, get_all_content, get_profile, update_article, update_yt, update_blog, delete_yt, delete_article, delete_blog, search_creator, login_creator, stateContent, languagePost, categoryContent, get_blogs, eachBlog, eachArticle, eachYT, eachCreator } from "../controllers/creater.controller.js";
import { addDoctorService, adminSearchBar, allArticle, allBlog, allDoctors, allYt, bookSlot, completeDoctorProfile, creatorSearchBar, deleteDoctor_profile, deletePatientSupport, doctorLogin, DoctorOtpSend, doctorPrice, DoctorResetPassword, eachSupport, getAllAvailableSlots, getAllRecentTicket, getAvailableSlotsDoctor, getCategoriesByDoctorId, getDoctorPrice, getDoctorProfile, getDoctorsByServiceId, getServiceFromId, getServicesByDoctorId, getSlotsInOneHours, managerSearchBar, patientAllSupport, patientSupport, recentTicket, registerDoctor, registerPatient, searchDoctorAndServices, signInDoctorFromGoogle, trendingConsultant, upcomingSession, updateAvailability, updateDoctorPrice, updateDoctorProfile, updateDoctorRemarks, updateDoctorStatus, updateSupport, verifyDoctorOtp, verifyPatientOtp } from "../controllers/doctor.controller.js";
import { delete_support, deleteJournal, get_mood, get_support, getBookingOfPatient, getPatientProfile, giveRatingToDoctor, loginPatient, mood, otpSend, patientJournal, patientJournalAll, post_support, resetPassword, signInPatientFromGoogle, update_support, updateJounal, verifyPatientEmail, verifyPatientOTP } from "../controllers/patient.controller.js";
import { creator_profile,approveDoctorRequest, contentCategory, deleteCategory, getActiveDoctors, getApprovedDoctors, getInactiveDoctors, getPendingDoctors, getRejectedDoctors, getTemporaryoffDoctors, register_manager, rejectDoctor, getContentCategory, update_ContentCategory, getAllManager, delete_manager, updateManager, filterPatient, allPatient, getCreators, setInactiveManager, setOffManager, getActiveManager, getInactiveManager, getOffManager, setActiveManager, updateRemarks, deleteCreator, setInactiveCreator, setActiveCreator, setOffCreator, activeCreators, inactiveCreators, offCreators, updateRemarkCreator, assignManager_doctor, updateCreatorProfile,statusOfContent , articleAction, blogAction, ytAction, staff, allContentAdmin, category, updateCategory, allCategory, categoryDelete, createService, updateService, deleteService, allService, getServiceFromCategoryId, getServiceFromServiceId, topArticle, topBlogs, topYt, consultants, registeredUser, adminLogin, adminRegister, getAdminProfile, getCategoryFromCategoryId} from "../controllers/admin.controller.js";
import {eachManager, getContentByManager, getManagerReadNotification, getManagerUnreadNotification, login_manager } from "../controllers/manager.controller.js";
import { patientVideoCallStart, patinetDeclineVideoCall, testFirebase, testFirebasePatient } from "../controllers/push_notification/notification.js";


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
        else if(req.baseUrl==='/api/add/support/:patientId'){
            uploadPath = path.join(uploadPath,'supportImage')
        }
        else if(req.baseUrl==='/api/admin/register'){
            uploadPath = path.join(uploadPath,'profile')
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
router.get('/get/service/:serviceId',getServiceFromId)
router.get('/upcoming/session/:doctorId',upcomingSession)
router.get('/get/service/from/:doctorId',getServicesByDoctorId)
router.get('/get/doctor/from/:serviceId',getDoctorsByServiceId)


router.get('/get/all/yt',allYt)
router.get('/get/all/article',allArticle)
router.get('/get/all/blog',allBlog)


router.get('/get/all/docotors',allDoctors)
router.get('/search/doctors/services',searchDoctorAndServices)
router.post('/add/support/:patientId',upload.single('supportImage'),patientSupport)
router.delete('/delete/support/:supportId',deletePatientSupport)
router.get('/get/patient/support/:patientId',patientAllSupport)
router.get('/get/support/:supportId',eachSupport)
router.put('/update/support/:supportId',upload.single('supportImage'),updateSupport)


router.get('/trending/consultant',trendingConsultant)
router.get('/admin/search/bar',adminSearchBar)
router.get('/manager/:managerId/search/bar',managerSearchBar)
router.get('/creator/:creatorId/search/bar',creatorSearchBar)


router.post('/post/recent/ticket/:patientId',recentTicket)
router.get('/get/all/recent/ticket',getAllRecentTicket)


router.post('/doctor/add/service',addDoctorService)


// -------------------doctor add price 
router.post('/doctor/price/:doctorId/:serviceId',doctorPrice)
router.put('/doctor/update/price/:doctorId/:serviceId',updateDoctorPrice)
router.get('/get/doctor/price/:doctorId/:serviceId',getDoctorPrice)


// ------------
router.post('/give/rating/:bookingId/:patientId/:doctorId',giveRatingToDoctor)
router.post('/add/jounal/:patientId',patientJournal)
router.put('/update/journal/:journalId',updateJounal)
router.get('/get/patient/journal/:patientId',patientJournalAll)
router.delete('/delete/journal/:journalId',deleteJournal)


// doctor forgort password 
router.post('/doctor/forgot/password/send/otp',DoctorOtpSend)
router.post('/doctor/reset/password',DoctorResetPassword)


router.post('/doctor/login',doctorLogin)
router.put('/update/doctor/profile/:DoctorId',updateDoctorProfile)

router.delete('/delete/doctor/profile/:DoctorId',deleteDoctor_profile)
router.put('/update/status/:DoctorId',updateDoctorStatus)
router.put('/update/remarks/:DoctorId',updateDoctorRemarks)
router.post('/doctor/:doctorId/availability',updateAvailability)
router.get('/doctor/:doctorId/availability',getAvailableSlotsDoctor)
router.post('/booking/:patientId/:doctorId',bookSlot)






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
router.delete('/admin/delete/category/service/:categoryId',categoryDelete)

router.post('/admin/create/service/:categoryId',upload.single('serviceImage'),createService)
router.put('/admin/update/service/:serviceId',upload.single('serviceImage'),updateService)
router.delete('/admin/delete/service/:serviceId',deleteService)
router.get('/get/all/service',allService)
router.get('/get/service/by/:categoryId',getServiceFromCategoryId)
router.get('/get/service/:serviceId',getServiceFromServiceId)
router.get('/get/category/:categoryId',getCategoryFromCategoryId)



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
router.post('/manager/login',login_manager)
router.get('/get/manager/profile/:managerId',eachManager)
router.get('/manager/get/content',getContentByManager)

// admin login 
router.post('/admin/register',upload.single('profile'),adminRegister)
router.post('/admin/login',adminLogin)
router.get('/get/admin/profile/:adminId',getAdminProfile)

// notification
router.get('/get/booking/:patientId',getBookingOfPatient)

// to get category from doctor id :
router.get('/get/category/from/:doctorId',getCategoriesByDoctorId)


// doctor registration
router.post('/doctor/google/signIn',signInDoctorFromGoogle)
router.get('/get/doctor/profile/:doctorId',getDoctorProfile)
router.post('/register/doctor',registerDoctor)
router.post('/verify/doctor/otp',verifyDoctorOtp)
router.post('/doctor/:doctorId/completeProfile', upload.fields([{ name: 'doctorProfile' }, { name: 'doctorDocument' }]), completeDoctorProfile);


// patient registration
router.post('/patient/signIn/google',signInPatientFromGoogle)
router.get('/get/patient/profile/:patientId',getPatientProfile)
router.post('/register/patient',registerPatient)
router.post('/verify/patient/otp',verifyPatientOtp)





// managers Notification
router.get('/get/manager/:managerId/unread/notification',getManagerUnreadNotification)
router.get('/get/manager/:managerId/read/notification',getManagerReadNotification)


// test notification for patient app
router.get('/test/patinet',testFirebasePatient)
router.get('/test/firebase',testFirebase)
router.get('/notify/patient/:patientId/:bookingId/video/call/started',patientVideoCallStart)
router.get('/decline/doctor/call/:doctorId',patinetDeclineVideoCall)


// slots in one hours
router.get('/get/one/hours/slots/:doctorId',getSlotsInOneHours)

export default router
