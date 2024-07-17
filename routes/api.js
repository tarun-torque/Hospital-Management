import { Router } from "express";
import multer from "multer";
const router = Router()

import {create_yt_Content, create_blog_content, create_arcticle_content, get_all_content, get_profile, update_article, update_yt, update_blog, delete_yt, delete_article, delete_blog, search_creator, login_creator, stateContent, languagePost, categoryContent } from "../controllers/creater.controller.js";
import { CreateDoctor_profile, deleteDoctor_profile, doctorLogin, updateDoctorProfile, updateDoctorRemarks, updateDoctorStatus } from "../controllers/doctor.controller.js";
import { delete_support, filterPatient, get_mood, get_support, loginPatient, mood, post_support, registerPatient, update_support } from "../controllers/patient.controller.js";
import { creator_profile,approveDoctorRequest, contentCategory, createService, deleteCategory, getActiveDoctors, getApprovedDoctors, getInactiveDoctors, getPendingDoctors, getRejectedDoctors, getTemporaryoffDoctors, register_manager, rejectDoctor, servieCategory, getContentCategory, update_ContentCategory, getAllManager, delete_manager, updateManager, getService, deleteService, deleteCategoryService } from "../controllers/admin.controller.js";
import { login_manager } from "../controllers/manager.controller.js";


const creatorProfile  = multer({dest:'creatorProfile/'})
const articleImage = multer({ dest: 'articleImage/' })
const blogImage = multer({ dest: 'blogImage/' })
const doctor = multer({ dest: 'doctorProfile/' })
const patient = multer({dest:'patientProfile/'})
const serviceImage = multer({dest:'serviceImage/'})
const serviceCategoryImage= multer({dest:'serviceCategoryImage/'})
const managerProfile=multer({dest:'managerProfile/'})
const contentCategoryImage = multer({dest:'contentCategoryImage/'})

// creator api
router.post('/login/creator', login_creator)
router.post('/user/:id/createYtContent', create_yt_Content)
router.post('/user/:id/createBlogContent', blogImage.single('blogImage'), create_blog_content)
router.post('/user/:id/createArticleContent', articleImage.single('articleImage'), create_arcticle_content)
router.get('/user/:id/getProfile', get_profile)
router.get('/user/:id/getAllContent', get_all_content)
router.put('/user/:userId/updateArticle/:articleId', update_article)
router.put('/user/:creatorId/updateYt/:ytId', update_yt)
router.put('/user/:creatorId/updateBlog/:blogId', update_blog)
router.delete('/user/:creatorId/deleteYt/:ytId', delete_yt)
router.delete('/user/:creatorId/deleteArticle/:articleId', delete_article)
router.delete('/user/:creatorId/deleteBlog/:blogId', delete_blog)
router.get('/searchCreator', search_creator)
router.get('/state/content',stateContent)
router.get('/filter/language/content',languagePost)
router.get('/filter/category/content',categoryContent)




// doctor api
router.post('/createDoctorProfile', doctor.fields([{ name: 'doctorProfile', maxCount: 1 }, { name: 'doctorDocument', maxCount: 1 }]), CreateDoctor_profile)
router.post('/doctor/login',doctorLogin)
router.put('/update/doctor/profile/:DoctorId',updateDoctorProfile)
router.delete('/delete/doctor/profile/:DoctorId',deleteDoctor_profile)
router.put('/update/status/:DoctorId',updateDoctorStatus)
router.put('/update/remarks/:DoctorId',updateDoctorRemarks)



// patient api
router.post('/create/patient/profile',patient.single('patientProfile'),registerPatient)
router.post('/login/patient',loginPatient)
router.get('/filter/patient',filterPatient)
router.post('/:patientId/support',post_support)
router.put('/update/:patientId/:supportId',update_support)
router.get('/get/support/:id',get_support)
router.delete('/delete/:supportId',delete_support)
router.post('/mood/:patientId',mood)
router.get('/get/:patientId/mood',get_mood)


// admin routes
//-----doctor api
router.put('/admin/approveDoctorRequest/:DoctorId',approveDoctorRequest)
router.put('/admin/reject/doctor/request/:DoctorId',rejectDoctor)
router.get('/admin/getPendingDoctors',getPendingDoctors)
router.get('/admin/get/rejectedDoctors',getRejectedDoctors)
router.get('/admin/getApprovedDoctors',getApprovedDoctors)
router.get('/admin/get/active/doctors',getActiveDoctors)
router.get('/admin/get/inactive/doctors',getInactiveDoctors)
router.get('/admin/get/temporaryoff/doctors',getTemporaryoffDoctors)
//admin -----service/service category and content category
router.post('/admin/create/content/category',contentCategoryImage.single('contentCategoryImage'),contentCategory)
router.get('/all/content/categories',getContentCategory)
router.delete('/admin/delete/category/:CategoryId',deleteCategory)
router.put('/admin/update/category/:CategoryId',update_ContentCategory)


router.post('/admin/create/service',serviceImage.single('serviceImage'),createService)
router.post('/admin/create/service/:serviceId/category',serviceCategoryImage.single('serviceCategoryImage'),servieCategory)
router.get('/admin/get/service/stats',getService)
router.delete('/admin/delete/service/:serviceId',deleteService)
router.delete('/admin/delete/category/:serviceId/:categoryId',deleteCategoryService)


// admin-----creator api
router.post('/admin/creatorProfile',creatorProfile.single('creator_picture'), creator_profile)
// admin----manager api
router.post('/admin/create/manager',managerProfile.single('managerProfile'),register_manager); 
router.get('/admin/get/all/manager',getAllManager)
router.delete('/admin/delete/manager/:managerId',delete_manager)
router.put('/admin/update/manager',updateManager)

// manager API
router.post('/manager/login',login_manager);
export default router