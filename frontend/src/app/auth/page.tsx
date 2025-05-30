
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"


interface formData {
    name?: string;
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
    });

    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        })
    }

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isLogin) {
            alert('login form submitted');
        } else {
            alert('register form submitted');
        }
    }

    return (
        <Dialog>
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
        </Dialog>

    )
}


export default Auth;