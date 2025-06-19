'use client'
import { myAppHook } from "@/context/AppProvider";
import axios from "axios";
import parse from 'html-react-parser';
import Image from "next/image";
import { useEffect, useState } from "react";
const { convert } = require('html-to-text');


export default function Home() {

  interface PostData {
    id: number;
    title: string;
    content: string;
    feature_image?: string | null | undefined;
    short_description?: string;
    created_at: string | Date;
    user: {
      id: number;
      name: string;
      email: string;
      avatar?: string | null | undefined;
      username: string;
      created_at: string;

    }
  }


  const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
  const { authToken, isLoading } = myAppHook();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [user, setUser] = useState<PostData['user'] | null>(null);

  const { tags } = myAppHook();

  useEffect(() => {
    const posts = async () => {
      try {

        await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });

        const response = await axios.get(`${APP_URL}/api/auth/post`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        })

        console.log(response.data.data.data.user);
        setPosts(response.data.data.data);
        setUser(response.data.data.data.user);

      } catch (error) {
        console.log(error);
      }
    }
    if (authToken) {
      posts();
    }
  }, [authToken])


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
    const plainText = convert(text, { wordwrap: false }); // Removes HTML
    return plainText.split(' ').slice(0, wordLimit).join(' ') + '...';
  }

  function formatToMonthDay(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }


  function fixInvalidHtml(html: string): string {
    return html.replace(/<p[^>]*>\s*(<h[1-6][^>]*>.*?<\/h[1-6]>)\s*<\/p>/gi, '$1');
  }

  const IMAGE_URL = `${process.env.NEXT_PUBLIC_POST_IMAGE_BASE_URL}`;
  const AVATAR_URL = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/`;

  console.log(tags);

  return (
    <>
      {/* 
      {
        posts.map((post) => (
          <div key={post.id}>
            <h1>{post.title}</h1>
            <div>{parse(post.content)}</div>
          </div>
        ))
      } */}


      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Top Navigation */}
        <div className="sticky top-18 py-4 z-101 bg-white dark:bg-gray-900 shadow-sm">
          {/* Left Arrow */}
          <button
            onClick={() => scrollNav('left')}
            className="absolute py-4 left-0 top-1/2 -translate-y-1/2 z-20 px-2  bg-gradient-to-r from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 shadow hover:bg-opacity-90"
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
              <button className="text-black dark:text-white border-b-2 border-black dark:border-white">
                For you
              </button>
              <button className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
                Following
              </button>
              <button className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
                Featured
              </button>

              {/* <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs px-2 rounded">
                New
              </span> */}

            </nav>
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scrollNav('right')}
            className="absolute py-4 right-0 top-1/2 -translate-y-1/2 z-20 px-2  bg-gradient-to-l from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 shadow hover:bg-opacity-90"
            aria-label="Scroll Right"
          >
            &gt;
          </button>
        </div>


        {/* Blog Post Card */}
        {
          posts.map((post) => (
            <div key={post.id} className="flex justify-between items-start py-6 border-b dark:border-gray-700">
              {/* Content Section */}
              <div className="flex-1 pr-4">
                {/* Author */}
                <div className="flex gap-3 items-center text-sm text-gray-500 dark:text-gray-400">
                  <Image
                    src={post.user.avatar ? AVATAR_URL + post.user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(post?.user.name || 'User')}&background=random`}
                    width={25}
                    height={25}
                    className="rounded-full"
                    alt={post.user?.name}
                  />
                  {post.user.name}</div>

                {/* Title */}
                <h2 className="cursor-pointer text-xl font-bold text-gray-900 dark:text-white mt-1 break-words leading-snug">
                  {post.title}
                </h2>



                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                  {parse(trimWords(post.content, 5))}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {/* Left Side: Meta Info */}
                  <div className="flex space-x-4">
                    <span>{formatToMonthDay(post.user?.created_at)}</span>
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="cursor-pointer h-4 w-4 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
             4.42 3 7.5 3c1.74 0 3.41 0.81 
             4.5 2.09C13.09 3.81 14.76 3 
             16.5 3 19.58 3 22 5.42 22 
             8.5c0 3.78-3.4 6.86-8.55 
             11.54L12 21.35z" />
                      </svg>
                      2.8K
                    </span>

                    <span className="cursor-pointer">💬 72</span>
                  </div>



                  {/* Right Side: Save Icon */}
                  <button className="text-gray-500 cursor-pointer mr-[80px] hover:text-black dark:text-gray-400 dark:hover:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 5v14l7-5 7 5V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"
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
          ))
        }





      </div>


    </>
  );
}
