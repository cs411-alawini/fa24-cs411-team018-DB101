import { Router, Request, Response } from "express";
import {
    getAllUniversities,
    getUniversityByName,
    getUniversityByPopularity,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    getRankingAndCommentAndUniveristyByUniversityName,
    getPopularUniversities
} from "../services/database";
import { University } from "../models/University";


const router = Router();


router.get("/", async (req: Request, res: Response) => {
    try {
        const universities: University[] = await getAllUniversities();
        res.status(200).json({ success: true, data: universities });
    } catch (error) {
        console.error("Error fetching universities:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.get("/popular", async (req: Request, res: Response) => {
    try {
        const universities: University[] = await getPopularUniversities();
        res.status(200).json({ success: true, data: universities });
    } catch (error) {
        console.error("Error fetching universities:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


router.get("/:universityName", async (req: Request, res: Response) => {
    const { universityName } = req.params;
    const { description, establishmentDate, location, country, popularity } = req.query;

    try {
        const university = await getUniversityByName(
            (universityName as string || ""),
            (description as string || ""),
            (establishmentDate as string || ""),
            ( location as string || "" ),
            (country as string || ""),
            Number(popularity) || undefined
        );
        res.status(200).json({ success: true, data: university});
    } catch (error) {
        console.error("Error fetching university:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.get("/popularity/:popularity", async (req: Request, res: Response) => {
    const { popularity } = req.params;

    try {
        const universities: University[] = await getUniversityByPopularity(Number(popularity));
        res.status(200).json({ success: true, data: universities });
    } catch (error) {
        console.error("Error fetching universities by popularity:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



router.post("/", async (req: Request, res: Response) => {
    const { universityName, description, establishmentDate, location, country, popularity } = req.body;

    
    // if (!universityName || !description || !establishment || !location || !country || popularity === undefined) {
    //     return res.status(400).json({ success: false, message: "All fields are required" });
    // }

    const newUniversity: University = {
        universityName,
        description,
        establishmentDate,
        location,
        country,
        popularity,
    };

    try {
        const createdUniversity = await createUniversity(newUniversity);
        res.status(201).json({ success: true, data: createdUniversity });
    } catch (error) {
        console.error("Error creating university:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


router.put("/:universityName", async (req: Request, res: Response) => {
    const { universityName } = req.params;
    const { description, establishmentDate, location, country, popularity } = req.body;

    
    // if (!description && !establishmentDate && !location && !country && popularity === undefined) {
    //     return res.status(400).json({ success: false, message: "At least one field must be updated" });
    // }

    const updatedFields: Partial<University> = {};
    if (description) updatedFields.description = description;
    if (establishmentDate) updatedFields.establishmentDate = establishmentDate;
    if (location) updatedFields.location = location;
    if (country) updatedFields.country = country;
    if (popularity !== undefined) updatedFields.popularity = popularity;

    try {
        const updatedUniversity = await updateUniversity(universityName, updatedFields);
        // if (!updatedUniversity) {
        //     return res.status(404).json({ success: false, message: "University not found" });
        // }
        res.status(200).json({ success: true, data: updatedUniversity });
    } catch (error) {
        console.error("Error updating university:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


router.delete("/:universityName", async (req: Request, res: Response) => {
    const { universityName } = req.params;

    try {
        const deleted = await deleteUniversity(universityName);
        // if (!deleted) {
        //     return res.status(404).json({ success: false, message: "University not found" });
        // }
        res.status(200).json({ success: true, message: "University deleted successfully" });
    } catch (error) {
        console.error("Error deleting university:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.get('/:universityName/info', async (req: Request, res: Response) => {
    const { universityName } = req.params;
    const { 
        source, 
        academicRep, 
        employerRep, 
        facultyStudentScore, 
        citationPerFaculty, 
        internationalScore,
        description,
        establishmentDate,
        location,
        country,
        popularity,
        livingEnvironment,
        learningAtmosphere,
        library,
        restaurant,
        content,
        date
    } = req.query;
  
    try {
    
        
      const data = await getRankingAndCommentAndUniveristyByUniversityName(
        universityName as string || "",
        source as string || "",
        academicRep ? Number(academicRep) : 0,
        employerRep ? Number(employerRep) : 0,
        Number(facultyStudentScore) || 0,
        Number(citationPerFaculty) || 0,
        Number(internationalScore) || 0,
        description as string || "",
        establishmentDate as string || "",
        location as string || "",
        country as string || "",
        Number(popularity) || 0,
        Number(livingEnvironment) || 0,
        Number(learningAtmosphere) || 0,
        Number(library) || 0,
        Number(restaurant) || 0,
        content as string || "",
        date ? new Date(date as string) : new Date()
        
    );
  
  
      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error('Error fetching ranking and comments:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
});

export default router;