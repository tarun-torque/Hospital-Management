import { Router } from "express";
import multer from "multer";
const router = Router()

import { creator_profile, create_yt_Content, create_blog_content, create_arcticle_content, get_all_content, get_profile, update_article, update_yt, update_blog, delete_yt, delete_article, delete_blog, search_creator, login_creator } from "../controllers/creater.controller.js";
import { CreateDoctor_profile, deleteDoctor_profile, doctorLogin, updateDoctorProfile } from "../controllers/doctor.controller.js";

const articleImage = multer({ dest: 'articleImage/' })
const blogImage = multer({ dest: 'blogImage/' })
const doctor = multer({ dest: 'doctorProfile/' })



// creator api
router.post('/creatorProfile', creator_profile)
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



// doctor api
router.post('/createDoctorProfile', doctor.fields([{ name: 'doctorProfile', maxCount: 1 }, { name: 'doctorDocument', maxCount: 1 }]), CreateDoctor_profile)
router.post('/doctor/login',doctorLogin)
router.put('/update/doctor/profile/:DoctorId',updateDoctorProfile)
router.delete('/delete/doctor/profile/:DoctorId',deleteDoctor_profile)





export default router