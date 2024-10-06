import { Router } from "express";
import multer from "multer";
import path from 'path'
import fs from 'fs'
const router = Router()

import { create_yt_Content, create_blog_content, create_arcticle_content, get_all_content, get_profile, update_article, update_yt, update_blog, delete_yt, delete_article, delete_blog, search_creator, login_creator, stateContent, languagePost, categoryContent, get_blogs, eachBlog, eachArticle, eachYT, eachCreator, creatorSearchBar } from "../controllers/creater.controller.js";
import { addDoctorService, adminSearchBar, allArticle, allBlog, allDoctors, allYt, bookSlot, completeDoctorProfile, deleteAllAvailableSlots, deleteDoctor_profile, deletePatientSupport, doctorDashboardStats, doctorLogin, DoctorOtpSend, doctorPrice, doctorSessionHistory, doctorVerifyForgotOtp, eachSupport, getAllAvailableSlots, getAllRecentTicket, getAvailableSlotsDoctor, getCategoriesByDoctorId, getDoctorPrice, getDoctorProfile, getDoctorsByServiceId, getOneHourSlots, getReviewsFromDoctorId, getServiceFromId, getServicesByDoctorId, isBookingCompleted, managerSearchBar, patientAllSupport, patientSupport, recentTicket, registerDoctor, registerPatient, resetDoctorPassword, searchDoctorAndServices, signInDoctorFromGoogle, trendingConsultant, upcomingSession, updateAvailability, updateDoctorPrice, updateDoctorProfile, updateDoctorRemarks, updateDoctorStatus, updateSupport, verifyDoctorOtp, verifyPatientOtp } from "../controllers/doctor.controller.js";
import { delete_support, deleteJournal, get_mood, get_support, getBookingOfPatient, getPatientProfile, giveRatingToDoctor, loginPatient, mood, otpSend, patientDashboardStats, patientJournal, patientJournalAll, patientSessionHistory, patientUpcomingSessions, patientVerifyForgotOtp, post_support, rescheduleBooking, resetPatientPassword, signInPatientFromGoogle, update_support, updateJounal, updatePatientProfile } from "../controllers/patient.controller.js";
import { creator_profile, approveDoctorRequest, contentCategory, deleteCategory, getActiveDoctors, getApprovedDoctors, getInactiveDoctors, getPendingDoctors, getRejectedDoctors, getTemporaryoffDoctors, register_manager, rejectDoctor, getContentCategory, update_ContentCategory, getAllManager, delete_manager, updateManager, filterPatient, allPatient, getCreators, setInactiveManager, setOffManager, getActiveManager, getInactiveManager, getOffManager, setActiveManager, updateRemarks, deleteCreator, setInactiveCreator, setActiveCreator, setOffCreator, activeCreators, inactiveCreators, offCreators, updateRemarkCreator, assignManager_doctor, updateCreatorProfile, statusOfContent, articleAction, blogAction, ytAction, staff, allContentAdmin, category, updateCategory, allCategory, categoryDelete, createService, updateService, deleteService, allService, getServiceFromCategoryId, getServiceFromServiceId, topArticle, topBlogs, topYt, consultants, registeredUser, adminLogin, adminRegister, getAdminProfile, getCategoryFromCategoryId } from "../controllers/admin.controller.js";
import { eachManager, getContentByManager, getManagerReadNotification, getManagerUnreadNotification, login_manager } from "../controllers/manager.controller.js";
import { patientVideoCallStart, patinetDeclineVideoCall, testFirebase, testFirebasePatient } from "../controllers/push_notification/notification.js";
import { apiLimiter, createContinum, getContinum, patientAuthInfo } from "../middleware/patientMiddleware.js";

