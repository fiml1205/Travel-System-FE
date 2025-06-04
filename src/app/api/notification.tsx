import { callApi } from '@/utilities/functions'

export const createNoti = async (data: any) => {
    try {
        const response = await callApi('POST', 'notification/bookTour', data);
    } catch (error) {
        throw error;
    }
}

export const getNoti = async () => {
    try {
        const response = await callApi('POST', 'notification/getNoti');
        return response
    } catch (error) {
        throw error;
    }
}