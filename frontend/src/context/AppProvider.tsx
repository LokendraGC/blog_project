'use client'
import Loader from "@/components/common/Loader";
import { createContext, useContext, useEffect, useState } from "react"
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";
import { User } from "@/types";
import PostData from "@/types";
import { TagData } from "@/types";

interface AppProviderType {
    updateProfile: (name: string, email: string, username: string, avatar: File | string | null) => Promise<void>
    user: User | null,
    logout: () => void,
    tags: TagData[] | null,
    posts: PostData[] | null,
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
    const [user, setUser] = useState<User | null>(null)
    const [tags, setTags] = useState<TagData[] | null>(null)
    const [posts, setPosts] = useState<PostData[]>([]);

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

    // profile
    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get('authToken')
            if (!token) {
                setIsLoading(false)
                return
            }

            try {
                // Verify token with backend
                const response = await axios.get(`${APP_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                })

                setUser(response.data.data)
                // console.log(response.data.data);
                // setAuthToken(true)
            } catch (error) {
                console.error('Auth check failed:', error)
                Cookies.remove('authToken')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])


    // tags
    useEffect(() => {
        const tagsData = async () => {
            try {
                const response = await axios.get(`${APP_URL}/api/auth/tag`);
                setTags(response.data.data.data);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };

        tagsData();
    }, []);


    // posts
    const fetchPosts = async () => {
        try {

            const response = await axios.get(`${APP_URL}/api/auth/post`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            // console.log(response.data.data.data.user);
            setPosts(response.data.data.data);
            setUser(response.data.data.data.user);
            // console.log(user);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchPosts();
    }, []);


    axios.defaults.withCredentials = true;

    // for login
    const login = async (email: string, password: string) => {
        try {
            // 1. Get CSRF cookie first
            await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
                withCredentials: true,
            });

            // 2. Now send login request
            const response = await axios.post(
                `${APP_URL}/api/auth/login`,
                { email, password },
                { withCredentials: true } 
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

        } 
    };


    // logout
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

            toast.success('Registration successful! You can now log in.');

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
            // console.error('Password change error:', error.response?.data || error.message);
            toast.error(
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to change password"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // for update profile
    const updateProfile = async (
        name: string,
        email: string,
        username: string,
        avatar: File | string | null
    ) => {
        setIsLoading(true);

        try {
            const token = Cookies.get('authToken');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('username', username);

            // Only append avatar if it's a File (new upload)
            if (avatar instanceof File) {
                formData.append('avatar', avatar);
            }
            // Don't send avatar_url - let backend handle existing avatars

            const response = await axios.post(
                `${APP_URL}/api/auth/update-profile`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true,
                }
            );

            if (response.data.user) {
                setUser(response.data.user);
            }

            toast.success(response.data.message || 'Profile updated successfully');

        } catch (error) {
            console.error(error);
            toast.error('Error updating profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppContext.Provider value={{ tags, posts, updateProfile, user, login, logout, register, isLoading, authToken, changePassword }}>
            {children}
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