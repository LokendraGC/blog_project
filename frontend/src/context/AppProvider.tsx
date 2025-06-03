'use client'
import Loader from "@/components/common/Loader";
import { createContext, useContext, useEffect, useState } from "react"
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";

interface AppProviderType {
    logout: () => void,
    isLoading: boolean,
    authToken: string | null,
    login: (email: string, password: string) => Promise<void>,
    register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>
    changePassword: (current_password: string, new_password: string, new_password_confirmation: string) => Promise<void>
}


const AppContext = createContext<AppProviderType | undefined>(undefined)

const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;


export default function AppProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [authToken, setAuthToken] = useState<string | null>(null)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        const token = Cookies.get('authToken');
        if (token) {
            setAuthToken(token);
        } else {
            // router.push('/auth');
            setAuthToken(null)
        }
        setIsLoading(false)

    }, [])

    axios.defaults.withCredentials = true;

    // for login
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // 1. Get CSRF cookie first
            await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
                withCredentials: true,
            });

            // 2. Now send login request
            const response = await axios.post(
                `${APP_URL}/api/auth/login`,
                { email, password },
                { withCredentials: true } // Add this
            );

            if (response.data.status === 'success') {
                Cookies.set('authToken', response.data.token, { expires: 7 });
                // Also store user data if available
                if (response.data.user) {
                    Cookies.set('user', JSON.stringify(response.data.user), { expires: 7 });
                }
                toast.success('Login Successful');
                setAuthToken(response.data.token);
            } else {
                toast.error('Invalid Credentials');
            }
        } catch (error: unknown) {
            console.log('Unknown error', error);
            toast.error('Invalid Credentials');

        } finally {
            setIsLoading(false);
        }
    };


    const logout = async () => {
        try {
            // Refresh CSRF
            await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
                withCredentials: true
            });

            // Logout API
            await axios.post(`${APP_URL}/api/auth/logout`, {}, {
                withCredentials: true
            });

            toast.success('Logged out successfully');
            router.push('/');
        } catch (error: any) {
            if (error.response?.status === 401) {
                // Ignore – user is already unauthenticated
                console.warn('User already logged out.');
            } else {
                console.error('Logout error:', error.response?.data || error.message);
                toast.error('Logout failed.');
            }
        } finally {
            // Clear local auth state
            toast.success('Logged out successfully');
            setAuthToken(null);
            Cookies.remove('authToken');
            Cookies.remove('user');
        }
    };




    // for register
    const register = async (
        name: string,
        email: string,
        password: string,
        password_confirmation: string
    ) => {
        setIsLoading(true);
        try {
            const baseUsername = name.trim().toLowerCase().replace(/\s+/g, '_');
            const randomSuffix = Math.floor(Math.random() * 10000);
            const username = `${baseUsername}_${randomSuffix}`;

            await axios.get(`${APP_URL}/sanctum/csrf-cookie`, { withCredentials: true });

            const response = await axios.post(`${APP_URL}/api/auth/register`, {
                username,
                name,
                email,
                password,
                password_confirmation
            });

            toast.success('Register Successfull');
        } catch (error: any) {
            if (error.response) {
                console.log('Validation errors:', error.response.data.errors);
            } else {
                console.log('Unknown error:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // for change password
    const changePassword = async (
        current_password: string,
        new_password: string,
        new_password_confirmation: string
    ) => {
        setIsLoading(true);

        try {
            // 1. Get CSRF cookie first
            await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
                withCredentials: true,
            });

            // 2. Make the password change request with auth token
            const response = await axios.post(
                `${APP_URL}/api/auth/change-password`,
                {
                    current_password,
                    new_password,
                    new_password_confirmation,
                },
                {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success("Password Changed Successfully");
            return response.data;
        } catch (error: any) {
            console.error('Password change error:', error.response?.data || error.message);
            toast.error(
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to change password"
            );
            throw error;
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <AppContext.Provider value={{ login, logout, register, isLoading, authToken, changePassword }}>
            {isLoading ? <Loader /> : children}
        </AppContext.Provider>
    );
}

export const myAppHook = () => {

    const context = useContext(AppContext);

    if (!context) {
        throw new Error('Context will be wrapped inside AppProvider')
    }

    return context;

}