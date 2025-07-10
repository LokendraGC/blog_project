import SinglePost from '@/components/SinglePost';
import { GET_LIKED_POST } from '@/lib/ApiEndPoints';
import axios from 'axios';
import { cookies } from 'next/headers';

const APP_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchPostBySlug(slug: string) {
    const res = await fetch(`${APP_URL}/api/auth/post/${slug}`, {
        cache: 'no-store',
    });

    const data = await res.json();
    return data?.data;
}

async function handleLikePost() {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
        console.error('No authentication token found');
        return null;
    }

    try {
        await axios.get(`${APP_URL}/sanctum/csrf-cookie`, { withCredentials: true });

        const res = await fetch(`${GET_LIKED_POST}/get-liked-post`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching liked posts:', error);
        return null;
    }
}

export default async function Post({ params }: { params: { slug: string } }) {
    const post = await fetchPostBySlug(params.slug);
    const likePostIds = await handleLikePost();

    // console.log(likePostIds.likedPostIds);

    return <SinglePost post={post.data} likedPostIds={likePostIds.likedPostIds
    } />;
}
