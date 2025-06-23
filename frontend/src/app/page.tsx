'use client'
import { myAppHook } from "@/context/AppProvider";
import axios from "axios";
import parse from 'html-react-parser';
import Image from "next/image";
import { use, useEffect, useState } from "react";
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
      created_at: string | undefined;

    }
  }

  interface UserData {
    id: number;
    name: string;
    email: string;
    avatar?: string | null | undefined;
    username: string;
    created_at: string;

  }

  const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
  const { authToken, isLoading } = myAppHook();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [tagPosts, setTagPosts] = useState<PostData[]>([]);

  const { tags } = myAppHook();


  const fetchPosts = async () => {
    try {

      const response = await axios.get(`${APP_URL}/api/auth/post`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // console.log(response.data.data.data.user);
      setPosts(response.data.data.data);
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
      console.log(user);
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

  // console.log(user?.created_at);


  return (
    <>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Top Navigation */}
        <div className="sticky top-18 py-4 z-101 bg-white dark:bg-gray-900 shadow-sm">
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
              <button onClick={() => {
                setSelectedTagId(null);
                fetchPosts();
              }} className={`text-black  dark:text-white cursor-pointer ${selectedTagId === null ? 'border-b-2 border-black dark:border-white' : 'border-transparent'}`}>
                For You
              </button>
              {tags?.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => fetchPostByTag(tag.id)}
                  className={`cursor-pointer
      ${selectedTagId === tag.id ?
                      'border-b-2 border-black dark:border-white' :
                      'border-transparent'
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

          selectedTagId ? tagPosts.map((post) => (

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
                </div>

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
                    <span>{formatToMonthDay(user?.created_at || '')}</span>
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

          )) :

            posts.map((post) => (

              <div key={post.id} className="flex justify-between items-start py-6 border-b dark:border-gray-700">
                {/* Content Section */}
                <div className="flex-1 pr-4">
                  {/* Author */}
                  <div className="flex gap-3 items-center text-sm text-gray-500 dark:text-gray-400">

                    <Image
                      src={
                        post.user?.avatar && typeof post.user.avatar === 'string' && post.user.avatar.length > 0
                          ? AVATAR_URL + post.user.avatar
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name || 'U')}&background=random`
                      }
                      width={25}
                      height={25}
                      className="rounded-full"
                      alt={post.user?.name || 'User'}
                    />
                    {post.user.name}
                  </div>

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
                      <span>{formatToMonthDay(post.user?.created_at || '')}</span>
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
        
        {selectedTagId && tagPosts && tagPosts.length === 0 && (
          <div className="flex justify-between items-start py-6 border-b dark:border-gray-700">
            <h3>No posts available</h3>
          </div>
        )}





      </div>


    </>
  );
}
