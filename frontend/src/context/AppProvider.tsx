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
    register: (username: string, email: string, password: string, name: string, password_confirmation: string) => Promise<void>
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

    useEffect(() => {
        const token = Cookies.get('authToken');
        if (token) {
            setAuthToken(token);
        } else {
            router.push('/auth');
            setAuthToken(null)
        }
        setIsLoading(false)

    })

    axios.defaults.withCredentials = true;

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
                { email, password }
            );

            if (response.data.status === 'success') {
                Cookies.set('authToken', response.data.token, { expires: 7 });
                toast.success('Login Successfull');
                setAuthToken(response.data.token);
            } else {
                toast.error('Invalid Credentials');
            }


        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                console.log('Error message:', error.response.data.message);
            } else {
                console.log('Unexpected error:', error);
                alert('Something went wrong.');
            }
        }
        finally {
            setIsLoading(false);
        }

    };

    const register = async (
        username: string,
        name: string,
        email: string,
        password: string,
        password_confirmation: string
    ) => {
        setIsLoading(true);

        try {

            const baseUsername = name.trim().toLowerCase().replace(/\s+/g, '_'); // e.g. "John Doe" → "john_doe"
            const randomSuffix = Math.floor(Math.random() * 10000); // adds 0-9999
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
                console.log('Validation errors:', error.response.data.errors); // 🔍 this will show what went wrong
            } else {
                console.log('Unknown error:', error);
            }
        }
        finally {
            setIsLoading(false);
        }

    };

    const logout = () => {
        setAuthToken(null);
        Cookies.remove('authToken');
        setIsLoading(false);
        toast.success('logged out successfully')
    }

    return (
        <AppContext.Provider value={{ login, logout, register, isLoading, authToken }}>
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