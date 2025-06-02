
'use client'
import { Button } from "@/components/ui/button"
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

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { myAppHook } from "@/context/AppProvider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from "axios"
import toast from "react-hot-toast"
import Link from "next/link"

interface formData {
    name?: string;
    email: string;
    password: string;
    password_confirmation?: string;
}

interface UserProfile {
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    avatar?: string;
}



const Auth: React.FC = () => {

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
    const { login, register, authToken, isLoading, logout } = myAppHook()

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

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isLogin) {

            try {
                await login(formData.email, formData.password);
            } catch (Error) {
                console.log('Authentication error', Error);
            }

        } else {

            try {
                await register(formData.name ?? '', formData.email, formData.password, formData.password_confirmation ?? '');

            } catch (Error) {
                console.log('Authentication error', Error);
            }
        }
    }

    return (
        <Dialog>

            {
                authToken ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer">
                            <Avatar>
                                <AvatarImage
                                    src={avatar || `https://ui-avatars.com/api/?name=${userProfile?.user.name || 'User'}&background=random`}
                                    alt={userProfile?.user.name || 'User'}
                                />
                                <AvatarFallback>
                                    {userProfile?.user.name
                                        ? userProfile.user.name
                                        : ''}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent sideOffset={10}>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <Link href="/profile">
                                <DropdownMenuItem asChild>
                                    <div className="flex items-center cursor-pointer">
                                        <Settings className="mr-3 h-[10px] w-[22px]" />
                                        Profile
                                    </div>
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem className="cursor-pointer">
                                <User className="mr-3 h-[10px] w-[22px]" />
                                Setting
                            </DropdownMenuItem>

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
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleFormSubmit}>
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
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChangeInput}
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-3">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChangeInput}
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChangeInput}
                                        />
                                    </div>

                                    {!isLogin && (
                                        <div className="grid gap-3">
                                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                value={formData.password_confirmation}
                                                onChange={handleChangeInput}
                                            />
                                        </div>
                                    )}
                                </div>

                                <DialogDescription className="my-5">
                                    {isLogin ? 'Already have an account?' : "Don't have an account?"}{' '}
                                    <span
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="cursor-pointer text-blue-600 hover:underline"
                                    >
                                        {isLogin ? 'Register' : 'Sign In'}
                                    </span>
                                </DialogDescription>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button className="cursor-pointer" type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button className="cursor-pointer" type="submit">
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </>
                )}

        </Dialog>

    )
}


export default Auth;