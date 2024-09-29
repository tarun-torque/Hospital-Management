import 'dotenv/config'
import prisma from '../DB/db.config.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import extractContent from '../utils/htmlExtractor.js';



// login creator
export const login_creator = async (req, res) => {
    try {
        const { email, password } = req.body;
        const isCreator = await prisma.creator.findUnique({ where: { email } })
        if (!isCreator) {
            return res.status(404).json({ message: 'Incorrect Email or Password' })
        }
        const isPassword = bcrypt.compareSync(password, isCreator.password)
        if (!isPassword) {
            return res.status(404).json({ message: 'Incorrect Email or Password' })
        }
        const data = {
            role:isCreator.role,
            id: isCreator.id,
            username: isCreator.username,
            email: isCreator.email,
            state: isCreator.state,
            language: isCreator.language,
            profile_path: isCreator.profile_path
        }
        const token = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: '999h' })
        res.status(200).json({status:200, messages: 'Logged In', token: token, id: isCreator.id,profile:isCreator})
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// creator search bar
export const creatorSearchBar = async (req, res) => {
    const { creatorId } = req.params;
    const { query } = req.query;

    try {

        const creatorDetails = await prisma.creator.findUnique({
            where: { id: parseInt(creatorId) },
            include: {
                yt_contents: {
                    where: {
                        OR: [
                            { heading: { contains: query, mode: 'insensitive' } },
                            { content: { contains: query, mode: 'insensitive' } },
                            { tags: { has: query } }
                        ],
                    },
                    select: {
                        heading: true,
                        content: true,
                        views: true,
                        tags: true,
                        verified: true
                    }
                },
                blog_contents: {
                    where: {
                        OR: [
                            { content: { contains: query, mode: 'insensitive' } },
                            { tags: { has: query } }
                        ]
                    },
                    select: {
                        content: true,
                        tags: true,
                        views: true,
                        verified: true
                    }
                },
                article_content: {
                    where: {
                        OR: [
                            { heading: { contains: query, mode: 'insensitive' } },
                            { content: { contains: query, mode: 'insensitive' } },
                            { tags: { has: query } }
                        ]
                    },
                    select: {
                        heading: true,
                        content: true,
                        articleImagePath: true,
                        views: true,
                        verified: true
                    }
                }
            }
        });

        if (!creatorDetails) {
            return res.status(404).json({ status: 404, msg: 'No results found' });
        }

        res.status(200).json({ status: 200, creatorDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, msg: 'Something went wrong' });
    }
}

// create yt content
export const create_yt_Content = async (req, res) => {
    try {

        const { iframe, heading, content, tags, category } = req.body;
        const id = +req.params.id
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
        res.status(201).json({ message: 'Youtube content is created Succesfully' })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })
    }
}


// create blog_content
export const create_blog_content = async (req, res) => {
    try {
        // get id
        const { content, tags, category } = req.body
        const id = +req.params.id;
        const creator = await prisma.creator.findUnique({ where: { id } })
        if (!creator) {
            return res.send("creator is not found")
        }



        // construct the data
        const data = { blog_creatorId: creator.id, content, tags, category }

        // // add in db
        const info = await prisma.blog_content.create({ data })
        res.status(201).json({ message: 'Blog is created successfully' })


    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to create blog content' });
    }

}

// create article content
export const create_arcticle_content = async (req, res) => {
    try {
        const { heading, content, tags, category } = req.body;
        const id = +req.params.id;
        const fileInfo = req.file;
        const creator = await prisma.creator.findUnique({ where: { id } })

        if (!creator) {
            res.send("Creator not found")
        }

        const data = { heading, content, tags, category, article_creatorId: creator.id, articleImagePath: req.file.path, articleImageType: req.file.mimetype }

        const info = await prisma.article_content.create({ data })

        res.status(201).json({ message: 'Article created succesfully' })
    } catch (error) {
        console.log(error)

    }

}

// get profile of creator
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

// get all content excluding blogs
export const get_all_content = async (req, res) => {

    try {
        const id = +req.params.id;
        const creator = await prisma.creator.findUnique({
            where: { id },
            include: {
                yt_contents: true,
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

// get blogs
export const get_blogs = async (req, res) => {
    try {
        const id = +req.params.id;

        // Fetch the blogs data
        const blogs = await prisma.blog_content.findMany({ where: { blog_creatorId: id } });

        // Check if blogs exist
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ msg: 'No Blogs found' });
        }

        

        const blogDataArray = blogs.map(blog => {
            const extractedContent = extractContent(blog.content);
            return {
                id: blog.id,
                tags: blog.tags,
                category: blog.category,
                data: extractedContent,
                verified: blog.verified,
                createdAt: blog.createdAt,
                updatedAt: blog.updatedAt,
                blog_creatorId: blog.blog_creatorId
            }
        })


        return res.status(200).json({ blogData: blogDataArray });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: 'An error occurred', error });
    }
};





