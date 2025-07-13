'use client'
import React, { useEffect, useRef, useState } from 'react'
import parse from 'html-react-parser';
import PostData from '@/types';
import { formatDistanceToNow } from "date-fns";
import Image from 'next/image';
import { Heart, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { GET_COMMENT, GET_LIKED_POST, LIKE_POST } from '@/lib/ApiEndPoints';
import { myAppHook } from '@/context/AppProvider';
import toast from 'react-hot-toast';
import CommentSection from './CommentSection';

interface ClientPostProps {
    post: PostData;
}



const SinglePost = ({ post }: ClientPostProps) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const AVATAR_URL = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/`;
    const [likedPostIds, setLikedPosts] = useState<Set<number>>(new Set());
    const [liked, setLiked] = useState(false);
    const [postLikeCounts, setPostLikeCounts] = useState<Record<number, number>>({});
    const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
    const { authToken } = myAppHook();
    const [countComments, setCountComments] = useState<number | null>(null);


    useEffect(() => {
        if (!contentRef.current) return;

        contentRef.current.querySelectorAll('pre').forEach((block) => {
            if (
                block.parentNode instanceof HTMLElement &&
                !block.parentNode.classList.contains('code-block-wrapper')
            ) {
                // Create copy button
                const button = document.createElement('button');
                button.className = 'copy-btn';
                button.innerText = 'Copy';

                button.addEventListener('click', () => {
                    const code = block.querySelector('code');
                    if (!code) return;

                    navigator.clipboard.writeText(code.innerText).then(() => {
                        button.innerText = 'Copied!';
                        button.classList.add('copied');
                        setTimeout(() => {
                            button.innerText = 'Copy';
                            button.classList.remove('copied');
                        }, 2000);
                    });
                });

                const wrapper = document.createElement('div');
                wrapper.className = 'code-block-wrapper';

                block.parentNode.insertBefore(wrapper, block);
                wrapper.appendChild(block);
                wrapper.appendChild(button);
            }
        });
    }, []); // Re-run when posts load

    // get liked post 
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

    // handle like post
    const handleToggleLike = async (postId: number) => {

        if (!authToken) {
            toast.error("Please login to like a post");
            return;
        }

        try {

            await axios.get(`${APP_URL}/sanctum/csrf-cookie`, { withCredentials: true });

            const isLiked = likedPostIds.has(postId);

            const response = isLiked ?
                await axios.delete(`${LIKE_POST}/${postId}/unlike`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    withCredentials: true,
                }) :
                await axios.post(`${LIKE_POST}/${postId}/like`, {}, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    withCredentials: true,
                });

            setLikedPosts(prev => {
                const updated = new Set(prev);
                isLiked ? updated.delete(postId) : updated.add(postId);
                return updated;
            });

            setPostLikeCounts(prev => ({
                ...prev,
                [postId]: (prev[postId] ?? 0) + (isLiked ? -1 : 1),
            }));


            toast.success(`Post ${isLiked ? 'unliked' : 'liked'}`);
            console.log(response);

            console.log(isLiked, "isLiked");
        }

        catch (error) {
            console.log(error);
        }
    }


    const fetchComments = async () => {
        try {
            const response = await axios.get(`${GET_COMMENT}/${post.id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                withCredentials: true,
            })
            setCountComments(response.data.data.count);
        } catch (error) {
            console.error(error);
        }
    }


    useEffect(() => {
        if (!authToken || !post.id) return;
        fetchComments();
    }, [post.id]);

    return (
        <>
            {post ? (
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        {post.title}
                    </h1>

                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <Image
                                width={24}
                                height={24}
                                src={
                                    post.user.avatar && typeof post.user.avatar === 'string' && post.user.avatar.length > 0
                                        ? AVATAR_URL + post.user.avatar
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name || 'U')}&background=random`
                                }
                                alt={post.user.name}
                                className="rounded-full w-6 h-6"
                            />
                            <span>{post.user.name}</span>
                            <p> {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 mr-5">
                            <div
                                className={`flex items-center gap-1 cursor-pointer ${likedPostIds.has(post.id) ? 'text-red-500' : 'text-gray-400'
                                    }`}
                                onClick={() => handleToggleLike(post.id)}
                            >
                                <Heart
                                    className="w-4 h-4 fill-current"
                                    fill={likedPostIds.has(post.id) ? 'currentColor' : 'none'}
                                    strokeWidth={likedPostIds.has(post.id) ? 0 : 2}
                                />
                                <span>{postLikeCounts[post.id] ?? post.likes_count ?? 0}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 cursor-pointer hover:text-blue-500"
                                onClick={() => {
                                    const commentElement = document.getElementById('comment');
                                    if (commentElement) {
                                        const topOffset = commentElement.getBoundingClientRect().top + window.scrollY - 100; // adjust -100 as needed

                                        window.scrollTo({
                                            top: topOffset,
                                            behavior: 'smooth',
                                        });

                                        setTimeout(() => {
                                            commentElement.focus();
                                        }, 500);
                                    }
                                }}

                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>{countComments ?? 0}</span>
                            </div>
                        </div>
                    </div>


                    <div
                        ref={contentRef}
                        className="parsed-content
                    prose prose-sm sm:prose lg:prose-lg dark:prose-invert
                    max-w-none
                    [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6
                    [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-4
                    [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-3
                    [&>p]:mb-4 [&>p]:text-gray-800 dark:[&>p]:text-gray-200
                    [&>ul]:list-disc [&>ul]:ml-6 [&>ul>li]:mb-2
                    [&>ol]:list-decimal [&>ol]:ml-6 [&>ol>li]:mb-2
                    [&>img]:rounded-xl [&>img]:border [&>img]:border-gray-300 [&>img]:my-6

                    [&_pre]:relative [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4
                    [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:mb-6

                    [&_code]:text-green-400 [&_code]:font-mono

                    [&_.copy-btn]:absolute [&_.copy-btn]:top-2 [&_.copy-btn]:right-2
                    [&_.copy-btn]:bg-gray-700 [&_.copy-btn]:text-white [&_.copy-btn]:text-xs
                    [&_.copy-btn]:px-3 [&_.copy-btn]:py-1 [&_.copy-btn]:rounded-md
                    [&_.copy-btn]:hover:bg-gray-600 [&_.copy-btn]:transition
                "
                    >
                        {parse(post.content)}
                    </div>

                    <CommentSection postID={post.id} />

                </div>
            ) : (
                <p>Post not found</p>
            )}
        </>
    )
}

export default SinglePost