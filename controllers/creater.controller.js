import 'dotenv/config'
import prisma from '../DB/db.config.js'
import creator_vaidation from '../validations/validatons.js';
import vine from '@vinejs/vine';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { messages } from '@vinejs/vine/defaults';

// create creator
export const creator_profile = async (req, res) => {
    try {
        const {username,email,country_code,contact_number,state,language,password} = req.body;

        // const validator = vine.compile(creator_vaidation)
        // const payload = await validator.validate({username,email,contact_number,country_code,state,language,password})
        
        const salt =  bcrypt.genSaltSync(10);
        const hash_pswd = bcrypt.hashSync(password, salt)

        const data = {
            username,email,contact_number,country_code,state,language,password:hash_pswd}
        
      
        
        const info = await prisma.creator.create({
            data
        })


        const creator = {
            id:info.id,
            username:info.username,
            email:info.email,
            state:info.state,
            language:info.language
        }
        // create token
        const token = jwt.sign(creator,process.env.SECRET_KEY,{expiresIn:'999h'})

        res.status(201).json({message:'Creator is registered',token:token})

    
    } catch (error) {
        res.status(400).json({message:error})
    }
}

// login creator
export const login_creator = async(req,res)=>{
    try {

        const {email,password}=req.body;

        const isCreator = await prisma.creator.findUnique({where:{email}})
        if(! isCreator){
            return res.status(404).json({message:'Incorrect Email or Password'})
        }
        
        const isPassword = bcrypt.compareSync(password,await prisma.creator.password)

        if(! isPassword){
            return res.status(404).json({message:'Incorrect Email or Password'})
        }

        const data = {
            id:await prisma.creator.id,
            username:await prisma.creator.username,
            email:await prisma.creator.email,
            state:await prisma.creator.state,
            language:await prisma.creator.language,

        }

        const token = jwt.sign(data,process.env.SECRET_KEY,{expiresIn:'99999h'})

        res.status(200).json({token:token})


        
    } catch (error) {
        res.send(error)
    }
}

// create yt content
export const create_yt_Content = async (req, res) => {
    try {

        const id = +req.params.id
        const { iframe, heading, content, tags } = req.body;

        const creator = await prisma.creator.findUnique({
            where: {
                id
            }
        })

        if (!creator) {
            res.send("Creator not Found")
        }

        const data = { yt_creatorId: creator.id, iframe, heading, content, tags, category }

        const info = await prisma.yt_content.create({ data })
        res.send(info)

    } catch (error) {
        console.log(error)

    }
}

// create blog_content
export const create_blog_content = async (req, res) => {
    try {
        // get id
        const fileInfo = req.file;
        const id = +req.params.id;
        const creator = await prisma.creator.findUnique({ where: { id } })
        if (!creator) {
            return res.send("creator is not found")
        }

        const type = req.file.mimetype;
        const path = req.file.path;
        const size = (req.file.size) / (1024 * 1024); //file size in MB

        if ((type == 'image/png' || type == 'image/jpg') && (size <= 2)) {

            // construct the data
            const { heading, content, tags, category} = req.body
            const data = { blog_creatorId: creator.id, heading, content, tags, category,ImagePath:path,imageType:type }
            // console.log(blogImage_path,imageType)
            // // add in db
            const info = await prisma.blog_content.create({ data })
            res.status(201).json({message:'Blog is created successfully'})

        }

        else{
            return res.status(405).json({message:'File size must be less than 2MB and should be png or jpg type'})
        }






    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to create blog content' });
    }

}

// create article content
export const create_arcticle_content = async (req, res) => {
    try {
        const id = +req.params.id;
        const creator = await prisma.creator.findUnique({ where: { id } })

        if (!creator) {
            res.send("Creator not found")
        }

        const { heading, content, tags, category } = req.body;
        const data = { heading, content, tags, category, article_creatorId: creator.id }

        const info = await prisma.article_content.create({ data })

        res.send(info)

    } catch (error) {
        console.log(error)

    }

}

