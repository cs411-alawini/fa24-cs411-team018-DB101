import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRankingAndCommentAndUniveristyByUniversityName } from "../services/universityServices";
import { createComment } from "../services/commentServices";

interface Params {
  universityName: string;
}

interface University {
  universityName: string;
  description: string;
  establishmentDate: string;
  location: string;
  country: string;
  popularity: number;
}

interface Ranking {
  source: string;
  academicRep: number;
  employerRep: number;
  facultyStudentScore: number;
  citationPerFaculty: number;
  internationalScore: number;
}

interface Comment {
  livingEnvironment: number;
  learningAtmosphere: number;
  library: number;
  restaurant: number;
  content: string;
  date: Date;
}

const UniversityInfoPage: React.FC = () => {
  const { universityName } = useParams<{ universityName: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showPopup, setShowPopup] = useState(false);
  const [newComment, setNewComment] = useState<Comment>({
    livingEnvironment: 0,
    learningAtmosphere: 0,
    library: 0,
    restaurant: 0,
    content: "",
    date: new Date(),
  });
  const userID = Number(localStorage.getItem("userID"));
  useEffect(() => {
    const fetchUniversityData = async () => {
      try {
        if (!universityName) {
          setError("University name is undefined.");
          setLoading(false);
          return;
        }
        const response = await getRankingAndCommentAndUniveristyByUniversityName(decodeURIComponent(universityName));
        if (response.status === 200 && response.data.data) {
          const data = response.data.data;
          const universityData = data[0];
          setUniversity({
            universityName: universityData.universityName,
            description: universityData.description,
            establishmentDate: universityData.establishmentDate,
            location: universityData.location,
            country: universityData.country,
            popularity: universityData.popularity,
          });
          const rankings = data
            .filter((item: any) => item.source) // Filter items with a valid source
            .reduce((unique: any[], current: any) => {
                if (!unique.some((item) => item.source === current.source)) {
                unique.push({
                    source: current.source,
                    academicRep: current.academicRep,
                    employerRep: current.employerRep,
                    facultyStudentScore: current.facultyStudentScore,
                    citationPerFaculty: current.citationPerFaculty,
                    internationalScore: current.internationalScore,
                });
                }
                return unique;
            }, []);
            setRanking(rankings);

            const comments = data
                .filter((item: any) => item.livingEnvironment || item.content) // Include valid ratings or comments
                .map((item: any) => ({
                livingEnvironment: item.livingEnvironment || 0,
                learningAtmosphere: item.learningAtmosphere || 0,
                library: item.library || 0,
                restaurant: item.restaurant || 0,
                content: item.content || "No additional comments",
                date: item.date,
                }));
            setComments(comments);
        } else {
          setError("University not found.");
        }
      } catch (error) {
        console.error("Error fetching university data:", error);
        setError("Failed to fetch university data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUniversityData();
  }, [universityName]);

  if (loading) {
    return <p>Loading university information...</p>;
  }

  if (error) {
    return (
      <p style={{ color: "red", textAlign: "center", fontSize: "1.2rem" }}>
        {error}
      </p>
    );
  }

  if (!university) {
    return (
      <p style={{ textAlign: "center", fontSize: "1.2rem" }}>
        No university data available.
      </p>
    );
  }

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewComment({ ...newComment, [name]: value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCommentData = {
        universityName: university.universityName,
        userId: userID,
        livingEnvironment: newComment.livingEnvironment,
        learningAtmosphere: newComment.learningAtmosphere,
        library: newComment.library,
        restaurant: newComment.restaurant,
        content: newComment.content,
        date: new Date(), // Use ISO format
      };
  
      await createComment(newCommentData);
      setComments([...comments, newCommentData]); // Append locally
      const response = await getRankingAndCommentAndUniveristyByUniversityName(decodeURIComponent(university.universityName));
      if (response.status === 200 && response.data.data) {
        const updatedUniversityData = response.data.data[0];
        setUniversity({
          universityName: updatedUniversityData.universityName,
          description: updatedUniversityData.description,
          establishmentDate: updatedUniversityData.establishmentDate,
          location: updatedUniversityData.location,
          country: updatedUniversityData.country,
          popularity: updatedUniversityData.popularity,
        });
      }
      setNewComment({
        livingEnvironment: 0,
        learningAtmosphere: 0,
        library: 0,
        restaurant: 0,
        content: "",
        date: new Date(),
      });
      setShowPopup(false);
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };


  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
      <h1 style={{ textAlign: "center", color: "#1a202c", fontSize: "2.5rem", margin: "20px 0", fontWeight: "bold" }}>
        {university.universityName}
      </h1>
      
      <p style={{ color: "#555", fontSize: "1.2rem", marginBottom: "10px" }}>{university.description}</p>
      <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <p><strong>Establishment:</strong> {university.establishmentDate}</p>
        <p><strong>Location:</strong> {university.location}, {university.country}</p>
        <p><strong>Popularity:</strong> {university.popularity || "Not available"}</p>
      </div>

      <h2 style={{ color: "#2c3e50", fontSize: "1.8rem", marginBottom: "10px" }}>Ranking Metrics</h2>
      {ranking.map((ranking, index) => (
        <div key={index} style={{ background: "#f1f1f1", padding: "15px", borderRadius: "8px", marginBottom: "10px" }}>
          <p><strong>Source:</strong> {ranking.source}</p>
          <p><strong>Academic Reputation:</strong> {ranking.academicRep}</p>
          <p><strong>Employer Reputation:</strong> {ranking.employerRep}</p>
          <p><strong>Faculty Student Score:</strong> {ranking.facultyStudentScore}</p>
          <p><strong>Citations per Faculty:</strong> {ranking.citationPerFaculty}</p>
          <p><strong>International Score:</strong> {ranking.internationalScore}</p>
        </div>
      ))}

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
      <h2 style={{ color: "#2c3e50", fontSize: "1.8rem" }}>User Comments</h2>
      <button
          style={{ padding: "10px 20px", fontSize: "1rem", cursor: "pointer", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", transition: "background-color 0.3s" }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
          onClick={handleButtonClick}
        >
          Create a Comment
        </button>
    </div>
      
      {comments.length > 0 ? (
        comments.map((comment, index) => (
          <div key={index} style={{ background: "#fefefe", padding: "15px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "10px" }}>
            <p><strong>Living Environment:</strong> {comment.livingEnvironment}</p>
            <p><strong>Learning Atmosphere:</strong> {comment.learningAtmosphere}</p>
            <p><strong>Library:</strong> {comment.library}</p>
            <p><strong>Restaurant:</strong> {comment.restaurant}</p>
            <p><strong>Content:</strong> {comment.content}</p>
            <p><strong>Date:</strong> {new Date(comment.date).toLocaleDateString()}</p>
          </div>
        ))
      ) : (
        <p style={{ color: "#555", textAlign: "center" }}>No comments available for this university.</p>
      )}

    {showPopup && (
    <div style={{ 
        position: "fixed", 
        top: "50%", 
        left: "50%", 
        transform: "translate(-50%, -50%)", 
        backgroundColor: "#fff", 
        padding: "20px", 
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", 
        zIndex: 1000, 
        borderRadius: "8px", 
        width: "400px" 
    }}>
        <h2 style={{ 
        marginBottom: "20px", 
        fontSize: "1.5rem", 
        color: "#333", 
        textAlign: "center" 
        }}>Create a Comment</h2>
        <form onSubmit={handleFormSubmit}>
        <label style={{ display: "block", marginBottom: "10px" }}>
            Living Environment:
            <input 
            type="number" 
            name="livingEnvironment" 
            value={newComment.livingEnvironment} 
            onChange={handleInputChange} 
            style={{ 
                width: "100%", 
                padding: "8px", 
                marginTop: "5px", 
                borderRadius: "4px", 
                border: "1px solid #ccc" 
            }} 
            />
        </label>
        <label style={{ display: "block", marginBottom: "10px" }}>
            Learning Atmosphere:
            <input 
            type="number" 
            name="learningAtmosphere" 
            value={newComment.learningAtmosphere} 
            onChange={handleInputChange} 
            style={{ 
                width: "100%", 
                padding: "8px", 
                marginTop: "5px", 
                borderRadius: "4px", 
                border: "1px solid #ccc" 
            }} 
            />
        </label>
        <label style={{ display: "block", marginBottom: "10px" }}>
            Library:
            <input 
            type="number" 
            name="library" 
            value={newComment.library} 
            onChange={handleInputChange} 
            style={{ 
                width: "100%", 
                padding: "8px", 
                marginTop: "5px", 
                borderRadius: "4px", 
                border: "1px solid #ccc" 
            }} 
            />
        </label>
        <label style={{ display: "block", marginBottom: "10px" }}>
            Restaurant:
            <input 
            type="number" 
            name="restaurant" 
            value={newComment.restaurant} 
            onChange={handleInputChange} 
            style={{ 
                width: "100%", 
                padding: "8px", 
                marginTop: "5px", 
                borderRadius: "4px", 
                border: "1px solid #ccc" 
            }} 
            />
        </label>
        <label style={{ display: "block", marginBottom: "20px" }}>
            Content:
            <textarea 
            name="content" 
            value={newComment.content} 
            onChange={handleInputChange} 
            style={{ 
                width: "100%", 
                padding: "8px", 
                marginTop: "5px", 
                borderRadius: "4px", 
                border: "1px solid #ccc", 
                height: "100px" 
            }} 
            ></textarea>
        </label>
        <button 
          type="submit" 
          style={{ 
            width: "48%", 
            padding: "10px", 
            backgroundColor: "#007bff", 
            color: "#fff", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer", 
            fontSize: "1rem" 
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
        >
          Submit
        </button>
        <button 
          type="button" 
          style={{ 
            width: "48%", 
            padding: "10px", 
            backgroundColor: "#6c757d", 
            color: "#fff", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer", 
            fontSize: "1rem" 
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5a6268")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6c757d")}
          onClick={() => setShowPopup(false)}
        >
          Cancel
        </button>
        </form>
    </div>
    )}
    </div>
  );
};

export default UniversityInfoPage;
