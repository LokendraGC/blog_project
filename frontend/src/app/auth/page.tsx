
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

interface formData {
    name?: string;
    username?: string;
    email: string;
    password: string;
    password_confirmation?: string;
}



const Auth: React.FC = () => {

    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [formData, setFormData] = useState<formData>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        username: ""
    });

    const router = useRouter();
    const { login, register, authToken, isLoading, logout } = myAppHook()

    useEffect(() => {
        if (authToken) {
            router.push('/');
        }
    }, [authToken, isLoading])

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
                await register(formData.username ?? '', formData.name ?? '', formData.email, formData.password, formData.password_confirmation ?? '');

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
                                <AvatarImage src="https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent sideOffset={10}>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <User className="mr-3 h-[10px] w-[22px]" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Settings className="mr-3 h-[10px] w-[22px]" />
                                Setting
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" variant="destructive" onClick={logout}>
                                <LogOut className="mr-3 h-[10px] w-[22px]" />
                                Lgout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                ) : (

                    <DialogTrigger asChild>
                        <Button className="cursor-pointer">Sign in</Button>
                    </DialogTrigger>
                )
            }


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
        </Dialog>

    )
}


export default Auth;