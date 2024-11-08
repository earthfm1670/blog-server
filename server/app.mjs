import express from "express";
import cors from "cors";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get("/profiles", (req, res) => {
  res.json({
    data: {
      name: "john",
      age: 20,
    },
  });
});

app.post("/posts", async (req, res) => {
  const newPost = req.body;
  if (
    !newPost.title ||
    !newPost.image ||
    !newPost.category_id ||
    !newPost.description ||
    !newPost.content ||
    !newPost.status_id
  ) {
    return res.status(400).json({
      message: "Server could not create post because database connection",
    });
  }
  try {
    const query = await connectionPool.query(
      `
      INSERT into posts (title, image, category_id, description, content, status_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        newPost.title,
        newPost.image,
        newPost.category_id,
        newPost.description,
        newPost.content,
        newPost.status_id,
      ]
    );
    return res.status(201).json({
      message: "Created post successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not create post because database connection",
    });
  }
});

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
