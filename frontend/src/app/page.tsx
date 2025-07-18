import React from 'react'
import ClientPost from '../components/ClientPost'

const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

// fetch post
async function fetchPosts() {
  const res = await fetch(`${APP_URL}/api/auth/post`, {
    cache: 'no-store', // to mimic getServerSideProps
  });
  return res.json();
}


const Home = async ({ searchParams }: {
  searchParams?: {
    query?: string;
    page?: string;
  }
}) => {

  const query = searchParams?.query || '';
  console.log(query);
  const posts = await fetchPosts();
  // console.log(posts.data.data);

  return (
    <div>
      <ClientPost posts={posts.data.data} query={query} />
    </div>
  )
}

export default Home