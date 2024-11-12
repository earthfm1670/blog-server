export const validateCreatePostData = (req, res, next) => {
  const { title, image, category_id, description, content, status_id } =
    req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title is required",
    });
  }
  if (typeof title !== "string") {
    return res.status(400).json({
      message: "Title must be a string",
    });
  }
  if (!image) {
    return res.status(400).json({
      message: "Image is required",
    });
  }
  if (typeof image !== "string") {
    return res.status(400).json({
      message: "Image must be a string",
    });
  }
  if (!category_id) {
    return res.status(400).json({
      message: "category_id is required",
    });
  }
  if (typeof category_id !== "number") {
    return res.status(400).json({
      message: "category_id must be a number",
    });
  }
  if (!description) {
    return res.status(400).json({
      message: "description is required",
    });
  }
  if (typeof description !== "string") {
    return res.status(400).json({
      message: "description must be a string",
    });
  }
  if (!content) {
    return res.status(400).json({
      message: "content is required",
    });
  }
  if (typeof content !== "string") {
    return res.status(400).json({
      message: "content must be a string",
    });
  }
  if (!status_id) {
    return res.status(400).json({
      message: "status_id is required",
    });
  }
  if (typeof status_id !== "number") {
    return res.status(400).json({
      message: "status_id must be number",
    });
  }

  next();

  //   ////////////////
  //   if (!req.body.length) {
  //     return res.status(400).json({
  //       message: "กรุณาส่งข้อมูล Length ของโพสเข้ามาด้วย",
  //     });
  //   }

  //   const postLengthList = ["short", "long", "medium"];
  //   const hasPostLengthList = postLengthList.includes(req.body.length);

  //   if (!hasPostLengthList) {
  //     return res.status(400).json({
  //       message:
  //         "กรุณาส่งข้อมูล Length ของโพสต์ตามที่กำหนด เช่น 'short', 'long', หรือ 'medium'",
  //     });
  //   }

  //   if (req.body.length > 100) {
  //     return res.status(400).json({
  //       message: "กรุณาส่งข้อมูล Content ของโพสต์ตามที่กำหนดไม่เกิน 100 ตัวอักษร",
  //     });
  //   }
};
