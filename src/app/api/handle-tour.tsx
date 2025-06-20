import { callApi } from '@/utilities/functions'

export const createTour = async (data: any) => {
    try {
        const response = await callApi('POST', 'project/create', data);
        return response
    } catch (error) {
        throw error;
    }
}

export const editTour = async (data: any, projectId:any) => {
    try {
        const response = await callApi('POST', `project/edit/${projectId}`, data);
    } catch (error) {
        throw error;
    }
}