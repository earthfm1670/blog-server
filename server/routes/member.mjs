import { Router } from "express";

const memberRouter = Router();

memberRouter.get("/", async (req, res) => {
  try {
    const category = req.query.category || "";
    const keyword = req.query.keyword || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;

    // Safe pagination parameters
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const offset = (safePage - 1) * safeLimit;

    let query = `
        SELECT 
          posts.id,
          posts.image,
          categories.name AS category,
          posts.title,
          posts.description,
          posts.date,
          posts.content,
          statuses.status,
          posts.likes_count
        FROM posts
        INNER JOIN categories ON posts.category_id = categories.id
        INNER JOIN statuses ON posts.status_id = statuses.id
      `;

    let values = [];

    // Add filtering based on category and keyword
    if (category && keyword) {
      query += `
          WHERE categories.name ILIKE $1
          AND (posts.title ILIKE $2 OR posts.description ILIKE $2 OR posts.content ILIKE $2)
        `;
      values = [`%${category}%`, `%${keyword}%`];
    } else if (category) {
      query += `
          WHERE categories.name ILIKE $1
        `;
      values = [`%${category}%`];
    } else if (keyword) {
      query += `
          WHERE posts.title ILIKE $1
          OR posts.description ILIKE $1
          OR posts.content ILIKE $1
        `;
      values = [`%${keyword}%`];
    }

    // Add pagination to the query
    query += `
        ORDER BY posts.date DESC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `;
    values.push(safeLimit, offset);

    // Fetch the posts data
    const result = await connectionPool.query(query, values);

    // Create count query to calculate total posts
    let countQuery = `
        SELECT COUNT(*) 
        FROM posts
        INNER JOIN categories ON posts.category_id = categories.id
        INNER JOIN statuses ON posts.status_id = statuses.id
      `;
    let countValues = [];

    if (category && keyword) {
      countQuery += `
          WHERE categories.name ILIKE $1
          AND (posts.title ILIKE $2 OR posts.description ILIKE $2 OR posts.content ILIKE $2)
        `;
      countValues = [`%${category}%`, `%${keyword}%`];
    } else if (category) {
      countQuery += ` WHERE categories.name ILIKE $1 `;
      countValues = [`%${category}%`];
    } else if (keyword) {
      countQuery += `
          WHERE posts.title ILIKE $1
          OR posts.description ILIKE $1
          OR posts.content ILIKE $1
        `;
      countValues = [`%${keyword}%`];
    }

    // Execute the count query
    const countResult = await connectionPool.query(countQuery, countValues);
    const totalPosts = parseInt(countResult.rows[0].count, 10);

    // Prepare the final result object
    const results = {
      totalPosts,
      totalPages: Math.ceil(totalPosts / safeLimit),
      currentPage: safePage,
      limit: safeLimit,
      posts: result.rows,
    };

    // Add nextPage and previousPage to the result if applicable
    if (offset + safeLimit < totalPosts) {
      results.nextPage = safePage + 1;
    }

    if (offset > 0) {
      results.previousPage = safePage - 1;
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({
      message: "Server could not read posts due to a database issue",
      error: err.message, // Include error message for debugging
    });
  }
});

export default memberRouter;
