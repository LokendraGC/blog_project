'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { myAppHook } from "@/context/AppProvider"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import axios from "axios"
import { Bookmark, Heart, MessageSquare, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
const { convert } = require('html-to-text');
import parse from 'html-react-parser';
import slugify from "slugify"
import Link from "next/link"
import toast from "react-hot-toast"
import { GET_PROFILE, SAVE_POST } from "@/lib/ApiEndPoints"
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);



interface PostData {
    id: number
    title: string
    feature_image: string
    content: string
    short_description: string
    created_at: string
}


const Activity = () => {

    const [posts, setPosts] = useState<PostData[]>([]);
    const { user, authToken } = myAppHook();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);
    const [savedPosts, setSavedPosts] = useState<PostData[]>([]);


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

    function trimWords(text: string, wordLimit: number) {
        const plainText = convert(text, { wordwrap: false });
        return plainText.split(' ').slice(0, wordLimit).join(' ') + '...';
    }


    function formatToMonthDay(dateStr: string): string {
        const date = new Date(dateStr);
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        };
        return date.toLocaleDateString('en-US', options);
    }

    const handleDeleteClick = (id: number) => {
        setPostIdToDelete(id);
        setShowConfirmModal(true);
    };


    const confirmDelete = async () => {
        if (!authToken || postIdToDelete === null) return;

        try {
            await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
                withCredentials: true,
            });


            await axios.delete(`${APP_URL}/api/auth/post/${postIdToDelete}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            setPosts(prevPosts => prevPosts.filter(post => post.id !== postIdToDelete));

            toast.success('Post deleted successfully');

        } catch (error) {
            console.error("Error deleting post:", error);
        } finally {
            setShowConfirmModal(false);
            setPostIdToDelete(null);
        }
    };

    // get saved post
    useEffect(() => {
        const fetchSavedPosts = async () => {
            try {
                const res = await axios.get(`${GET_PROFILE}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    withCredentials: true,
                });

                setSavedPosts(res.data.data.saved_posts
                )

            } catch (error) {
                console.error("Error fetching saved posts", error);
            }
        };

        if (authToken) {
            fetchSavedPosts();
        }
    }, [authToken]);


    const handleUnSavePost = async (id: number) => {
        try {
            await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
                withCredentials: true,
            });

            await axios.delete(
                `${SAVE_POST}/${id}/unsave`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    withCredentials: true,
                }
            );

            setSavedPosts(prevPosts => prevPosts.filter(post => post.id !== id));

            toast.success('Post unsaved');

        } catch (error) {
            console.error('Unsave post failed:', error);
        }
    };

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
                            {posts.length}
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
                            {savedPosts.length}
                        </span>
                    </TabsTrigger>
                </TabsList>


                <TabsContent value="liked" className="mt-6">
                    <div className="space-y-4">
                        {
                            posts.map((post) => {
                                const slug = slugify(post.title, { lower: true });

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
                                                <Link href={`post/${slug}`}>
                                                    <h3 className="font-semibold dark:text-white">{post.title} </h3>
                                                </Link>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatToMonthDay(post.created_at)}
                                                </p>
                                            </div>

                                            {/* Edit / Delete */}
                                            <div className="flex-3">
                                                <div className="flex justify-end gap-4 pt-3">
                                                    <Link href={`/post/${slug}/edit`}>
                                                        <button className="flex items-center gap-1 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                                                            <Pencil className="w-4 h-4" />
                                                            <span>Edit</span>
                                                        </button>
                                                    </Link>
                                                    <button onClick={() => handleDeleteClick(post.id)} className="flex items-center gap-1 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Delete</span>
                                                    </button>

                                                    {
                                                        showConfirmModal && (
                                                            <div className="fixed inset-0 z-5 flex items-center justify-center bg-transparent bg-opacity-50">
                                                                <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                                                                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Confirm Deletion</h2>
                                                                    <p className="text-gray-600 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
                                                                    <div className="flex justify-end space-x-3">
                                                                        <button
                                                                            onClick={() => setShowConfirmModal(false)}
                                                                            className="cursor-pointer px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={confirmDelete}
                                                                            className="cursor-pointer px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }

                                                </div>
                                            </div>

                                        </div>

                                        {/* Post Content */}
                                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                                            {parse(trimWords(post.content, 5))}
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

                        {savedPosts.length === 0 ? (
                            <div className="p-4 border rounded-xl hover:shadow-md transition-all 
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <div className="text-center mb-3">
                                    <h3 className="cursor-pointer font-semibold dark:text-white">No Saved Post</h3>
                                </div>

                            </div>
                        ) : (
                            savedPosts.map((post) => {
                                const slug = slugify(post.title, { lower: true });

                                return (
                                    <div
                                        key={post.id}
                                        className="p-4 border rounded-xl hover:shadow-md transition-all 
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <Link href={`/post/${slug}`}>
                                                <h3 className="cursor-pointer font-semibold dark:text-white">{post.title}</h3>
                                            </Link>
                                            <Bookmark
                                                onClick={() => handleUnSavePost(post.id)}
                                                className="cursor-pointer w-5 h-5 text-blue-500 dark:text-blue-400 fill-current"
                                            />
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            {parse(trimWords(post.content, 9))}
                                        </p>
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatToMonthDay(post.created_at)}
                                            </span>
                                            <Link href={`/post/${slug}`}>
                                                <button className="cursor-pointer text-xs text-blue-500 dark:text-blue-400 hover:underline">
                                                    View Post
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                    </div>
                </TabsContent>

            </Tabs>
        </div>
    )
}

export default Activity