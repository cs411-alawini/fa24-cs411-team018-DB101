import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3007/api";

// Fetch all comments (admin use)
export const getAllComments = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/comment`);
        return response.data;
    } catch (error) {
        console.error("Error fetching all comments:", error);
        throw error;
    }
};

// Create a new comment for a specific university
export const createComment = async (comment: {
    universityName: string;
    userId: number;
    livingEnvironment: number;
    library: number;
    restaurant: number;
    content: string;
    date: Date;
}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/comment`, comment);
        return response.data;
    } catch (error) {
        console.error("Error creating comment:", error);
        throw error;
    }
};

// Update a specific comment (admin or author use)
export const updateComment = async (commentId: number, updatedFields: {
    livingEnvironment?: number;
    library?: number;
    restaurant?: number;
    content?: string;
}) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/comment/${encodeURIComponent(commentId)}`, updatedFields);
        return response.data;
    } catch (error) {
        console.error("Error updating comment:", error);
        throw error;
    }
};

// Delete a specific comment (admin or author use)
export const deleteComment = async (commentId: number) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/comment/${encodeURIComponent(commentId)}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting comment:", error);
        throw error;
    }
};

export const getCommentByUserId = async (userId: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/comment/${encodeURIComponent(userId)}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching comments by user ID:", error);
        throw error;
    }
}
