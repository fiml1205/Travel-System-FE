import { callApi } from '@/utilities/functions'

export const getListProjectOwn = async () => {
    try {
        const response = await callApi('POST', 'user/getListProject');
        return response
    } catch (error) {
        throw error;
    }
}
export const getListProject = async () => {
    try {
        const response = await callApi('POST', 'project/getListProject');
        return response
    } catch (error) {
        throw error;
    }
}