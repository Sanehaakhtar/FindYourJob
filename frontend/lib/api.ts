import axios from "axios";

// Create an Axios instance with default configuration
const api = axios.create({
    baseURL: "http://localhost:8000", // Pointing to your FastAPI backend
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to handle errors globally (optional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);

export default api;

export const generateCoverLetter = async (
    email: string,
    jobTitle: string,
    company: string,
    description: string
) => {
    const response = await api.post("/generate/cover-letter", {
        email,
        job_title: jobTitle,
        company,
        description,
    });
    return response.data.letter;
};
