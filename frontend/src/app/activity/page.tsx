'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { myAppHook } from "@/context/AppProvider"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import axios from "axios"
import { Bookmark, Heart, MessageSquare, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"


interface PostData {
    id: number
    title: string
    feature_image: string
    content: string
    short_description: string
    created_at: string | Date
}


const Activity = () => {

    const [posts, setPosts] = useState<PostData[]>([]);
    const { user, authToken } = myAppHook();
    const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
    const IMAGE_URL = `${process.env.NEXT_PUBLIC_POST_IMAGE_BASE_URL}`;
    const AVATAR_URL = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/`;


    useEffect(() => {

        if (!authToken) return;

        try {

            const fetchPosts = async () => {
                await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
                    withCredentials: true,
                });

                const response = await axios.get(`${APP_URL}/api/auth/get-created-post`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },

                })
                setPosts(response.data.data.data);
            }
            fetchPosts();

        } catch (error) {
            console.error(error);
        }


    }, [authToken])


    console.log(user);


    return (
        <div>
            <Tabs defaultValue="liked" className="w-full max-w-2xl mx-auto">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg h-12">
                    <TabsTrigger
                        value="liked"
                        className="cursor-pointer transition-all duration-300 
                data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 
                data-[state=active]:shadow-sm rounded-lg flex items-center justify-center gap-2
                text-gray-700 dark:text-gray-300"
                    >
                        <Heart className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                        Your Posts
                        <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 text-xs px-2 py-0.5 rounded-full ml-1">
                            24
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="saved"
                        className="cursor-pointer transition-all duration-300 
                data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 
                data-[state=active]:shadow-sm rounded-lg flex items-center justify-center gap-2
                text-gray-700 dark:text-gray-300"
                    >
                        <Bookmark className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        Saved Posts
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full ml-1">
                            12
                        </span>
                    </TabsTrigger>
                </TabsList>


                <TabsContent value="liked" className="mt-6">
                    <div className="space-y-4">
                        {
                            posts.map((post) => {
                                return (

                                    <div key={post.id} className="p-4 border rounded-xl hover:shadow-md transition-all 
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    >
                                        {/* User Info */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                                <Image
                                                    src={
                                                        user?.avatar && typeof user.avatar === 'string' && user.avatar.length > 0
                                                            ? AVATAR_URL + user.avatar
                                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user.name || 'U')}&background=random`
                                                    }
                                                    width={25}
                                                    height={25}
                                                    className="rounded-full"
                                                    alt={user?.user.name || 'User'}
                                                />
                                            </div>


                                            <div>
                                                <h3 className="font-semibold dark:text-white">{post.title} </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">2 days ago</p>
                                            </div>

                                            {/* Edit / Delete */}
                                            <div className="flex-3">
                                                <div className="flex justify-end gap-4 pt-3">
                                                    <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                                                        <Pencil className="w-4 h-4" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Post Content */}
                                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                                            This is a post you liked recently. The content would appear here...
                                        </p>

                                        {/* Liked / Comment */}
                                        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <button className="flex items-center gap-1 text-pink-500 dark:text-pink-400">
                                                <Heart className="w-4 h-4 fill-current" />
                                                <span>123</span>
                                            </button>
                                            <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                                                <MessageSquare className="w-4 h-4" />
                                                <span>Comment</span>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        }

                    </div>
                </TabsContent>


                <TabsContent value="saved" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="p-4 border rounded-xl hover:shadow-md transition-all 
                    bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold dark:text-white">Saved Post {i + 1}</h3>
                                    <Bookmark className="w-5 h-5 text-blue-500 dark:text-blue-400 fill-current" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    This is content you saved for later reference...
                                </p>
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Saved 3 days ago</span>
                                    <button className="text-xs text-blue-500 dark:text-blue-400 hover:underline">
                                        View Post
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Activity