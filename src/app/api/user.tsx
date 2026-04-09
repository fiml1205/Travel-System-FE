import { callApi } from '@/utilities/functions'
import Cookies from 'js-cookie';

export const loginApi = async (data: any) => {
    try {
        const response = await callApi('POST', 'user/login', data);
        Cookies.set('SSToken', response.data.SSToken, { expires: 30 });
        window.location.reload()
    } catch (error) {
        throw error;
    }
}

export const registerApi = async (data: any) => {
    try {
        const response = await callApi('POST', 'user/register', data);
        Cookies.set('SSToken', response.data.SSToken, { expires: 30 });
        window.location.reload()
    } catch (error) {
        throw error;
    }
}

export const updateInfor = async (data: any) => {
    try {
        const response = await callApi('PUT', 'user/update', data);
        return response
    } catch (error) {
        throw error;
    }
}

export const updateAvatar = async (data: any) => {
    try {
        const response = await callApi('POST', 'user/avatar', data);
        return response
    } catch (error) {
        throw error;
    }
}

export const changePassword = async (data: any) => {
    try {
        const response = await callApi('PUT', 'user/change-password', data);
        return response
    } catch (error) {
        throw error;
    }
}
export const changePasswordV2 = async (data: any) => {
    try {
        const response = await callApi('POST', 'user/change-password-2', data);
        return response
    } catch (error) {
        throw error;
    }
}