'use client'

import { usePathname } from 'next/navigation';
import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Activity, Edit, Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes";
import Link from 'next/link'
import { User as UserProfile } from '@/types';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Label } from "@/components/ui/label"
import { myAppHook } from "@/context/AppProvider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from "axios"
import toast from "react-hot-toast"
import Image from 'next/image'
import { useForm, SubmitHandler } from 'react-hook-form';


interface formData {
    name?: string;
    email: string;
    password: string;
    password_confirmation?: string;
}


const Navbar: React.FC = () => {

    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [formData, setFormData] = useState<formData>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });


    const [avatar, setAvatar] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const router = useRouter();
    const { login, authToken, logout, user, register } = myAppHook()
    const [isLoading, setIsLoading] = useState<boolean>(false);


    useEffect(() => {
        const fetchProfile = async () => {
            if (!authToken) return;

            try {
                // 1. Ensure CSRF cookie is set
                await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
                    withCredentials: true,
                });

                // 2. Make authenticated request with token
                const response = await axios.get(`${APP_URL}/api/auth/profile`, {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Accept': 'application/json'
                    }
                });

                // console.log(response.data.data.user.name);
                setUserProfile(response.data.data);
                setAvatar(response.data.avatar || response.data.user?.avatar || null);
            } catch (error) {
                if (axios.isAxiosError(error)) {

                    console.error('Profile fetch error:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        headers: error.response?.headers
                    });
                }
            }
        };

        // Add small delay to ensure CSRF cookie is set
        const timer = setTimeout(() => {
            fetchProfile();
        }, 100);

        return () => clearTimeout(timer);
    }, [authToken, APP_URL]);


    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        })
    }


    const getAvatarUrl = (avatarPath: string | null | undefined) => {
        if (!avatarPath) return null;

        // Handle base64 encoded avatars (from avatar generator)
        if (avatarPath.startsWith('data:image')) {
            return avatarPath;
        }

        // Handle uploaded avatars (stored in storage)
        return `${process.env.NEXT_PUBLIC_API_URL}/storage/avatars/${avatarPath}`;
    };

    const { register: formRegister, handleSubmit, formState: { errors } } = useForm<formData>();

    const onSubmit: SubmitHandler<formData> = async (data) => {

        setIsLoading(true);

        if (isLogin) {
            try {
                await login(data.email, data.password);
            } catch (error) {
                toast.error('Login failed. Please check your credentials.');
            } finally {
                setIsLoading(false);
            }
        } else {
            try {
                await register(data.name ?? '', data.email, data.password, data.password_confirmation ?? '');
                setIsLogin(true);
            } catch (error) {
                toast.error('Registration failed. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    }

    return (
        <nav className="flex justify-between items-center p-4 sticky top-0 z-100 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <span className="font-bold text-2xl text-gray-900 dark:text-white">
                    <Link href="/">
                        ShareThoughts
                    </Link>
                </span>

                <div className="relative ml-8">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 4a7 7 0 017 7c0 1.65-.56 3.17-1.5 4.38l4.12 4.12a1 1 0 01-1.42 1.42l-4.12-4.12A7 7 0 1111 4z" />
                        </svg>
                    </span>

                    <Input
                        className="pl-10 pr-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full border border-gray-300 dark:border-gray-600 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Search..."
                    />
                </div>
            </div>


            <div className="flex items-center justify-center gap-3 space-x-4">
                {/* write post */}
                <Link href="/write-post" className="flex items-center gap-2">
                    <Edit size={18} />
                    <span className="font-bold">Write</span>
                </Link>
                {/* dark mode */}
                <Button variant="outline" size="icon" className="cursor-pointer" onClick={toggleTheme}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* <Auth /> */}



                <Dialog>

                    {
                        authToken ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="cursor-pointer">
                                    {
                                        user?.avatar ? (
                                            <Image
                                                src={getAvatarUrl(user.avatar) || `https://ui-avatars.com/api/?name=${userProfile?.user.name || 'User'}&background=random`}
                                                alt="Profile Image"
                                                width={40}
                                                height={40}
                                                className="rounded-full border shadow-md"
                                                loader={({ src }) => src}
                                            />
                                        ) : (
                                            <Avatar>
                                                <AvatarImage
                                                    src={`https://ui-avatars.com/api/?name=${userProfile?.user.name || 'User'}&background=random`}
                                                    alt={userProfile?.user.name || 'User'}
                                                />
                                                <AvatarFallback>
                                                    {userProfile?.user.name ? userProfile?.user.name.charAt(0).toUpperCase() : 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        )
                                    }
                                </DropdownMenuTrigger>
                                <DropdownMenuContent sideOffset={10}>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    <Link href="/profile">
                                        <DropdownMenuItem asChild>
                                            <div className="flex items-center cursor-pointer">
                                                <User className="mr-3 h-[10px] w-[22px]" />
                                                Profile
                                            </div>
                                        </DropdownMenuItem>
                                    </Link>

                                    <Link href="/activity">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Activity className="mr-3 h-[10px] w-[22px]" />
                                            Activity
                                        </DropdownMenuItem>
                                    </Link>

                                    <DropdownMenuItem className="cursor-pointer" variant="destructive" onClick={logout}>
                                        <LogOut className="mr-3 h-[10px] w-[22px]" />
                                        LogOut
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        ) : (

                            <>
                                <DialogTrigger asChild>
                                    <Button className="cursor-pointer">Sign in</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] z-[1000]">
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <DialogHeader className="my-5">
                                            <DialogTitle>{isLogin ? 'Sign In' : 'Register'}</DialogTitle>
                                            <DialogDescription>
                                                {isLogin ? 'Sign in to get started' : 'Register to get started'}
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid gap-4">
                                            {!isLogin && (
                                                <div className="grid gap-3">
                                                    <Label htmlFor="name">Name</Label>
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        // name="name"
                                                        {...formRegister('name', { required: 'Name is required' })}
                                                    />
                                                    {errors.name && <p className='text-red-500'>{errors.name.message}</p>}
                                                </div>
                                            )}

                                            <div className="grid gap-3">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    {...formRegister('email', { required: 'Email is required' })}
                                                // name="email"
                                                // value={formData.email}
                                                // onChange={handleChangeInput}
                                                />
                                                {errors.email && <p className='text-red-500'>{errors.email.message}</p>}
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="password">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    {...formRegister('password', { required: 'Password is required' })}
                                                />
                                                {errors.password && <p className='text-red-500'>{errors.password.message}</p>}
                                            </div>

                                            {!isLogin && (
                                                <div className="grid gap-3">
                                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                                    <Input
                                                        id="password_confirmation"
                                                        type="password"
                                                        {...formRegister('password_confirmation', { required: 'Confirm Password is required' })}
                                                    />
                                                    {errors.password_confirmation && <p className='text-red-500'>{errors.password_confirmation.message}</p>}
                                                </div>
                                            )}
                                        </div>

                                        <DialogDescription className="my-5">
                                            {isLogin ? 'Already have an account?' : "Don't have an account?"}{' '}

                                            {
                                                <span
                                                    onClick={() => setIsLogin(!isLogin)}
                                                    className="cursor-pointer text-blue-600 hover:underline"
                                                >
                                                    {isLogin ? 'Register' : 'Sign In'}
                                                </span>

                                            }
                                        </DialogDescription>

                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button className="cursor-pointer" type="button" variant="outline">
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button
                                                className={`cursor-pointer ${isLoading ? 'opacity-75' : ''}`}
                                                type="submit"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg
                                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        {isLogin ? 'Signing In...' : 'Creating Account...'}
                                                    </span>
                                                ) : (
                                                    isLogin ? 'Sign In' : 'Create Account'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </>
                        )}

                </Dialog>


            </div>
        </nav>

    )
}


export default Navbar   