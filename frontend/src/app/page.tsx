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


const { convert } = require('html-to-text');


export default function Home() {

  interface PostData {
    id: number;
    title: string;
    content: string;
    feature_image?: string | null | undefined;
    short_description?: string;
    created_at: string;
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
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

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
      toast.error('Login to save');
      return;
    }

    try {
      await axios.get(`${APP_URL}/sanctum/csrf-cookie`, { withCredentials: true });

      const isLiked = likedPosts.has(postId);

      if (isLiked) {
        await axios.post(`${LIKE_POST}/${postId}/unlike`, {}, {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true,
        });

        setLikedPosts(prev => {
          const updated = new Set(prev);
          updated.delete(postId);
          return updated;
        });

        toast.success('Post unliked');
      } else {
        await axios.post(`${LIKE_POST}/${postId}/like`, {}, {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true,
        });

        setLikedPosts(prev => {
          const updated = new Set(prev);
          updated.add(postId);
          return updated;
        });

        toast.success('Post liked');
      }
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
      console.log(GET_LIKED_POST);
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

          selectedTagId ? tagPosts.map((post) => {
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
                      <button className="flex items-center gap-1 text-pink-500 dark:text-pink-400">
                        <Heart className="w-4 h-4 fill-current" />
                        <span>123</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                        <MessageSquare className="w-4 h-4" />
                        <span>Comment</span>
                      </button>
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

            posts.map((post) => {

              const slug = slugify(post.title, { lower: true });

              return (

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
                          <Heart onClick={() => handleToggleLike(post.id)} className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                          <span>{likedPosts.size}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                          <MessageSquare className="w-4 h-4" />
                          <span>Comment</span>
                        </button>
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





      </div>


    </>
  );
}
