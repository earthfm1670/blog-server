import { Router } from "express";
import { validateCreatePostData } from "../post.validation.mjs";
import connectionPool from "../../utils/db.mjs";

const postRouter = Router();

postRouter.post("/", [validateCreatePostData], async (req, res) => {
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

// postRouter.put("/:postId", async (req, res) => {
//   const postIdFromClient = req.params.postId;
//   const updatedPost = { ...req.body, updated_at: new Date() };

//   try {
//     let results = await connectionPool.query(
//       `update posts
//       set title = $2,
//       content = $3,
//       category = $4,
//       length = $5,
//       status = $6,
//       updated_at = $7,
//       where post_id = $1`,
//       [
//         postIdFromClient,
//         updatedPost.title,
//         updatedPost.content,
//         updatedPost.category,
//         updatedPost.length,
//         updatedPost.status,
//         updatedPost.updated_at,
//       ]
//     );
//     if (!results.rows[0]) {
//       return res.status(404).json({
//         message: `Server could not find a requested post
//               (post id: ${postIdFromClient})`,
//       });
//     }
//     return res.status(200).json({
//       message: "Updated post successfully",
//     });
//   } catch {
//     return res.status(500).json({
//       message: "Server could not update post because database connection",
//     });
//   }
// });

postRouter.get("/:postId", async (req, res) => {
  const postIdFromClient = req.params.postId;
  try {
    let results = await connectionPool.query(
      `select * from posts where id=$1`,
      [postIdFromClient]
    );
    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json(results.rows);
  } catch {
    return res.status(500).json({
      message: "Server could not read post because database connection",
    });
  }
});

postRouter.put("/:postId", [validateCreatePostData], async (req, res) => {
  const postIdFromClient = req.params.postId;
  const updatedPost = req.body;
  try {
    let results = await connectionPool.query(
      `update posts
        set title = $2,
        image = $3,
        category_id = $4,
        description = $5,
        content = $6,
        status_id = $7
        where id = $1`,
      [
        postIdFromClient,
        updatedPost.title,
        updatedPost.image,
        updatedPost.category_id,
        updatedPost.description,
        updatedPost.content,
        updatedPost.status_id,
      ]
    );
    if (results.rowCount === 0) {
      return res.status(404).json({
        message: `Server could not find a requested post
                (post id: ${postIdFromClient})`,
      });
    }
    return res.status(200).json({
      message: "Updated post successfully",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Server could not update post because database connection",
    });
  }
});

postRouter.delete("/:postId", async (req, res) => {
  const postIdFromClient = req.params.postId;
  try {
    let results = await connectionPool.query(
      `
        DELETE FROM posts where id=$1
        `,
      [postIdFromClient]
    );
    if (results.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested post to delete",
      });
    }
    return res.status(200).json({
      message: "Deleted post sucessfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not delete post because database connection",
    });
  }
});

export default postRouter;
