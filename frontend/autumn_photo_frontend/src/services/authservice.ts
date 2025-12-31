import API from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export const registerUser = async (data: RegisterPayload) => {
  const response = await API.post("/accounts/register/", data);
  return response.data;
};

export const verifyOTP = async (data: { email: string; otp: string }) => {
  const response = await API.post("/accounts/verify-otp/", data);
  return response.data;
};

export const loginUser = async (data: LoginPayload) => {
  const response = await API.post("/accounts/login/", data);
  return response.data;
};

export const getProfile=()=>{
    return API.get('/accounts/profile/');
};
