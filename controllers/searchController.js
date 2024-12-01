const db = require("../models");

exports.search = async (req, res) => {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1; // Get the page number from the query
    const pageSize = 10; // Number of results per page
    const offset = (page - 1) * pageSize;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const results = {
            users: [],
            categories: [],
            posts: [],
            totalResults: 0 // Add totalResults field
        };

        const queries = q.split(' ');

        let userQueryByAt = null;
        let userQueryByU = null;
        let categoryQueries = [];
        let postQuery = null;
        let dateQuery = null;

        for (const query of queries) {
            if (query.startsWith('@')) {
                userQueryByAt = query.slice(1);
            } else if (query.startsWith('u:')) {
                userQueryByU = query.slice(2);
            } else if (query.startsWith('c:')) {
                categoryQueries.push(query.slice(2));
            } else if (query.startsWith('p:')) {
                postQuery = query.slice(2);
            } else if (query.startsWith('d:')) {
                dateQuery = query.slice(2);
            } else {
                postQuery = query;
            }
        }

        if (userQueryByAt) {
            results.users = await db.User.findAll({
                where: {
                    login: { [db.Sequelize.Op.iLike]: `%${userQueryByAt}%` }
                },
                attributes: { exclude: ['password'] }
            });
            results.totalResults += results.users.length; // Add to totalResults
            return res.status(200).json(results);
        }

        let userIds = [];
        if (userQueryByU) {
            const userResults = await db.User.findAll({
                where: {
                    [db.Sequelize.Op.or]: [
                        { login: { [db.Sequelize.Op.iLike]: `%${userQueryByU}%` } },
                        { fullName: { [db.Sequelize.Op.iLike]: `%${userQueryByU}%` } }
                    ]
                },
                attributes: { exclude: ['password'] }
            });
            results.users = userResults;
            userIds = userResults.map(user => user.id);
            results.totalResults += userResults.length; // Add to totalResults
        }

        let categoryIds = [];
        if (categoryQueries.length > 0) {
            const categories = await db.Category.findAll({
                where: {
                    [db.Sequelize.Op.or]: categoryQueries.map(cat => ({
                        title: { [db.Sequelize.Op.iLike]: `%${cat}%` }
                    }))
                },
                attributes: {
                    include: [
                        [
                            db.Sequelize.literal(`(SELECT COUNT(*) FROM "PostCategories" WHERE "PostCategories"."categoryId" = "Category"."id")`),
                            'postCount'
                        ]
                    ]
                }
            });
            results.categories = categories;
            categoryIds = categories.map(cat => cat.id);
            results.totalResults += categories.length; // Add to totalResults
        }

        const postConditions = [];

        if (postQuery) {
            postConditions.push({
                [db.Sequelize.Op.or]: [
                    { title: { [db.Sequelize.Op.iLike]: `%${postQuery}%` } }
                ]
            });
        }

        if (userIds.length > 0) {
            postConditions.push({ userId: { [db.Sequelize.Op.in]: userIds } });
        }

        if (dateQuery) {
            // Support for different date delimiters
            const dateParts = dateQuery.split(/\/|\./); // Split by slash or dot
        
            let day, month, year;
        
            // Check if a full date (day.month.year or day/month/year) was provided
            if (dateParts.length === 3) {
                day = parseInt(dateParts[0]);
                month = parseInt(dateParts[1]);
                year = parseInt(dateParts[2]);
            } 
            // If only day/month is provided, use the current year
            else if (dateParts.length === 2) {
                day = parseInt(dateParts[0]);
                month = parseInt(dateParts[1]);
                year = new Date().getFullYear();  // Current year
            }
            // If only day is provided, use the current month and year
            else if (dateParts.length === 1) {
                day = parseInt(dateParts[0]);
                month = new Date().getMonth() + 1;  // Current month
                year = new Date().getFullYear();    // Current year
            }
        
            // Format date as MM/DD/YYYY
            const formattedDate = `${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}/${year}`;
        
            postConditions.push({
                [db.Sequelize.Op.and]: [
                    db.Sequelize.where(
                        db.Sequelize.fn('DATE', db.Sequelize.col('Post.createdAt')),
                        '=',
                        formattedDate
                    )
                ]
            });
        }

        const posts = await db.Post.findAndCountAll({
            where: postConditions.length > 0
                ? { [db.Sequelize.Op.and]: postConditions }
                : {},
            include: [
                {
                    association: "categories",
                    where: categoryIds.length > 0
                        ? { id: { [db.Sequelize.Op.in]: categoryIds } }
                        : undefined,
                    required: categoryIds.length > 0
                }
            ],
            limit: pageSize,
            offset: offset
        });

        results.posts = posts.rows;
        results.totalResults += posts.count; // Add to totalResults
        // console.log(results.totalResults);

        res.status(200).json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to process search' });
    }
};
