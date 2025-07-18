'use client'
import { myAppHook } from "@/context/AppProvider";
import { GET_LIKED_POST, LIKE_POST, SAVE_POST } from "@/lib/ApiEndPoints";
import axios from "axios";
import parse from 'html-react-parser';
import { Heart, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import slugify from 'slugify';
import PostData from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

const { convert } = require('html-to-text');

interface ClientPostProps {
    posts: PostData[];
    query?: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    avatar?: string | null | undefined;
    username: string;
    created_at: string;
}

export default function ClientPost({ posts, query }: ClientPostProps) {

    console.log(query);

    const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
    const { authToken, isLoading } = myAppHook();
    const [allPosts, setallPosts] = useState(posts);
    const [user, setUser] = useState<UserData | null>(null);
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
    const [tagPosts, setTagPosts] = useState<PostData[]>([]);
    const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
    const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
    const [postLikeCounts, setPostLikeCounts] = useState<Record<number, number>>({});


    const { tags } = myAppHook();


    const fetchPosts = async () => {
        try {

            const response = await axios.get(`${APP_URL}/api/auth/post`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            // console.log(response.data.data.data.user);
            setallPosts(response.data.data.data);
            setUser(response.data.data.data.user);
            console.log(user);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchPosts();
    }, []);


    const fetchPostByTag = async (tagId: number) => {
        try {
            const response = await axios.get(`${APP_URL}/api/auth/tag/${tagId}`);
            setSelectedTagId(tagId);

            setTagPosts(response.data.data.data.posts);
            setUser(response.data.data.data.user);
            // console.log(user);
        } catch (error) {
            console.error('Error fetching tag posts:', error);
            setTagPosts([]); // Clear posts on error
        }
    };


    const parsedPosts = parse(`${posts}`);

    const scrollNav = (direction: 'left' | 'right') => {
        const nav = document.getElementById('scrollable-nav');
        if (!nav) return;
        const scrollAmount = 150;
        nav.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

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


    function fixInvalidHtml(html: string): string {
        return html.replace(/<p[^>]*>\s*(<h[1-6][^>]*>.*?<\/h[1-6]>)\s*<\/p>/gi, '$1');
    }

    const IMAGE_URL = `${process.env.NEXT_PUBLIC_POST_IMAGE_BASE_URL}`;
    const AVATAR_URL = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/`;

    const handleSavePost = async (id: number) => {
        try {

            if (!authToken) {
                toast.error('Login to save');
                return;
            }

            await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
                withCredentials: true,
            });

            await axios.post(
                `${SAVE_POST}/${id}/save`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    withCredentials: true,
                }
            );

            toast.success('Post saved');
            // Update the savedPosts set
            setSavedPosts(prev => new Set(prev).add(id));
        } catch (error) {
            console.error('Save post failed:', error);
        }
    };

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

            toast.success('Post unsaved');
            // Update the savedPosts set
            setSavedPosts(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        } catch (error) {
            console.error('Unsave post failed:', error);
        }
    };


    // like post 
    const handleToggleLike = async (postId: number) => {
        if (!authToken) {
            toast.error('Login to Like');
            return;
        }

        try {
            await axios.get(`${APP_URL}/sanctum/csrf-cookie`, { withCredentials: true });

            const isLiked = likedPosts.has(postId);

            const response = isLiked
                ? await axios.delete(`${LIKE_POST}/${postId}/unlike`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                    withCredentials: true,
                })
                : await axios.post(`${LIKE_POST}/${postId}/like`, {}, {
                    headers: { Authorization: `Bearer ${authToken}` },
                    withCredentials: true,
                });

            // Update liked status
            setLikedPosts(prev => {
                const updated = new Set(prev);
                isLiked ? updated.delete(postId) : updated.add(postId);
                return updated;
            });

            // Update like count for the specific post
            setallPosts(prev => prev.map(post =>
                post.id === postId
                    ? { ...post, likes_count: response.data.like_count }
                    : post
            ));

            // If you're using postLikeCounts state, update it like this:
            setPostLikeCounts(prev => ({
                ...prev,
                [postId]: response.data.like_count
            }));

            toast.success(`Post ${isLiked ? 'unliked' : 'liked'}`);
        } catch (error) {
            console.error('Toggle like failed:', error);
        }
    };


    useEffect(() => {
        const fetchSavedPosts = async () => {
            try {
                const res = await axios.get(`${SAVE_POST}/saved-posts`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    withCredentials: true,
                });
                setSavedPosts(new Set(res.data.savedPostIds));
            } catch (error) {
                console.error("Error fetching saved posts", error);
            }
        };

        if (authToken) {
            fetchSavedPosts();
        }
    }, [authToken]);


    useEffect(() => {
        const fetchLikedPosts = async () => {
            try {
                console.log("Attempting to fetch liked posts with token:", authToken);

                const res = await axios.get(`${GET_LIKED_POST}/get-liked-post`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    withCredentials: true,
                });

                console.log("Response received:", res.data);
                setLikedPosts(new Set(res.data.likedPostIds));

            } catch (error: any) {
                console.error("Error fetching liked posts", error);
                if (error.response) {
                    console.error("Response data:", error.response.data);

                } else if (error.request) {
                    console.error("No response received:", error.request);
                } else {
                    console.error("Request setup error:", error.message);
                }
            }
        }

        if (authToken) {
            fetchLikedPosts();
        } else {
            console.log("No auth token available");
        }
    }, [authToken])


    // search posts
    const searchTerm = query?.trim().toLowerCase();
    const filteredPosts = searchTerm
        ? allPosts.filter(post => post.title.toLowerCase().includes(searchTerm))
        : allPosts;

    // If a tag is selected, filter posts by that tag
    const filteredByTagPosts = searchTerm
        ? tagPosts.filter(post => post.title.toLowerCase().includes(searchTerm))
        : tagPosts;

    const getAvatarUrl = (avatarPath: string | null | undefined) => {
        if (!avatarPath) return null;

        // Handle base64 encoded avatars (from avatar generator)
        if (avatarPath.startsWith('data:image')) {
            return avatarPath;
        }

        // Handle uploaded avatars (stored in storage)
        return `${process.env.NEXT_PUBLIC_API_URL}/storage/avatars/${avatarPath}`;
    };

    return (
        <>

            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Top Navigation */}
                <div className="sticky top-17 py-4 z-101 bg-white dark:bg-gray-900 shadow-sm">
                    {/* Left Arrow */}
                    <button
                        onClick={() => scrollNav('left')}
                        className="absolute py-4 left-0 top-1/2 -translate-y-1/2 z-20 px-1 pl-3 
             bg-white dark:bg-gray-900  
             hover:bg-white dark:hover:bg-gray-800 
             transition-colors duration-200 cursor-pointer"
                        aria-label="Scroll Left"
                    >
                        &lt;
                    </button>


                    {/* Scrollable Nav */}
                    <div
                        id="scrollable-nav"
                        className="overflow-x-auto whitespace-nowrap scrollbar-hide scroll-smooth px-8"
                    >
                        <nav className="flex space-x-6 text-sm font-medium min-w-max">
                            <button
                                onClick={() => {
                                    setSelectedTagId(null);
                                    fetchPosts();
                                }}
                                className={`
                                            px-4 py-1 rounded-full text-sm font-semibold border whitespace-nowrap
                                            transition-colors duration-300
                                            ${selectedTagId === null
                                        ? 'bg-blue-600 text-white border-blue-600 cursor-pointer'
                                        : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 cursor-pointer dark:hover:bg-gray-600'}
                                      `}
                            >
                                For You
                            </button>

                            {tags?.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => fetchPostByTag(tag.id)}
                                    className={`px-2 py-1 rounded-full text-sm font-medium border 
            whitespace-nowrap transition-colors duration-300 cursor-pointer
            ${selectedTagId === tag.id
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600'
                                        }
        `}
                                >
                                    {tag.tag_name}
                                </button>
                            ))}



                        </nav>
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scrollNav('right')}
                        className="cursor-pointer absolute py-4 right-0 top-1/2 -translate-y-1/2 z-20 px-3 
             bg-white dark:bg-gray-900 
             shadow-none dark:shadow 
             hover:bg-white dark:hover:bg-gray-800 
             transition-colors duration-200"
                        aria-label="Scroll Right"
                    >
                        &gt;
                    </button>

                </div>


                {/* Blog Post Card */}
                {

                    selectedTagId ? filteredByTagPosts.map((post) => {
                        const slug = slugify(post.title, { lower: true });

                        return (

                            <div key={post.id} className="flex justify-between items-start py-6 border-b dark:border-gray-700">
                                {/* Content Section */}
                                <div className="flex-1 pr-4">
                                    {/* Author */}
                                    <div className="flex gap-3 items-center text-sm text-gray-500 dark:text-gray-400">

                                        <Image
                                            src={
                                                user?.avatar && typeof user.avatar === 'string' && user.avatar.length > 0
                                                    ? AVATAR_URL + user.avatar
                                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`
                                            }
                                            width={25}
                                            height={25}
                                            className="rounded-full"
                                            alt={user?.name || 'User'}
                                        />
                                        {user?.name}
                                        <div>
                                            {formatToMonthDay(post.created_at)}
                                        </div>
                                    </div>

                                    {/* Title */}

                                    <Link href={`/post/${slug}`}>
                                        <h2 className="cursor-pointer text-xl font-bold text-gray-900 dark:text-white mt-1 break-words leading-snug">
                                            {post.title}
                                        </h2>
                                    </Link>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                                        {parse(trimWords(post.content, 5))}
                                    </p>

                                    {/* Meta Info */}
                                    <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">


                                        {/* Left Side: Meta Info */}
                                        <div className="flex gap-4 mt-2">
                                            <button className="cursor-pointer flex items-center gap-1 text-pink-500 dark:text-pink-400">
                                                <Heart
                                                    onClick={() => handleToggleLike(post.id)}
                                                    className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`}
                                                />
                                                <span>{postLikeCounts[post.id] ?? post.likes_count}</span>
                                            </button>

                                            <Link href={`/post/${slug}`}>
                                                <button className="flex items-center cursor-pointer gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span>Comment</span>
                                                </button>
                                            </Link>
                                        </div>



                                        {/* Right Side: Save Icon */}
                                        <button onClick={() => savedPosts.has(post.id) ? handleUnSavePost(post.id) : handleSavePost(post.id)} className="text-gray-500 cursor-pointer mr-[80px] hover:text-black dark:text-gray-400 dark:hover:text-white">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 24 24"
                                                fill={savedPosts.has(post.id) ? "currentColor" : "none"}
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                                />
                                            </svg>

                                        </button>


                                    </div>

                                </div>

                                {/* Feature Image */}
                                <div className="min-w-[128px] h-full">
                                    <Image
                                        src={`${post.feature_image ? IMAGE_URL + post.feature_image : 'noimage.svg'}`}
                                        alt="Feature"
                                        width={150}
                                        height={150}
                                        className="rounded-md"
                                    />
                                </div>
                            </div>

                        )
                    }) :

                        filteredPosts.map((post) => {

                            const slug = slugify(post.title, { lower: true });

                            return (

                                <div key={post.id} className="flex justify-between items-start py-6 border-b dark:border-gray-700">
                                    {/* Content Section */}
                                    <div className="flex-1 pr-4">
                                        {/* Author */}
                                        <div className="flex gap-3 items-center text-sm text-gray-500 dark:text-gray-400">

                                            {
                                                post.user.avatar ? (
                                                    <Image
                                                        src={getAvatarUrl(post.user.avatar) || `https://ui-avatars.com/api/?name=${post?.user.name || 'User'}&background=random`}
                                                        alt="Profile Image"
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full border shadow-md"
                                                        loader={({ src }) => src}
                                                    />
                                                ) : (
                                                    <Avatar>
                                                        <Image
                                                            className="rounded-full border shadow-md"
                                                            width={40}
                                                            height={40}
                                                            src={`https://ui-avatars.com/api/?name=${post?.user.name || 'User'}&background=random`}
                                                            alt={post?.user.name || 'User'}
                                                        />
                                                        <AvatarFallback>
                                                            {post?.user.name ? post?.user.name.charAt(0).toUpperCase() : 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )
                                            }
                                            {post.user.name}

                                            <div>
                                                {formatToMonthDay(post.created_at)}
                                            </div>

                                        </div>

                                        {/* Title */}
                                        <Link href={`/post/${slug}`}>
                                            <h2 className="cursor-pointer text-xl font-bold text-gray-900 dark:text-white mt-1 break-words leading-snug">
                                                {post.title}
                                            </h2>
                                        </Link>

                                        {/* Description */}
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                                            {parse(trimWords(post.content, 5))}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">

                                            {/* Left Side: Meta Info */}
                                            {/* Liked / Comment */}
                                            <div className="flex gap-4 mt-2">
                                                <button className="cursor-pointer flex items-center gap-1 text-pink-500 dark:text-pink-400">
                                                    <Heart
                                                        onClick={() => handleToggleLike(post.id)}
                                                        className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`}
                                                    />
                                                    <span>{postLikeCounts[post.id] ?? post.likes_count}</span>
                                                </button>

                                                <Link href={`/post/${slug}`}>
                                                    <button className="flex items-center cursor-pointer gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span>Comment</span>
                                                    </button>
                                                </Link>

                                            </div>



                                            {/* Right Side: Save Icon */}
                                            <button onClick={() => savedPosts.has(post.id) ? handleUnSavePost(post.id) : handleSavePost(post.id)} className="text-gray-500 cursor-pointer mr-[80px] hover:text-black dark:text-gray-400 dark:hover:text-white">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    viewBox="0 0 24 24"
                                                    fill={savedPosts.has(post.id) ? "currentColor" : "none"}
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 5a2 2 0 012-2h10a2 2 0 012  2v16l-7-3.5L5 21V5z"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                    </div>

                                    {/* Feature Image */}
                                    <div className="min-w-[128px] h-full">
                                        <Image
                                            src={`${post.feature_image ? IMAGE_URL + post.feature_image : 'noimage.svg'}`}
                                            alt="Feature"
                                            width={150}
                                            height={150}
                                            className="rounded-md"
                                        />
                                    </div>
                                </div>

                            )
                        })

                }

                {selectedTagId && tagPosts && tagPosts.length === 0 && (
                    <div className="flex justify-between items-start py-6 border-b dark:border-gray-700">
                        <h3>No posts available</h3>
                    </div>
                )}

                {allPosts && filteredPosts.length === 0 && (
                    <div className="flex justify-between items-start py-6 border-b dark:border-gray-700">
                        <h3>Not found</h3>
                    </div>
                )}



            </div>


        </>
    );
}