// to make dynamic directory
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname)
    fs.mkdirSync(dirname)
}
// multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = './uploads';

        if (req.baseUrl === '/api/admin/create/content/category') {
            uploadPath = path.join(uploadPath, 'contentCategoryImage')
        }
        else if (req.baseUrl === '/api/admin/create/category') {
            uploadPath = path.join(uploadPath, 'category')
        }
        else if (req.baseUrl === '/api/admin/create/category') {
            uploadPath = path.join(uploadPath, 'service')
        }
        else if (req.baseUrl === '/api/admin/create/manager') {
            uploadPath = path.join(uploadPath, 'managerProfile')
        }
        else if (req.baseUrl === '/api/create/patient/profile') {
            uploadPath = path.join(uploadPath, 'patientProfile')
        }
        else if (req.baseUrl === '/api/createDoctorProfile') {
            uploadPath = path.join(uploadPath, 'doctorProfile')
        }
        else if (req.baseUrl === '/api/admin/creatorProfile') {
            uploadPath = path.join(uploadPath, 'creatorProfile')
        }
        else if (req.baseUrl === '/api/user/:id/createArticleContent') {
            uploadPath = path.join(uploadPath, 'articleImage')
        }
        else if (req.baseUrl === '/api/add/support/:patientId') {
            uploadPath = path.join(uploadPath, 'supportImage')
        }
        else if (req.baseUrl === '/api/admin/register') {
            uploadPath = path.join(uploadPath, 'profile')
        }

        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

// filter file types 
const fileFilter = function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/zip') {
        cb(null, true)
    } else {
        cb(new Error('Only JPG,PNG or Zip files are allowed'), false)
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter })


//                                 CREATOR APIs---->
router.post('/login/creator', login_creator)
router.get('/creator/:creatorId/search/bar', creatorSearchBar)
router.post('/user/:id/createYtContent', create_yt_Content)
router.post('/user/:id/createBlogContent', create_blog_content)
router.post('/user/:id/createArticleContent', upload.single('articleImage'), create_arcticle_content)
router.get('/user/:id/getProfile', get_profile)
router.get('/user/:id/getAllContent', get_all_content)   //except blog content 
router.get('/user/get/blogs/:id', get_blogs)
router.put('/user/:userId/updateArticle/:articleId', upload.single('articleImage'), update_article)
router.put('/user/:creatorId/updateYt/:ytId', update_yt)
router.put('/user/:creatorId/updateBlog/:blogId', update_blog)
router.delete('/user/:creatorId/deleteYt/:ytId', delete_yt)
router.delete('/user/:creatorId/deleteArticle/:articleId', delete_article)
router.delete('/user/:creatorId/deleteBlog/:blogId', delete_blog)
router.get('/searchCreator', search_creator)
router.get('/state/content', stateContent)
router.get('/filter/language/content', languagePost)
router.get('/filter/category/content', categoryContent)
router.get('/get/blog/:blogId', eachBlog)
router.get('/get/article/:articleId', eachArticle)
router.get('/get/yt/:ytId', eachYT)
router.get('/get/creator/profile/:creatorId', eachCreator)
router.get('/get/all/yt', allYt)
router.get('/get/all/article', allArticle)
router.get('/get/all/blog', allBlog)




//                                ADMIN APIs --->
router.get('/admin/search/bar', adminSearchBar)
router.post('/admin/register', upload.single('profile'), adminRegister)
router.post('/admin/login', adminLogin)
router.get('/get/admin/profile/:adminId', getAdminProfile)
router.get('/admin/get/staff', staff)

// ---->  ADMIN -->  DOCTOR APIs
router.put('/admin/approveDoctorRequest/:DoctorId', approveDoctorRequest)
router.put('/admin/assign/manager/doctor/:doctorId', assignManager_doctor)
router.put('/admin/reject/doctor/request/:DoctorId', rejectDoctor)
router.get('/admin/getPendingDoctors', getPendingDoctors)
router.get('/admin/get/rejectedDoctors', getRejectedDoctors)
router.get('/admin/getApprovedDoctors', getApprovedDoctors)
router.get('/admin/get/active/doctors', getActiveDoctors)
router.get('/admin/get/inactive/doctors', getInactiveDoctors)
router.get('/admin/get/temporaryoff/doctors', getTemporaryoffDoctors)

//--->    CATEGORIES AND THEIR SERVICES
router.post('/admin/create/content/category', upload.single('contentCategoryImage'), contentCategory)
router.get('/all/content/categories', getContentCategory)
router.delete('/admin/delete/category/:CategoryId', deleteCategory)
router.put('/admin/update/category/:CategoryId', upload.single('contentCategoryImage'), update_ContentCategory)

router.post('/admin/create/category', upload.single('categoryImage'), category)
router.put('/admin/update/service/category/:categoryId', upload.single('categoryImage'), updateCategory)
router.get('/get/all/category', allCategory)
router.delete('/admin/delete/category/service/:categoryId', categoryDelete)

