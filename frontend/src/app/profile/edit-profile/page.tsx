'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { myAppHook } from '@/context/AppProvider'
import { Label } from "@/components/ui/label"
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';


interface formData {
    name: string;
    email: string;
    username: string;
}

const EditProfile = () => {
    const { authToken, user } = myAppHook();
    const router = useRouter();
    const [formData, setFormData] = useState<formData>({
        name: '',
        email: '',
        username: ''
    });

    useEffect(() => {
        if (!authToken) {
            // Redirect if not logged in
            router.push("/");
        }
    }, [authToken, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {

            if (!formData.name || !formData.email || !formData.username) {
                toast.error('Please fill all fields');
            }

        } catch (error) {
            console.error(error);
        }

    }


    const getAvatarUrl = (avatarPath: string | null | undefined) => {
        if (!avatarPath) return '/default-avatar.png';
        return `${process.env.NEXT_PUBLIC_API_URL}/storage/avatars/${avatarPath}`;
    };

    return (
        <div className="flex min-h-screen bg-muted/50 p-6 gap-6">
            {/* Sidebar */}
            <Card className="w-80 p-6 flex flex-col items-center text-center">
                <Image
                    src={getAvatarUrl(user?.avatar)}
                    alt="Profile Image"
                    width={100}
                    height={100}
                    className="rounded-full border shadow-md"
                    // Optional: Add a loader if you need custom URL construction
                    loader={({ src }) => src}
                />
                <h2 className="text-xl font-semibold mt-4">{user?.user.name}</h2>

            </Card>

            {/* Main Content */}
            <Card className="flex-1 p-6">
                <h3 className="text-lg font-semibold ml-7 mb-4">Profile Information</h3>
                <CardContent className="space-y-4">

                    <div>

                        <form onSubmit={handleFormSubmit}>
                            <div className="grid grid-cols-3 gap-4">

                                <div className="grid gap-3 mt-4">
                                    <Label className="text-muted-foreground" htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid gap-3 mt-4">
                                    <Label className="text-muted-foreground" htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid gap-3 mt-4">
                                    <Label className="text-muted-foreground" htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        name="new_password_confirmation"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>

                            </div>
                            <Button className="mt-4 cursor-pointer">Update Profile</Button>
                        </form>

                    </div>
                </CardContent>
            </Card>

        </div>
    )
}

export default EditProfile