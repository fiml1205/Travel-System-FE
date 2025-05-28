import { callApi } from '@/utilities/functions'

export const uploadTour = async (data: any) => {
    try {
        const response = await callApi('POST', 'project/saveProject', data);
        // window.location.reload()
    } catch (error) {
        throw error;
    }
}