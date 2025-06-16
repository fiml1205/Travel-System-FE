import Cookies from 'js-cookie'
import { jwtDecode } from "jwt-decode";
import axios, { AxiosRequestConfig, Method } from 'axios';

export const SSToken: any = Cookies.get('SSToken')

export function userInfo() {
    if (SSToken) {
        try {
            const decoded: any = jwtDecode(SSToken);
            return decoded?.data || {};
        } catch (error) {
            console.error("JWT decoding error:", error);
            return {};
        }
    } else {
        return {}
    }
}

export function validatePhone(phone: string): boolean {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export function validateNoSqli(input: string): boolean {
    const keywords = ['$ne', '$gt', '$lt']
    for (let keyword of keywords) {
        if (input.includes(keyword)) {
            return false
        }
    }
    return true
}

export function validatePassword(password: string): boolean | string {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (passwordRegex.test(password)) {
        return true;
    }
    return "Mật khẩu phải chứa ít nhất một chữ cái, một số và một ký tự đặc biệt";
}

// export async function callApi(
//     method: Method,
//     url: string,
//     data?: any,
//     headers?: any
// ) {
//     const defaultHeaders: any = {
//         'Content-Type': 'application/json'
//     };
//     if (SSToken) {
//         defaultHeaders.Authorization = `Bearer ${SSToken}`;
//     }
//     const finalHeaders = {
//         ...defaultHeaders,
//         ...headers
//     };
//     const config: AxiosRequestConfig = {
//         method: method,
//         url: `http://localhost:8000/api/${url}`,
//         data: data,
//         headers: finalHeaders
//     };

//     try {
//         const response = await axios(config);
//         return response.data;
//     } catch (error: any) {
//         if (error.response) {
//             const message = error.response.data?.message
//             if (message === 'Invalid token') {
//                 Cookies.remove('SSToken');
//                 window.location.href = '/';
//                 return; 
//             }
//             throw new Error(message|| 'API error')
//         } else {
//             throw new Error('Lỗi kết nối mạng hoặc server không phản hồi')
//         }
//     }
// }

export async function callApi(
    method: Method,
    url: string,
    data?: any,
    headers?: any
) {
    const defaultHeaders: any = {};

    if (!(data instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    if (SSToken) {
        defaultHeaders.Authorization = `Bearer ${SSToken}`;
    }

    const finalHeaders = {
        ...defaultHeaders,
        ...headers,
    };

    const config: AxiosRequestConfig = {
        method,
        url: `http://localhost:8000/api/${url}`,
        data,
        headers: finalHeaders,
    };

    try {
        const response = await axios(config);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            const message = error.response.data?.message;
            if (message === 'Invalid token') {
                Cookies.remove('SSToken');
                window.location.href = '/';
                return;
            }
            throw new Error(message || 'API error');
        } else {
            throw new Error('Lỗi kết nối mạng hoặc server không phản hồi');
        }
    }
}