// update article
export const update_article = async (req, res) => {
    try {
        const articleId = +req.params.articleId
        const userId = +req.params.userId;
        const { heading, content, tags, category } = req.body;
        const fileInfo = req.file;

        const updatedData = {}

        if (heading) {
            updatedData.heading = heading
        }

        if (content) {
            updatedData.content = content
        }
        if (tags) {
            updatedData.tags = tags
        }
        if (category) {
            updatedData.category = category
        }

        if (fileInfo) {
            const isFile = (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpeg') && ((req.file.size / (1024 * 1024)) <= 2)

            if (!isFile) {
                return res.status(400).json({ message: 'Profile picture should be jpg/png and size less than 2MB' })
            }

            updatedData.articleImagePath = fileInfo.path
            updatedData.articleImageType = fileInfo.type

        }

        if (Object.keys(updatedData).length == 0) {
            return res.status(400).json({ message: "No valid field to update" })
        }


        // update the article
        const updateArticle = await prisma.article_content.update({
            where: { id: articleId, article_creatorId: userId },
            data: updatedData
        })

        res.status(200).json({ message: "Article updated Succesfully" })
    }
    catch (error) {
        res.status(400).json({ messages: 'Something went wrong' })
        console.log(error)
    }
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
        const { content, tags, category } = req.body;


        const updatedData = {}

        if (content) {
            updatedData.content = content
        }

        if (tags) {
            updatedData.tags = tags
        }
        if (category) {
            updatedData.category = category
        }

        if (Object.keys(updatedData).length == 0) {
            return res.status(400).json({ message: 'NO valid Field to update' })
        }

        // check user and post is present or not
        const updateBlog = await prisma.blog_content.update({
            where: { id: blogId, blog_creatorId: creatorId },
            data: updatedData
        })

        res.status(200).json({ message: "Blog updated" })

    } catch (error) {
        res.status(400).json({ messages: 'Something went wrong' })
        console.log(error)
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


// search creator including posts by username
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
export const stateContent = async (req, res) => {
    try {
        const { state } = req.query;
        const stateContent = await prisma.creator.findMany({
            where: {
                state
            },
            select: {
                yt_contents: true,
                blog_contents: true,
                article_content: true
            }
        })
        if (stateContent.length == 0) {
            return res.status(404).json({ message: 'Sorry,creator of this state is not found' })
        }

        res.status(200).json({ stateContent })

    } catch (error) {
        res.status(400).json({ message: error.message || 'Something went wrong' })
    }

}

// filter posts by language
export const languagePost = async (req, res) => {

    try {

        const { language } = req.query;
        const languageContent = await prisma.creator.findMany({
            where: {
                language: {
                    has: language
                }
            },
            select: {
                yt_contents: true,
                blog_contents: true,
                article_content: true
            }
        })

        if (languageContent.length == 0) {
            return res.status(404).json({ message: `Content of ${language} language is not found` })
        }

        res.status(200).json({ languageContent })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })
    }

}


// filter by category
export const categoryContent = async (req, res) => {
    try {
        const { category } = req.query;
        const ytContent = await prisma.yt_content.findMany({
            where: {
                category: {
                    has: category
                }
            }
        })

        const blogContent = await prisma.blog_content.findMany({
            where: {
                category: {
                    has: category
                }
            }
        })

        const articleContent = await prisma.article_content.findMany({
            where: {
                category: {
                    has: category
                }
            }
        })


        if (ytContent.length == 0 && blogContent.length == 0 && ytContent.length == 0) {
            return res.status(404).json({ message: `Content of ${category} category is not found` })
        }

        const filtered = [{ articleContent: articleContent }, { blogContent: blogContent }, { ytContent: ytContent }]

        res.status(200).json({ filtered })


    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })
    }

}





// get individual blogs
export const eachBlog = async (req, res) => {
    try {
        const blogId = +req.params.blogId;

        const blog = await prisma.blog_content.findUnique({ where: { id: blogId } })
       
        if (!blog) {
            return res.status(404).json({ msg: 'No Blog Found' })
        }

        if(blog.verified === 'publish'){
            const views = blog.views + 1
            const updateViews = await prisma.blog_content.update({where:{id:blogId},data:{views:views}})
            console.log("updated view")
        }

        // to find name and username of creator 
        const creator = await prisma.creator.findUnique({ where: { id: blog.blog_creatorId } })

        const extract = extractContent(blog.content)

        const data = {
            id: blog.id,
            views:blog.views,
            data: extract,
            tags: blog.tags,
            category: blog.category,
            verified: blog.verified,
            blog_creatorId: blog.blog_creatorId,
            creator_username: creator.username,
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt
        }

        res.status(200).json({ data })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })
    }
}

// get individual article
export const eachArticle = async (req, res) => {
    try {
        const articleId = +req.params.articleId;
        const article = await prisma.article_content.findUnique({ where: { id: articleId } })

        if (!article) {
            return res.status(400).json({ msg: 'No Article Found' })
        }

        if (article.verified === 'publish') {
            const views = article.views + 1
            const updateViews = await prisma.article_content.update({ where: { id: articleId }, data: { views: views } })
        }

        const creator = await prisma.creator.findUnique({ where: { id: article.article_creatorId } })

        res.status(200).json({ status: 200, article, creator_username: creator.username })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error.message })
    }
}



// get individual yt content 
export const eachYT = async (req, res) => {
    try {
        const ytId = +req.params.ytId;
        const yt = await prisma.yt_content.findUnique({ where: { id: ytId } })
    
        if (!yt) {
            return res.status(404).json({ msg: 'No Youtube content Found' })
        }

        if(yt.verified === 'publish'){
            const views = yt.views + 1
            const updateViews  = await prisma.yt_content.update({where:{id:ytId},data:{views:views}})
            
        }

        const creator = await prisma.creator.findUnique({ where: { id: yt.yt_creatorId } })
        res.status(200).json({ yt, creator_username: creator.username })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


// get each creator 
export const eachCreator = async (req, res) => {
    try {
        const creatorId = +req.params.creatorId;
        const creator = await prisma.creator.findUnique({ where: { id: creatorId } })

        if (!creator) {
            return res.json({ msg: 'No creator Found' })
        }

        res.status(200).json({ creator })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