// get profile of user
export const get_profile = async (req, res) => {

    try {

        const id = +req.params.id;
        const creator = await prisma.creator.findUnique({ where: { id } })
        if (!creator) {
            res.send("Creator is not Found")
        }
        res.send(creator)

    } catch (error) {

    }


}

// get all content 
export const get_all_content = async (req, res) => {

    try {
        const id = +req.params.id;
        const creator = await prisma.creator.findUnique({
            where: { id },
            include: {
                yt_contents: true,
                blog_contents: true,
                article_content: true
            }
        })
        if (!creator) {
            res.send("Creator not Found")
        }

        res.send(creator)

    } catch (error) {
        console.log(error)

    }


}

// update article
export const update_article = async (req, res) => {

    const articleId = +req.params.articleId
    const userId = +req.params.userId;
    const { heading, content, tags, category } = req.body;

    // check creator with the giver ids is present or not
    // const isCreator = await prisma.article_content.findUnique({ 
    //     where: { 
    //         some:{
    //             AND:{id:articleId,article_creatorId:userId}
    //         })

    // if( ! isCreator){
    //     res.send("No record With this information")
    // }

    // update the article
    const updateArticle = await prisma.article_content.update({
        where: { id: articleId, article_creatorId: userId },
        data: { heading, content, tags, category }
    })

    res.send("Article Updated Succesfully")

}

// update yt content
export const update_yt = async (req, res) => {
    try {
        // get creator id
        const creatorId = +req.params.creatorId;
        // get yt_content id
        const ytId = +req.params.ytId;
        // check creator with these id are present or not
        // get fields to update
        const { heading, iframe, content, tags, category } = req.body;
        // update the yt_content
        const updateYt = await prisma.yt_content.update({
            where: { id: ytId, yt_creatorId: creatorId },
            data: { heading, iframe, content, tags, category }
        })
        // send response
        res.send("Youtube content updated Succesfully")

    } catch (error) {
        console.log(error)
    }
}


// update blogs
export const update_blog = async (req, res) => {
    try {
        const creatorId = +req.params.creatorId;
        const blogId = +req.params.blogId
        const { heading, content, tags, category } = req.body;

        // check user and post is present or not
        const updateBlog = await prisma.blog_content.update({
            where: { id: blogId, blog_creatorId: creatorId },
            data: { heading, content, tags, category }
        })

        res.send("Blog updated succesfully")

    } catch (error) {

    }
}


// delete yt
export const delete_yt = async (req, res) => {
    try {
        const creatorId = +req.params.creatorId;
        const ytId = +req.params.ytId;

        const deleteYt = await prisma.yt_content.delete({ where: { id: ytId, yt_creatorId: creatorId } })
        res.send("Yt content deleted succesfully")

    } catch (error) {
        console.log(error)
    }

}

// delete article
export const delete_article = async (req, res) => {
    try {
        const creatorId = +req.params.creatorId;
        const articleId = +req.params.articleId;

        const deleteArticle = await prisma.article_content.delete({ where: { id: articleId, article_creatorId: creatorId } })
        res.send("Article deleted succesfully")

    } catch (error) {
        console.log(error)
    }

}
// delete yt content
export const delete_blog = async (req, res) => {
    try {
        const creatorId = +req.params.creatorId;
        const blogId = +req.params.blogId;

        const deleteBlog = await prisma.blog_content.delete({ where: { id: blogId, blog_creatorId: creatorId } })
        res.send("Blog deleted succesfully")

    } catch (error) {
        console.log(error)
    }
}


// update creator profile 

// search creator  with posts by username
export const search_creator = async (req, res) => {
    try {

        const { username } = req.query;
        const creator = await prisma.creator.findUnique({
            where: { username },
            include: {
                article_content: true,
                blog_contents: true,
                yt_contents: true
            }
        })

        if (!creator) {
            res.send("This creator is not found")
        }

        res.send(creator)

    } catch (error) {

        console.log(error)

    }


}


// filter content by states




// filter posts by language



// filter by category
