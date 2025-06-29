import { callApi } from '@/utilities/functions'

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

export const getListTourSave = async (data:any) => {
    try {
        const response = await callApi('GET', 'save/', data);
        return response
    } catch (error) {
        throw error;
    }
}