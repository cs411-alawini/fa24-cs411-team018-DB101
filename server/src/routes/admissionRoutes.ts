import { Router, Request, Response } from "express";
import { getAdmission, keywordSearch } from "../services/admissionDatabase";
const router = Router();

// keyword search
router.get('/keyword',async (req: Request, res: Response) => {
    try {
        const keywordString = req.query.keywords as string;
        const keywords = keywordString.split(' ');
        const result = await keywordSearch(keywords);
        res.status(400).json(result);

    } catch (error) {
        console.error('Error fetching admission data:', error);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
});

export default router;