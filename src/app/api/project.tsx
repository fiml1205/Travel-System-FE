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


export const getProject = async (projectId: any) => {
    try {
        const response = await callApi('GET', `project/${projectId}`);
        return response
    } catch (error) {
        throw error;
    }
}

export const createProject = async (data: any) => {
    try {
        const response = await callApi('POST', 'project/create', data);
        return response
    } catch (error) {
        throw error;
    }
}

export const updateProject = async (data: any) => {
    try {
        const response = await callApi('POST', `project/update`, data);
        return response
    } catch (error) {
        throw error;
    }
}

export const voteProject = async (data: any) => {
    try {
        const response = await callApi('POST', 'vote/submit', data);
        return response
    } catch (error) {
        throw error;
    }
}

export const getComment = async (projectId: any) => {
    try {
        const response = await callApi('GET', `comment/${projectId}`);
        return response
    } catch (error) {
        throw error;
    }
}

export const comment = async (data: any) => {
    try {
        const response = await callApi('POST', 'comment/', data);
        return response
    } catch (error) {
        throw error;
    }
}

export const editComment = async (data: any) => {
    try {
        const response = await callApi('PUT', `comment/${data.id}`, data);
        return response
    } catch (error) {
        throw error;
    }
}

export const deleteComment = async (data: any) => {
    try {
        const response = await callApi('DELETE', `comment/${data}`);
        return response
    } catch (error) {
        throw error;
    }
}

export const getSaveStatus = async (data: any) => {
    try {
        const response = await callApi('GET', `save/status/${data}`);
        return response
    } catch (error) {
        throw error;
    }
}

export const handleSaveStatus = async (data: any) => {
    try {
        const response = await callApi('POST', `save/`, data);
        return response
    } catch (error) {
        throw error;
    }
}

