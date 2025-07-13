import SinglePost from '@/components/SinglePost';


const APP_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchPostBySlug(slug: string) {
    const res = await fetch(`${APP_URL}/api/auth/post/${slug}`, {
        cache: 'no-store',
    });

    const data = await res.json();
    return data?.data;
}

export default async function Post({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const post = await fetchPostBySlug(slug);


    return <SinglePost post={post.data} />;
}
