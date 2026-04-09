import { callApi } from '@/utilities/functions'

export const createNoti = async (data: any) => {
    try {
        const response = await callApi('POST', 'notification/bookTour', data);
    } catch (error) {
        throw error;
    }
}

export const getNoti = async (data:any) => {
    try {
        const response = await callApi('POST', 'notification/getNoti', data);
        return response
    } catch (error) {
        throw error;
    }
}

export const markAllNotiRead = async () => {
    try {
        const response = await callApi('POST', 'notification/markAllNotiRead');
        return response
    } catch (error) {
        throw error;
    }
}

export const getTourBookings = async (data: any) => {
    try {
        const response = await callApi('POST', 'notification/getTourBookings', data);
        return response
    } catch (error) {
        throw error;
    }
}