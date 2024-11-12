import express from "express";
import cors from "cors";
import connectionPool from "./utils/db.mjs";
import memberRouter from "./routes/member.mjs";
import blogPostRouter from "./routes/posts.mjs";

const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());
app.use("/", memberRouter);
app.use("/posts", blogPostRouter);

app.get("/profiles", (req, res) => {
  res.json({
    data: {
      name: "john",
      age: 20,
    },
  });
});

app.get("/", async (req, res) => {
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

// app.delete("/posts/:postId", async (req, res) => {
//   const postIdFromClient = req.params.postId;
//   try {
//     let results = await connectionPool.query(
//       `delete from posts
//       where post_id = $1`,
//       [postIdFromClient]
//     );
//     if (!results.rows[0]) {
//       return res.status(404).json({
//         message: `Server could not find a requested post
//         (post id: ${postIdFromClient})`,
//       });
//     }
//     return res.status(200).json({
//       message: "Delete post successfully",
//     });
//   } catch {
//     return res.status(500).json({
//       message: "Server could not update post because database connection",
//     });
//   }
// });

// app.post("/posts", async (req, res) => {
//   //postlogic
//   //1. access cody body from request with req.body
//   const newPost = {
//     ...req.body,
//     created_at: new Date(),
//     updated_at: new Date(),
//     published_at: new Date(),
//   };
//   //2. write query to insert post data with connection pool
//   await connectionPool.query(
//     `insert into posts (user_id, title, content, category, length, created_at, updated_at, published_at, status)
//     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
//     [
//       1,
//       newPost.title,
//       newPost.content,
//       newPost.category,
//       newPost.length,
//       newPost.created_at,
//       newPost.updated_at,
//       newPost.published_at,
//       newPost.status,
//     ]
//   );
//   //3. return response to client with res.
//   return res.status(201).json({
//     message: "Created post successfully",
//   });
// });

// app.get("/posts", async (req, res) => {
//   try {
//     let results = await connectionPool.query(`select * from posts`);
//   } catch {
//     return res.status(500).json({
//       message: "Server could not read post because database issue",
//     });
//   }
//   return res.status(200).json({
//     data: results.rows,
//   });
// });

// app.get("/posts", async (req, res) => {
//   let results;
//   const category = req.query.category;
//   const length = req.query.length;
//   try {
//     results = await connectionPool.query(
//       `select * from posts
//       where
//       (category = $1 or $1 is null or $1 = "")
//       and
//       (length = $2 or $2 is null or $2 = "")`, [category, length]
//     );
//   } catch {
//     return res.status(500).json({
//       message: "Server could not read post because database issue",
//     })
//   }
// })

// app.get("/posts/:postId", async (req, res) => {
//   try {
//     const postIdFromClient = req.params.postId;
//     const results = await connectionPool.query(
//       `select * from posts where post_id=$1`,
//       [postIdFromClient]
//     );
//     if (!results.rows[0]) {
//       return res.status(404).json({
//         message: `Server could not find a requested post
//         (post id: ${postIdFromClient})`,
//       });
//     }
//     return res.status(200).json({
//       data: results.rows[0],
//     });
//   } catch {
//     return res.status(500).json({
//       message: "Server could not read post because database issue",
//     });
//   }
// });

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
