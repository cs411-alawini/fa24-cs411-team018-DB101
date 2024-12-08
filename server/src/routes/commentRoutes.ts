import { Router, Request, Response } from "express";
import { Comment } from "../models/Comment";
import { getAllComments, getCommentByUserId, createComment, updateComment, deleteComment } from "../services/database";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const comments: Comment[] = await getAllComments();
        res.status(200).json({ success: true, data: comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.get('/:userId', async (req, res) => {
    console.log('Received request to /comment/:userId');
    const userId = Number(req.params.userId);
    console.log('Extracted userId:', userId);
    try {
      const comments = await getCommentByUserId(userId);
      res.status(200).json({ success: true, data: comments });
    } catch (error) {
      console.error('Error fetching comments by user ID:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
});
  

router.post("/", async (req: Request, res: Response) => {
    try {
        const comment: Comment = req.body;
        const newComment: Comment = await createComment(comment);
        res.status(201).json({ success: true, data: newComment });
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.put("/:commentId", async (req: Request, res: Response) => {
    try {
        const comment: Comment = req.body;
        const updatedComment = await updateComment(comment);
        
        res.status(200).json({ success: true, data: updatedComment });
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.delete("/:commentId", async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        await deleteComment(Number(commentId));
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;
