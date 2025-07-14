'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { myAppHook } from '@/context/AppProvider'
import { Label } from "@/components/ui/label"
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Edit, Camera } from 'lucide-react';

interface FormData {
    name: string;
    email: string;
    username?: string;
    avatar?: File | string | null;
}


const EditProfile = () => {
    const { authToken, user, updateProfile } = myAppHook();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        username: '',
        avatar: null
    });


    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.user.name || '',
                email: user.user.email || '',
                username: (user.user as any).username || '',
                avatar: user.avatar || null
            });

            // Set preview if avatar exists
            if (user.avatar) {
                setPreviewImage(`${process.env.NEXT_PUBLIC_API_URL}/storage/avatars/${user.avatar}`);
            } else {
                setPreviewImage(null);
            }

        }
    }, [user]);

    useEffect(() => {
        if (!authToken) {
            router.push("/");
        }
    }, [authToken, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, avatar: file });

            // Create preview URL
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setPreviewImage(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (!formData.name || !formData.email) {
                toast.error('Please fill all required fields');
                return;
            }

            // Prepare the avatar data
            let avatarToUpdate: File | string | null = null;

            if (formData.avatar instanceof File) {
                // It's a new file upload
                avatarToUpdate = formData.avatar;
            } else if (typeof formData.avatar === 'string') {
                // It's an existing avatar URL
                avatarToUpdate = formData.avatar;
            }
            // else remains null

            await updateProfile(
                formData.name,
                formData.email,
                formData.username || '', // provide fallback for optional field
                avatarToUpdate
            );

            router.push('/profile');

        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Failed to update profile');
        }
    };


    //     const getAvatarUrl = (avatarPath: string | null | undefined) => {

    //     if (previewImage) return previewImage;

    //     if (!avatarPath) return null;

    //     if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
    //         return avatarPath;
    //     }

    //     // 4. Otherwise, it's a stored avatar - return full path
    //     return `${process.env.NEXT_PUBLIC_API_URL}/storage/avatars/${avatarPath}`;
    // };

    const getAvatarUrl = () => {
        if (previewImage) return previewImage;

        if (user?.avatar) {
            if (user.avatar.startsWith('data:image')) {
                return user.avatar;
            }

            return `${process.env.NEXT_PUBLIC_API_URL}/storage/avatars/${user.avatar}`;
        }

        return `https://ui-avatars.com/api/?name=${user?.user.name || 'User'}&background=random`;
    };


    return (
        <div className="flex min-h-screen bg-muted/50 p-6 gap-6">
            {/* Sidebar */}
            <Card className="w-80 p-6 flex flex-col items-center text-center">
                <div className="relative group">
                    <Image
                        src={getAvatarUrl()}
                        alt="Profile Image"
                        width={100}
                        height={100}
                        className="rounded-full border shadow-md object-cover"
                        loader={({ src }) => src}
                    />


                    <button
                        onClick={triggerFileInput}
                        className="absolute bottom-0 right-0 bg-primary rounded-full p-2 text-white dark:text-gray-600 dark: cursor-pointer hover:bg-primary/90 transition-all"
                        aria-label="Change profile picture"
                    >
                        <Camera className="h-5 w-5" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
                <h2 className="text-xl font-semibold mt-4">{user?.user.name}</h2>
                <Separator className="my-4" />
                <Link href={'/profile'}>
                    <Button variant="outline" className="w-full cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Back to Profile
                    </Button>
                </Link>
            </Card>

            {/* Main Content */}
            <Card className="flex-1 p-6">
                <h3 className="text-lg font-semibold ml-7 mb-4">Edit Profile</h3>
                <CardContent className="space-y-4">
                    <form onSubmit={handleFormSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <Button type="submit" className="mt-6 cursor-pointer">
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditProfile;