import { Router, Request, Response } from "express";
import { searchRanking, addFavourite, removeFavourite, isFavourite,getCountriesFromDatabase } from "../services/database";
import { log } from "console";

const router = Router();

// 搜索大学排名
router.get("/search", async (req: Request, res: Response) => {
    const { keyword, country } = req.query;
    if (!keyword) {
        res.status(400).json({ success: false, message: "Keyword is required" });
        return;
    }

    try {

        const rankings = await searchRanking(keyword as string, country as string);
        res.status(200).json({ success: true, data: rankings });
    } catch (error) {
        console.error("Error in /searchRanking:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

//创建API获取国家列表
router.get("/countries", async (req: Request, res: Response) => {
    try {
        console.log('th11111');
        const countries = await getCountriesFromDatabase(); // 假设从数据库查询国家列表
        res.json({ success: true, data: countries });
      } catch (error) {
        console.log('th22222');
        console.error("Error fetching countries:", error);
        res.status(500).json({ success: false, message: "Failed to fetch countries" });
      } 
});

// 添加收藏
router.post("/favourite", async (req: Request, res: Response) => {
    console.log("POST /favourite called with body:", req.body);
    const { userID, universityName } = req.body;

    if (!userID || !universityName) {
        res.status(400).json({ success: false, message: "UserID and universityName are required" });
        return;
    }

    try {
        await addFavourite(Number(userID), universityName);
        res.status(200).json({ success: true, message: "Added to favourites" });
    } catch (error) {
        console.error("Error in addFavourite:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


// 取消收藏
router.delete("/favourite", async (req: Request, res: Response) => {
    const { userID, universityName } = req.body;

    if (!userID || !universityName) {
        res.status(400).json({ success: false, message: "UserID and universityName are required" });
        return;
    }

    try {
        await removeFavourite(Number(userID), universityName);
        res.status(200).json({ success: true, message: "Removed from favourites" });
    } catch (error) {
        console.error("Error in removeFavourite:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 检查是否已收藏
router.get("/favourite", async (req: Request, res: Response) => {
    const { userID, universityName } = req.query;

    if (!userID || !universityName) {
        res.status(400).json({ success: false, message: "UserID and universityName are required" });
        return;
    }

    try {
        const favourite = await isFavourite(Number(userID), universityName as string);
        res.status(200).json({ success: true, favourite });
    } catch (error) {
        console.error("Error in isFavourite:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;
