import React, { useEffect, useState } from "react";
import { getAllComments, createComment, updateComment, deleteComment, getCommentByUserId } from "../services/commentServices";
import { response } from "express";

const CommentPage: React.FC = () => {
  const userID = Number(localStorage.getItem("userID"));
  const [comments, setComments] = useState<any[]>([]); // Comments as an array of any objects
  const [userComments, setUserComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isMyCommentsVisible, setMyCommentsVisible] = useState(false);
  const [searchType, setSearchType] = useState("UserId");
  const [newComment, setNewComment] = useState({
    universityName: "",
    userId: userID,
    livingEnvironment: 0,
    learningAtmosphere: 0,
    library: 0,
    restaurant: 0,
    content: "",
    date: new Date(),
  });
  const [editComment, setEditComment] = useState<any>(null); 
  const handleGetAllComments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllComments(); // Fetch data from the API
      if (response.success && Array.isArray(response.data)) {
        setComments(response.data); // Ensure the comments array is set correctly
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowUserComments = async () => {
      try {
    const response = await getCommentByUserId(userID);
    const filteredComments = response.data;
    setUserComments(filteredComments);
    setMyCommentsVisible(true);
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
    };

  const handleBackToAllComments = () => {
    setMyCommentsVisible(false); // Switch back to showing all comments
  };

  const handleCreateComment = async () => {
    try {
      const response = await createComment(newComment); // Create a new comment
      if (response.success) {
        setCreateModalVisible(false); // Close the modal
        setNewComment({
          universityName: "",
          userId: userID,
          livingEnvironment: 0,
          learningAtmosphere: 0,
          library: 0,
          restaurant: 0,
          content: "",
          date: new Date(),
        }); // Reset the form
        handleGetAllComments(); // Refresh the comments list
      } else {
        throw new Error("Failed to create comment");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("Failed to create comment. Please try again.");
    }
  };

  useEffect(() => {
    handleGetAllComments(); // Load comments on component mount
  }, []);

  const handleUpdateComment = async () => {
    try {
      if (!editComment) return;

      const response = await updateComment(editComment.commentId, editComment);
      if (response.success) {
        alert("Comment updated successfully.");
        setEditComment(null);
        await handleGetAllComments(); // Refresh comments
        setMyCommentsVisible(false); // Refresh list
      } else {
        throw new Error("Failed to update comment.");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await deleteComment(commentId);
      if (response.success) {
        alert("Comment deleted successfully.");
        await handleGetAllComments(); // Refresh comments
        setMyCommentsVisible(false); // Refresh list
      } else {
        throw new Error("Failed to delete comment.");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleRedirectToUniversity = () => {
    window.location.href = "http://localhost:3000/university";
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#1a202c", fontSize: "2.5rem", margin: "20px 0" }}>
        Comments
      </h1>

      {loading && (
        <p style={{ textAlign: "center", color: "#007BFF", fontSize: "1.2rem" }}>
          Loading comments...
        </p>
      )}
      {error && (
        <p style={{ textAlign: "center", color: "red", fontSize: "1.2rem", fontWeight: "bold" }}>
          {error}
        </p>
      )}

<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        {!isMyCommentsVisible ? (
          <>
            <button
              onClick={() => setCreateModalVisible(true)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Create Comment
            </button>
            <button
              onClick={handleShowUserComments}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Show My Comments
            </button>
          </>
        ) : (
          <button
            onClick={handleBackToAllComments}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Back to All Comments
          </button>
        )}
        <button
          onClick={handleRedirectToUniversity}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Go to University
        </button>
      </div>
        

      <ul style={{ listStyle: "none", padding: "0" }}>
        {(isMyCommentsVisible ? userComments : comments).map((comment, index) => (
          <li
            key={index}
            style={{
              padding: "20px",
              borderBottom: "1px solid #ddd",
              backgroundColor: index % 2 === 0 ? "#f0f8ff" : "#ffffff",
              borderRadius: "10px",
              marginBottom: "15px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{comment.universityName}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
              <p style={{ margin: "0", fontSize: "1rem", color: "#555" }}>
                <strong>Living Environment:</strong> {comment.livingEnvironment}
              </p>
              <p style={{ margin: "0", fontSize: "1rem", color: "#555" }}>
                <strong>Learning Atmosphere:</strong> {comment.learningAtmosphere}
              </p>
              <p style={{ margin: "0", fontSize: "1rem", color: "#555" }}>
                <strong>Library:</strong> {comment.library}
              </p>
              <p style={{ margin: "0", fontSize: "1rem", color: "#555" }}>
                <strong>Restaurant:</strong> {comment.restaurant}
              </p>
            </div>
            <p
              style={{
                margin: "10px 0",
                fontSize: "1rem",
                color: "#666",
                fontStyle: comment.content ? "normal" : "italic",
              }}
            >
              <strong>Content:</strong> {comment.content || "No content available"}
            </p>
            <p style={{ margin: "0", fontSize: "0.9rem", color: "#888" }}>
              <strong>Date:</strong> {new Date(comment.date).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>

      {isCreateModalVisible && (
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
            <h3>Create Comment</h3>
            <label>University Name</label>
            <input
              type="text"
              value={newComment.universityName}
              onChange={(e) => setNewComment({ ...newComment, universityName: e.target.value })}
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <label>Living Environment</label>
            <input
              type="number"
              value={newComment.livingEnvironment}
              onChange={(e) =>
                setNewComment({ ...newComment, livingEnvironment: Number(e.target.value) })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <label>Learning Atmosphere</label>
            <input
              type="number"
              value={newComment.learningAtmosphere}
              onChange={(e) =>
                setNewComment({ ...newComment, learningAtmosphere: Number(e.target.value) })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <label>Library</label>
            <input
              type="number"
              value={newComment.library}
              onChange={(e) => setNewComment({ ...newComment, library: Number(e.target.value) })}
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <label>Restaurant</label>
            <input
              type="number"
              value={newComment.restaurant}
              onChange={(e) =>
                setNewComment({ ...newComment, restaurant: Number(e.target.value) })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <label>Content</label>
            <textarea
              value={newComment.content}
              onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
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
              onClick={handleCreateComment}
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
              onClick={() => setCreateModalVisible(false)}
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

export default CommentPage;
