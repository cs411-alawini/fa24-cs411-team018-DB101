import { Router, Request, Response } from "express";
import { searchRanking, addFavourite, removeFavourite, isFavourite,getCountriesFromDatabase } from "../services/database";
import { log } from "console";


const router = Router();

// 搜索大学排名
router.get("/search", async (req: Request, res: Response) => {
    const { keyword, country, source, academicRepFilter } = req.query;

    try {
        const rankings = await searchRanking(
            (keyword as string) || "",
            (country as string) || "",
            (source as string) || "",
            (academicRepFilter as string) || "" // 传递 academicRepFilter
        );
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

router.post("/favourite", async (req: Request, res: Response) => {
    const { userID, universityName } = req.body;

    if (!userID || !universityName) {
        console.error("POST /favourite: Missing parameters", req.body);
        res.status(400).json({ success: false, message: "UserID and universityName are required" });
        return;
    }

    try {
        await addFavourite(Number(userID), universityName);
        console.log(`Added favourite: userID=${userID}, universityName=${universityName}`);
        res.status(200).json({ success: true, message: "Added to favourites" });
    } catch (error: any) {
        if (error.message.includes("Record already exists")) {
            res.status(409).json({ success: false, message: "Record already exists" }); // 返回冲突状态码
        } else {
            console.error("Error in addFavourite:", error);
            res.status(500).json({ success: false, message: "Failed to add to favourites" });
        }
    }
});

router.delete("/favourite", async (req: Request, res: Response) => {
    console.log("Received DELETE request with:", req.query, req.body); // 打印收到的参数
    const { userID, universityName } = req.query; // 从 query 中解析参数

    if (!userID || !universityName) {
        console.error("DELETE /favourite: Missing parameters", req.query || req.body);
        return res.status(400).json({ success: false, message: "UserID and universityName are required" });
    }

    try {
        console.log(`Attempting to delete: userID=${userID}, universityName=${universityName}`);
        await removeFavourite(Number(userID), universityName as string);
        console.log(`Successfully removed: userID=${userID}, universityName=${universityName}`);
        return res.status(200).json({ success: true, message: "Removed from favourites" });
    } catch (error) {
        console.error("Error in removeFavourite:", error);
        return res.status(500).json({ success: false, message: "Failed to remove from favourites" });
    }
});


// 检查是否已收藏
router.get("/favourite", async (req: Request, res: Response) => {
    const { userID, universityName } = req.query;

    // 验证参数
    if (!userID || typeof Number(userID) !== "number" || !universityName || typeof universityName !== "string") {
        res.status(400).json({ success: false, message: "Invalid or missing parameters: userID and universityName are required." });
        return;
    }

    try {
        const favourite = await isFavourite(Number(userID), universityName as string);
        console.log(`Checked favourite: userID=${userID}, universityName=${universityName}, isFavourite=${favourite}`);
        res.status(200).json({ success: true, favourite });
    } catch (error) {
        console.error("Error in isFavourite:", error);
        res.status(500).json({ success: false, message: "Failed to check favourite status." });
    }
});

export default router;
