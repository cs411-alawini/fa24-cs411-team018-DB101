import axios from 'axios';
import { University } from '../types/university.d';

const API_BASE_URL = '/api/universities';

export const getUniversityByName = async (name: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${encodeURIComponent(name)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching university by name:', error);
    throw error;
  }
};

export const createUniversity = async (university: Omit<University, 'universityName'> & { universityName: string }) => {
  try {
    const response = await axios.post(API_BASE_URL, university);
    return response.data;
  } catch (error) {
    console.error('Error creating university:', error);
    throw error;
  }
};

export const updateUniversity = async (universityName: string, updates: Partial<University>) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${encodeURIComponent(universityName)}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating university:', error);
    throw error;
  }
};

export const deleteUniversity = async (universityName: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${encodeURIComponent(universityName)}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting university:', error);
    throw error;
  }
};
