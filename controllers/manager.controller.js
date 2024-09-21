import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from '../DB/db.config.js'
import extractContent from '../utils/htmlExtractor.js'

// login manager
export const login_manager = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ status: 400, msg: 'Email is required' })
        }
        if (!password) {
            return res.status(400).json({ status: 400, msg: 'Password is required' })
        }

        // check email and password
        const isEmail = await prisma.manager.findUnique({ where: { email } })
        const isPassword = bcrypt.compareSync(password, isEmail.password)

        if (!isEmail || !isPassword) {
            return res.status(400).json({ message: 'Invalid Credentials' })
        }

        const data = {
            id: isEmail.id,
            username: isEmail.username,
            profile_path: isEmail.profile_path,
            states: isEmail.states,
            country: isEmail.country,
        }
        // send token
        const token = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: '999h' })
        res.status(200).json({ status: 200, message: 'Logged in Succesfully', token: token, id: isEmail.id, profile: isEmail })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Something went wrong' })

    }

}

// get each manager profile
export const eachManager = async (req, res) => {
    try {
        const managerId = +req.params.managerId
        const manager = await prisma.manager.findUnique(
            {
                where: { id: managerId },
                include: {
                    creators: true,
                    doctors: true,
                    assignedCategory: true
                }
            })

        if (!manager) {
            return res.status(404).json({ msg: 'No Manager found' })
        }

        res.status(200).json({ manager })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


// all content for manager only assigned creators
export const getContentByManager = async (req, res) => {
    try {
        const managerUsername = req.query.managerUsername;

        if (!managerUsername) {
            return res.status(400).json({ status: 400, msg: "Manager username is required" });
        }

        const allArticle = await prisma.article_content.findMany({
            where: {
                Creator: {
                    assignedManager: managerUsername
                }
            }
        });

        const allYt = await prisma.yt_content.findMany({
            where: {
                creator: {
                    assignedManager: managerUsername
                }
            }
        });


        const allBlog = await prisma.blog_content.findMany({
            where: {
                Creator: {
                    assignedManager: managerUsername
                }
            }
        });


        const blogDataArray = allBlog.map(blog => {
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
            };
        });

        if (allArticle.length == 0 && allBlog.length == 0 && allYt.length == 0) {
            return res.status(404).json({ status: 404, msg: "No Content Found" })
        }

        const data = { allYt, allArticle, allBlog: blogDataArray }

        res.status(200).json({ status: 200, msg: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, msg: "Internal server error" });
    }
};


// get creator of state
// approve creator
// approve their content 
// see views of approved content only their state
// reply to the support of their state only 









// get manager specific notification 
// -------unread
export const getManagerUnreadNotification = async (req, res) => {
    const managerId = +req.params.managerId; 
    try {
        const Notification = await prisma.managerNotification.findMany({
            where: {
                managerId: managerId,
                isRead: 'no',
            },
        });

        const count = Notification.length;

        if (count === 0) {
            return res.status(404).json({ status: 404, msg: 'No unread notifications' });
        }

        // mark as read
        await prisma.managerNotification.updateMany({
            where: {
                managerId: managerId,
                isRead: 'no',
            },
            data: {
                isRead: 'yes',
            },
        });

        const unreadNotifications = Notification.map(notification => ({
            id: notification.id,
            title: notification.title,
            content: notification.content,
            data: JSON.parse(notification.data), 
            managerId: notification.managerId,
        }));


        res.status(200).json({ status: 200, unreadNotifications,count });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, msg: 'Something went wrong' });
    }
};

//----------read
export const getManagerReadNotification = async (req, res) => {
    const managerId = +req.params.managerId; 
    try {

        const Notification = await prisma.managerNotification.findMany({
            where: {
                managerId: managerId,
                isRead: 'yes',
            },
        });

        const count = Notification.length;

      
        if (count === 0) {
            return res.status(404).json({ status: 404, msg: 'No read notifications' });
        }

       
        const readNotifications = Notification.map(notification => ({
            id: notification.id,
            title: notification.title,
            content: notification.content,
            data: JSON.parse(notification.data), 
            managerId: notification.managerId,
        }));

        res.status(200).json({ status: 200, readNotifications, count });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, msg: 'Something went wrong' });
    }
};


