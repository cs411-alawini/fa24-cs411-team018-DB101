import React, { useEffect, useState } from "react";
import {
  getAllUniversities,
  getUniversityByName,
  getUniversityByPopularity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from "../services/universityServices";
import { Link } from "react-router-dom";

const UniversityPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPopularity, setSearchPopularity] = useState<number | "">("");
  const [searchType, setSearchType] = useState("name"); // 'name' or 'popularity'
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // State for Modal (both Create and Update)
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "update"
  const [currentUniversity, setCurrentUniversity] = useState<any | null>(null);
  const [updatedFields, setUpdatedFields] = useState({
    universityName: "",
    description: "",
    establishmentDate: "",
    location: "",
    country: "",
    popularity: 0,
  });

  // State for Add Comment Modal
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [comment, setComment] = useState("");
  const [commentUniversity, setCommentUniversity] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userID = Number(localStorage.getItem("userID")); // Retrieve userID from localStorage
        if (!userID) {
          console.error("No userID found in localStorage");
          setIsAdmin(false);
          return;
        }
        setIsAdmin(userID === 511); // Check if userID is admin (e.g., 511)
      } catch (err) {
        console.error("Failed to fetch user role:", err);
        setIsAdmin(false);
      }
    };
    fetchUserRole();
  }, []);

  const handleGetAllUniversities = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllUniversities();
      setUniversities(response.data.data || []);
    } catch (err) {
      setError("An error occurred while fetching universities.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // const handleSearch = async () => {
  //   setLoading(true);
  //   setError("");
  //   try {
  //     let response;
  //     if (searchType === "name") {
  //       response = await getUniversityByName(searchTerm);
  //     } else if (searchType === "popularity") {
  //       response = await getUniversityByPopularity(Number(searchPopularity));
  //     }

  //     const universitiesData = response?.data?.data.map((university: any) => ({
  //       universityName: university.universityName,
  //       description: university.description,
  //       establishmentDate: university.establishmentDate,
  //       location: university.location,
  //       country: university.country,
  //       popularity: university.popularity,
  //     }));

  //     setUniversities(universitiesData || []);
  //   } catch (err) {
  //     setError("An error occurred while fetching universities.");
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (searchType === "name") {
        response = await getUniversityByName(searchTerm);
      }
      const universitiesData = response?.data?.data.map((university: any) => ({
              universityName: university.universityName,
              description: university.description,
              establishmentDate: university.establishmentDate,
              location: university.location,
              country: university.country,
              popularity: university.popularity,
            }));
      
            setUniversities(universitiesData || []);
    } catch (error) {
      console.error("Error searching universities:", error);
      setError("Failed to search universities");
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setUpdatedFields({
      universityName: "",
      description: "",
      establishmentDate: "",
      location: "",
      country: "",
      popularity: 0,
    });
    setModalVisible(true);
  };

  const handleCreateUniversity = async () => {
    try {
      await createUniversity(updatedFields);
      alert("University created successfully!");
      setModalVisible(false);
      handleGetAllUniversities(); // Refresh the list
    } catch (err) {
      console.error("Error creating university:", err);
      alert("Failed to create university.");
    }
  };

  const handleUpdateUniversity = (university: any) => {
    setModalMode("update");
    setCurrentUniversity(university.universityName);
    setUpdatedFields({
      universityName: university.universityName,
      description: university.description || "",
      establishmentDate: university.establishmentDate || "",
      location: university.location || "",
      country: university.country || "",
      popularity: university.popularity || 0,
    });
    setModalVisible(true);
  };

  const handleSaveUpdate = async () => {
    if (!currentUniversity) return;

    try {
      await updateUniversity(currentUniversity, updatedFields);
      alert("University updated successfully!");
      setModalVisible(false);
      handleGetAllUniversities(); // Refresh the list
    } catch (err) {
      console.error("Error updating university:", err);
      alert("Failed to update university.");
    }
  };

  const handleDeleteUniversity = async (universityName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${universityName}?`)) return;

    try {
      await deleteUniversity(universityName);
      alert("University deleted successfully!");
      handleGetAllUniversities(); // Refresh the list
    } catch (err) {
      console.error("Error deleting university:", err);
      alert("Failed to delete university.");
    }
  };

  const handleAddComment = (universityName: string) => {
    setCommentUniversity(universityName);
    setComment("");
    setCommentModalVisible(true);
  };

  const handleSaveComment = async () => {
    if (!commentUniversity) return;

    try {
      // Implement logic to save comment using API
      alert(`Comment added successfully for ${commentUniversity}`);
      setCommentModalVisible(false);
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment.");
    }
  };

  const handleRedirectToComments = () => {
    window.location.href = "http://localhost:3000/comment";
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#1a202c", fontSize: "2rem", margin: "20px 0", fontFamily: "'Playfair Display', serif" }}>
        Universities
      </h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter university name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
      </div>


      <button
        onClick={handleSearch}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: loading ? "#ccc" : "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      >
        {loading ? "Searching..." : "Search"}
      </button>
    

        <button
        onClick={handleRedirectToComments}
        style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1.2rem",
            fontWeight: "bold",
            marginTop: "10px",
        }}
        >
        Go to Comments
        </button>
      {error && <p style={{ color: "red", marginTop: "20px", textAlign: "center" }}>{error}</p>}

      {isAdmin && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={handleGetAllUniversities}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Get All Universities
          </button>
          <button
            onClick={openCreateModal}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Create University
          </button>
          {/* <button
            onClick={() => (window.location.href = "http://localhost:3007/api/comment")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            View Comments
          </button> */}
        </div>
      )}
      
      <ul style={{ listStyle: "none", padding: "0", marginTop: "20px" }}>
        {universities.map((university: any, index: number) => (
          <li
            key={index}
            style={{
              padding: "15px",
              borderBottom: "1px solid #ddd",
              backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
          >
            <div>
            <h3 style={{ margin: "0 0 10px 0", color: "#007BFF" }}>{university.universityName}</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p><strong>Description:</strong> {university.description}</p>
                <p><strong>Location:</strong> {university.location}</p>
                <p><strong>Country:</strong> {university.country}</p>
                <p><strong>Popularity:</strong> {university.popularity}</p>
              </div>
              <div>
                <Link
                  to={`/university/${encodeURIComponent(university.universityName)}`}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007BFF",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "5px",
                  }}
                >
                  View Details
                </Link>
              </div>
            </div>
            </div>
            {isAdmin && (
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => handleUpdateUniversity(university)}
                  style={{
                    padding: "5px 10px",
                    marginRight: "5px",
                    backgroundColor: "#ffc107",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteUniversity(university.universityName)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => handleAddComment(university.universityName)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Add Comment
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {isModalVisible && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "400px",
            }}
          >
            <h3>{modalMode === "create" ? "Create University" : `Update ${currentUniversity}`}</h3>
            {modalMode === "create" && (
              <label>University Name</label>
            )}
            {modalMode === "create" && (
              <input
                type="text"
                value={updatedFields.universityName}
                onChange={(e) => setUpdatedFields({ ...updatedFields, universityName: e.target.value })}
                style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
              />
            )}
            <label>Description</label>
            <input
              type="text"
              value={updatedFields.description}
              onChange={(e) => setUpdatedFields({ ...updatedFields, description: e.target.value })}
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <label>Establishment Date</label>
            <input
              type="date"
              value={updatedFields.establishmentDate}
              onChange={(e) =>
                setUpdatedFields({ ...updatedFields, establishmentDate: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <label>Location</label>
            <input
              type="text"
              value={updatedFields.location}
              onChange={(e) => setUpdatedFields({ ...updatedFields, location: e.target.value })}
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <label>Country</label>
            <input
              type="text"
              value={updatedFields.country}
              onChange={(e) => setUpdatedFields({ ...updatedFields, country: e.target.value })}
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <label>Popularity</label>
            <input
              type="number"
              value={updatedFields.popularity}
              onChange={(e) => setUpdatedFields({ ...updatedFields, popularity: Number(e.target.value) })}
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <button
              onClick={modalMode === "create" ? handleCreateUniversity : handleSaveUpdate}
              style={{
                padding: "10px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Save
            </button>
            <button
              onClick={() => setModalVisible(false)}
              style={{
                padding: "10px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {isCommentModalVisible && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "400px",
            }}
          >
            <h3>Add Comment for {commentUniversity}</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: "100%",
                height: "100px",
                marginBottom: "10px",
                padding: "5px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={handleSaveComment}
              style={{
                padding: "10px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Save Comment
            </button>
            <button
              onClick={() => setCommentModalVisible(false)}
              style={{
                padding: "10px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default UniversityPage;