router.post('/admin/create/service/:categoryId', upload.single('serviceImage'), createService)
router.put('/admin/update/service/:serviceId', upload.single('serviceImage'), updateService)
router.delete('/admin/delete/service/:serviceId', deleteService)
router.get('/get/all/service', allService)
router.get('/get/service/by/:categoryId', getServiceFromCategoryId)
router.get('/get/service/:serviceId', getServiceFromServiceId)
router.get('/get/category/:categoryId', getCategoryFromCategoryId)


// --->  ADMIN ---> CREATOR APIs
router.post('/admin/creatorProfile', upload.single('creator_picture'), creator_profile)
router.put('/admin/update/creator/profile/:creatorId', upload.single('creator_picture'), updateCreatorProfile)
router.get('/admin/get/all/creators', getCreators)
router.delete('/admin/delete/creator/:creatorId', deleteCreator)
router.put('/admin/creator/status/inactive/:creatorId', setInactiveCreator)
router.put('/admin/creator/status/active/:creatorId', setActiveCreator)
router.put('/admin/creator/status/temporaryoff/:creatorId', setOffCreator)
router.get('/admin/get/active/creator', activeCreators)
router.get('/admin/get/inactive/creator', inactiveCreators)
router.get('/admin/get/off/creator', offCreators)
router.put('/admin/update/remarks/:creatorId', updateRemarkCreator)
router.get('/get/content/status', statusOfContent)
router.put('/article/action/:creatorId/:articleId', articleAction)
router.put('/blog/action/:creatorId/:blogId', blogAction)
router.put('/yt/action/:creatorId/:ytId', ytAction)
router.get('/admin/get/all/content', allContentAdmin)
router.get('/admin/get/top/articles', topArticle)
router.get('/admin/get/top/blogs', topBlogs)
router.get('/admin/get/top/yt', topYt)
router.get('/admin/consultants/stats', consultants)
router.get('/admin/registered/user', registeredUser)

// -------ADMIN ----> MANAGER APIs
router.post('/admin/create/manager', upload.single('managerProfile'), register_manager);
router.delete('/admin/delete/manager/:managerId', delete_manager)
router.put('/admin/update/manager/:managerId', upload.single('managerProfile'), updateManager)
router.put('/admin/manager/status/inactive/:managerId', setInactiveManager)
router.put('/admin/manager/status/temporaryoff/:managerId', setOffManager)
router.put('/admin/manager/status/active/:managerId', setActiveManager)
router.get('/admin/get/all/manager', getAllManager)
router.get('/admin/get/active/manager', getActiveManager)
router.get('/admin/get/inactive/manager', getInactiveManager)
router.get('/admin/get/off/manager', getOffManager)
router.put('/admin/update/remarks/:managerId', updateRemarks)

// -------->  ADMIN ----> PATIENT APIs
router.get('/admin/filter/patient', filterPatient);
router.get('/admin/all/patients', allPatient)


//                                  MANAGER APIs------>
router.post('/manager/login', login_manager)
router.get('/get/manager/profile/:managerId', eachManager)
router.get('/manager/get/content', getContentByManager)
router.get('/manager/:managerId/search/bar', managerSearchBar)
router.get('/get/manager/:managerId/unread/notification', getManagerUnreadNotification)
router.get('/get/manager/:managerId/read/notification', getManagerReadNotification)


