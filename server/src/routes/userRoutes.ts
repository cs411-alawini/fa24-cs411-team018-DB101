import { Router, Request, Response } from "express";
import { getUserByID, loginVerify, addUser, updateUserName, deleteUser, getUserFavourites } from "../services/database";
import { User } from "../models/User";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    res.send("123");
});
//loginVerify
router.post("/session",async (req:Request,res:Response)=>{
    const newUser: Omit<User, 'userID'> = req.body;
    console.log(newUser)
    try {
        const result = await loginVerify(newUser.email,newUser.password);
        if (result != -1)
            res.status(200).json({
                success: true,
                message: "Login successfully",
                userID:result
            });
        else
            res.status(200).json({ success: false, message: "Email or password is wrong",userID:-1 });
    } catch (error) {
        res.status(500).json({ success: false, message: "server error",userID:-1 });
    }
})


// create
router.post("/", async (req: Request, res: Response) => {
    const newUser: Omit<User, 'userID'> = req.body;
    console.log(newUser)
    try {
        const result = await addUser(newUser);
        if (result == 0)
            res.status(200).json({
                success: true,
                message: "You have successfully registered"
            });
        else
            res.status(200).json({ success: false, message: "Email existed" });
    } catch (error) {
        res.status(500).json({ success: false, message: "server error" });
    }
});
// read
router.get("/:userID", async (req: Request, res: Response) => {
    try {
        const userID = parseInt(req.params.userID);
        const user = await getUserByID(userID);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const { password, ...safeUser } = user;

        res.status(200).json({
            success: true,
            message: "User found",
            data: safeUser
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
});
//update
router.patch("/:userID", async (req: Request, res: Response) => {
    try {
        const userID = parseInt(req.params.userID);
        const { userName } = req.body;

        if (!userName) {
            res.status(400).json({
                success: false,
                message: "Please provide username"
            });
        }

        const result = await updateUserName(userID, userName);

        if (result === 0) {
            res.status(200).json({
                success: true,
                message: "Username updated successfully"
            });
        } else {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

    } catch (error) {
        console.error('Update username error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});
//delete

router.delete("/:userID", async (req: Request, res: Response) => {
    try {
        const userID = parseInt(req.params.userID);

        const result = await deleteUser(userID);

        if (result === 0) {
            res.status(200).json({
                success: true,
                message: "User deleted successfully"
            }); 
        } else {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

router.get("/favourites/:userID", async (req: Request, res: Response) => {
    const userID = parseInt(req.params.userID, 10);

    if (isNaN(userID)) {
        res.status(400).json({ success: false, message: "Invalid userID" });
    }

    try {
        const favourites = await getUserFavourites(userID);
        res.json({ success: true, data: favourites });
    } catch (error) {
        console.error("Error fetching favourites:", error);
        res.status(500).json({ success: false, message: "Failed to fetch favourites" });
    }
});

export default router;