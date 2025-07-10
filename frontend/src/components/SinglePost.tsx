'use client'
import React, { useEffect, useRef } from 'react'
import parse from 'html-react-parser';
import PostData from '@/types';
import { formatDistanceToNow } from "date-fns";
import Image from 'next/image';
import { Heart, MessageCircle } from 'lucide-react';

interface ClientPostProps {
    post: PostData;
}



const SinglePost = ({ post, likedPostIds }: { post: PostData, likedPostIds: number[] }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const AVATAR_URL = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/`;


    console.log(post.user);

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
                            <div className="flex items-center gap-1 cursor-pointer hover:text-red-500">
                                <Heart className="w-4 h-4" />
                                <span>12</span>
                            </div>
                            <div className="flex items-center gap-1 cursor-pointer hover:text-blue-500">
                                <MessageCircle className="w-4 h-4" />
                                <span>5</span>
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

                </div>
            ) : (
                <p>Post not found</p>
            )}
        </>
    )
}

export default SinglePost