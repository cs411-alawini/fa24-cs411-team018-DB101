import { Router, Request, Response } from "express";
import { getAdmission, keywordSearch, addAdmission,deleteAdmission,updateAdmission,getAdmissionDataByUser,admissionAnalyze,getCountry,getPrograms } from "../services/admissionDatabase";
import { AdmissionData } from "../models/AdmissionData";
const router = Router();

// keyword search
router.get('/keyword',async (req: Request, res: Response) => {
    try {
        const keywordString = req.query.keywords as string;
        const keywords = keywordString.split(' ');
        const result = await keywordSearch(keywords);
        res.status(200).json(result);
        // console.log('keyword search');
        // console.log(result);
    } catch (error) {
        console.error('Error fetching admission data:', error);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
});

router.get('/country',async (req: Request, res: Response) => {
    try {
        const result = await getCountry();
        res.status(200).json(result);
        // console.log('keyword search');
        // console.log(result);
    } catch (error) {
        console.error('Error fetching admission data:', error);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
});

router.get('/program',async (req: Request, res: Response) => {
    try {
        const result = await getPrograms();
        res.status(200).json(result);
        // console.log('keyword search');
        // console.log(result);
    } catch (error) {
        console.error('Error fetching admission data:', error);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
});

//get detailed info
router.get('/:adID',async (req: Request, res: Response) => {
    try {
        const adID = req.params.adID;
        console.log(adID);
        const result = await getAdmission(parseInt(adID));
        // console.log(result);
        res.status(200).json(result);
        // console.log('getInfo');
        // console.log(result);
    } catch (error) {
        console.error('Error fetching admission data:', error);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
});

//get data by userID
router.get('/user/:userID',async (req: Request, res: Response) => {
    try {
        const userID = req.params.userID;
        const result = await getAdmissionDataByUser(parseInt(userID));
        // console.log(result);
        res.status(200).json(result);
        // console.log('getInfo');
        // console.log(result);
    } catch (error) {
        console.error('Error fetching admission data:', error);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
});

router.get('/',async (req: Request, res: Response) => {
    try {
        const GPA = parseFloat(req.query.GPA as string);
        const country = req.query.country as string;
        const programName = req.query.program as string;
        const type = parseInt(req.query.analyzeType as string);
        const result = await admissionAnalyze(GPA,country,programName,type);
        // console.log(result);
        res.status(200).json(result);
        // console.log('getInfo');
        // console.log(result);
    } catch (error) {
        console.error('Error fetching admission data:', error);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
});

//add admission info
router.post('/',async (req: Request, res: Response) => {
    try {
        const newData: Omit<AdmissionData,'adID'> = req.body; 
        console.log(newData);
        const result = await addAdmission(newData);
        // console.log(result);
        res.status(200).json(result);
        // console.log('getInfo');
        // console.log(result);
    } catch (error) {
        console.error('Error fetching admission data:', error);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
});

//delete
router.delete('/:adID',async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.adID);
        const result = await deleteAdmission(id);
        // console.log(result);
        res.status(200).json(result);
        // console.log('getInfo');
        // console.log(result);
    } catch (error) {
        console.error('Error fetching admission data:', error);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
});
// update admission data
router.patch('/',async (req: Request, res: Response) => {
    try {
        const editedData:AdmissionData = req.body;
        const result = await updateAdmission(editedData);
        // console.log(result);
        res.status(200).json(result);
        // console.log('getInfo');
        // console.log(result);
    } catch (error) {
        console.error('Error fetching admission data:', error);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
});



export default router;