import { Router } from "express";
import multer from "multer";
import path from 'path'
import fs from 'fs'
const router = Router()


import {create_yt_Content, create_blog_content, create_arcticle_content, get_all_content, get_profile, update_article, update_yt, update_blog, delete_yt, delete_article, delete_blog, search_creator, login_creator, stateContent, languagePost, categoryContent } from "../controllers/creater.controller.js";
import { CreateDoctor_profile, deleteDoctor_profile, doctorLogin, updateDoctorProfile, updateDoctorRemarks, updateDoctorStatus } from "../controllers/doctor.controller.js";
import { delete_support, filterPatient, get_mood, get_support, loginPatient, mood, post_support, registerPatient, update_support } from "../controllers/patient.controller.js";
import { creator_profile,approveDoctorRequest, contentCategory, createService, deleteCategory, getActiveDoctors, getApprovedDoctors, getInactiveDoctors, getPendingDoctors, getRejectedDoctors, getTemporaryoffDoctors, register_manager, rejectDoctor, servieCategory, getContentCategory, update_ContentCategory, getAllManager, delete_manager, updateManager, getService, deleteService, deleteCategoryService } from "../controllers/admin.controller.js";
import { login_manager } from "../controllers/manager.controller.js";


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

        if(req.baseUrl==='/api//admin/create/service'){
            uploadPath = path.join(uploadPath,'serviceImage')
        }
        else if(req.baseUrl==='/api/admin/create/content/category'){
            uploadPath = path.join(uploadPath,'contentCategoryImage')
        }
        else if(req.baseUrl==='/api/admin/create/service/:serviceId/category'){
            uploadPath = path.join(uploadPath,'serviceCategoryImage')
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
        else if(req.baseUrl==='/api/user/:id/createBlogContent'){
            uploadPath = path.join(uploadPath,'blogImage')
        }
        else if(req.baseUrl==='/api/user/:id/createArticleContent'){
            uploadPath = path.join(uploadPath,'articleImage')
        }
        else if(req.baseUrl==='/api/admin/creatorProfile'){
            uploadPath = path.join(uploadPath,'creatorProfile')
        }
        
        cb(null,uploadPath)
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname)
    }
})

// filter file types 
const fileFilter = function(req,file,cb){
    if(file.mimetype==='image/jpg' ||file.mimetype==='image/png'){
        cb(null,true)
    }else{
        cb(new Error('Only JPG and PNG files are allowed'),false)
    }
}

const upload = multer({storage:storage,fileFilter:fileFilter})

// creator api
router.post('/login/creator', login_creator)
router.post('/user/:id/createYtContent', create_yt_Content)
router.post('/user/:id/createBlogContent', upload.single('blogImage'), create_blog_content)
router.post('/user/:id/createArticleContent', upload.single('articleImage'), create_arcticle_content)
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
router.post('/createDoctorProfile', upload.fields([{ name: 'doctorProfile', maxCount: 1 }, { name: 'doctorDocument', maxCount: 1 }]), CreateDoctor_profile)
router.post('/doctor/login',doctorLogin)
router.put('/update/doctor/profile/:DoctorId',updateDoctorProfile)
router.delete('/delete/doctor/profile/:DoctorId',deleteDoctor_profile)
router.put('/update/status/:DoctorId',updateDoctorStatus)
router.put('/update/remarks/:DoctorId',updateDoctorRemarks)


// patient api
router.post('/create/patient/profile',upload.single('patientProfile'),registerPatient)
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
router.post('/admin/create/content/category',upload.single('contentCategoryImage'),contentCategory)
router.get('/all/content/categories',getContentCategory)
router.delete('/admin/delete/category/:CategoryId',deleteCategory)
router.put('/admin/update/category/:CategoryId',update_ContentCategory)


router.post('/admin/create/service',upload.single('serviceImage'),createService)
router.post('/admin/create/service/:serviceId/category',upload.single('serviceCategoryImage'),servieCategory)
router.get('/admin/get/service/stats',getService)
router.delete('/admin/delete/service/:serviceId',deleteService)
router.delete('/admin/delete/category/:serviceId/:categoryId',deleteCategoryService)

// admin-----creator api
router.post('/admin/creatorProfile',upload.single('creator_picture'),creator_profile)
// admin----manager api
router.post('/admin/create/manager',upload.single('managerProfile'),register_manager); 
router.get('/admin/get/all/manager',getAllManager)
router.delete('/admin/delete/manager/:managerId',delete_manager)
router.put('/admin/update/manager',updateManager)

// manager API
router.post('/manager/login',login_manager);

export default router