import axios from "axios";


export interface User {
    userID: number;
    userName: string;
    email: string;
    password: string;
}

interface ServerResponse {
    success: boolean;
    message: string;
    userID?: number;
    data?: User
}

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3007';

export const httpClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const loginVerify = (body: Omit<User, 'userID' | 'userName'>): Promise<ServerResponse> => {
    return httpClient.post(`/api/user/session`, body)
        .then((response) => response.data);
}

export const userRegist = (body: Omit<User, 'userID'>): Promise<ServerResponse> => {
    return httpClient.post(`/api/user`, body)
        .then((response) => response.data)
}

export const getUserInfo = (userID:string):Promise<ServerResponse> =>{
    return httpClient.get(`/api/user/${userID}`)
        .then((response) => response.data)
}

export const changeName = (userID:string,body: Omit<User, 'userID'>):Promise<ServerResponse> =>{
    return httpClient.patch(`/api/user/${userID}`,body)
        .then((response) => response.data)
}

export const deleteUser = (userID:string):Promise<ServerResponse> =>{
    return httpClient.delete(`/api/user/${userID}`)
        .then((response) => response.data)
}

export const getUserFavourites = (userID: string): Promise<{ success: boolean; data: { universityName: string }[] }> => {
    return axios.get(`${BASE_URL}/api/user/favourites/${userID}`).then((response) => response.data);
};