//                                  DOCTOR APIs  -->
router.post('/doctor/google/signIn', signInDoctorFromGoogle)
router.get('/get/doctor/profile/:doctorId', getDoctorProfile)
router.post('/register/doctor', registerDoctor)
router.post('/verify/doctor/otp', verifyDoctorOtp)
router.post('/doctor/login', doctorLogin)
router.post('/doctor/:doctorId/completeProfile', upload.fields([{ name: 'doctorProfile' }, { name: 'doctorDocument' }]), completeDoctorProfile)
router.put('/update/doctor/profile/:doctorId', upload.single('doctorProfile'), updateDoctorProfile)
router.post('/doctor/forgot/password/send/otp', DoctorOtpSend)
router.post('/doctor/verify/forgot/otp', doctorVerifyForgotOtp)
router.put('/doctor/reset/password', resetDoctorPassword)
router.get('/get/service/:serviceId', getServiceFromId)
router.get('/upcoming/session/:doctorId', upcomingSession)
router.get('/get/service/from/:doctorId', getServicesByDoctorId)
router.get('/get/doctor/from/:serviceId', getDoctorsByServiceId)
router.put('/mark/session/completed/:bookingId', isBookingCompleted)
router.get('/get/one/hours/slots/:doctorId', getOneHourSlots)
router.get('/notify/patient/:patientId/:bookingId/video/call/started', patientVideoCallStart)
router.delete('/delete/doctor/profile/:DoctorId', deleteDoctor_profile)
router.put('/update/status/:DoctorId', updateDoctorStatus)
router.put('/update/remarks/:DoctorId', updateDoctorRemarks)
router.post('/doctor/:doctorId/availability', updateAvailability)
router.post('/doctor/price/:doctorId/:serviceId', doctorPrice)
router.put('/doctor/update/price/:doctorId/:serviceId', updateDoctorPrice)
router.get('/get/doctor/price/:doctorId/:serviceId', getDoctorPrice)
router.post('/doctor/add/service', addDoctorService)
router.get('/doctor/dashboard/stats/:doctorId', doctorDashboardStats)
router.get('/get/doctor/session/history/:doctorId', doctorSessionHistory)
router.get('/get/reviews/:doctorId', getReviewsFromDoctorId)


//                                PATIENT APIs -->
router.post('/patient/signIn/google', signInPatientFromGoogle)
router.get('/get/patient/profile/:patientId', getPatientProfile)
router.post('/register/patient', upload.single('patientImage'), registerPatient)
router.post('/verify/patient/otp', verifyPatientOtp)
router.post('/login/patient', loginPatient)
router.put('/update/patient/profile/:patientId', upload.single('patientProfile'), updatePatientProfile)
router.post('/patient/forgot/password/send/otp', otpSend)
router.post('/patient/verify/forgot/otp', patientVerifyForgotOtp)
router.put('/patient/reset/password', resetPatientPassword)
router.get('/decline/doctor/call/:doctorId', patinetDeclineVideoCall)
router.get('/get/all/docotors', allDoctors)
router.get('/search/doctors/services', searchDoctorAndServices)
router.post('/add/support/:patientId', upload.single('supportImage'), patientSupport)
router.put('/update/support/:supportId', upload.single('supportImage'), updateSupport)
router.get('/trending/consultant', trendingConsultant)
router.delete('/delete/support/:supportId', deletePatientSupport)
router.get('/get/patient/support/:patientId', patientAllSupport)
router.get('/get/support/:supportId', eachSupport)
router.post('/mood/:patientId', mood)
router.get('/get/:patientId/mood', get_mood)
router.get('/get/category/from/:doctorId', getCategoriesByDoctorId)
router.post('/post/recent/ticket/:patientId',upload.single('image'),recentTicket)
router.get('/get/all/recent/ticket', getAllRecentTicket)
router.post('/give/rating/:bookingId/:patientId/:doctorId', giveRatingToDoctor)
router.post('/add/jounal/:patientId', patientJournal)
router.put('/update/journal/:journalId', updateJounal)
router.get('/get/patient/journal/:patientId', patientJournalAll)
router.delete('/delete/journal/:journalId', deleteJournal)
router.get('/doctor/:doctorId/availability', getAvailableSlotsDoctor)
router.post('/booking/:patientId/:doctorId/:serviceId', bookSlot)
router.put('/reschedule/booking/:bookingId',rescheduleBooking)
router.get('/get/booking/:patientId', getBookingOfPatient)
router.get('/patient/dashboard/stats/:patientId', patientAuthInfo, patientDashboardStats)
router.get('/get/patient/upcomming/session/:patientId', patientUpcomingSessions)
router.get('/get/patient/session/history/:patientId', patientSessionHistory)
router.post('/post/continumm/:patientId', patientAuthInfo, apiLimiter, createContinum)
router.get('/get/repeated/continum/:patientId',getContinum)



// test notification for patient app
router.get('/test/patinet', testFirebasePatient)
router.get('/test/firebase', testFirebase)


// slots in one hours
router.delete('/delete', deleteAllAvailableSlots)


export default router