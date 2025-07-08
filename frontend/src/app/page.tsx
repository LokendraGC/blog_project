import React from 'react'
import ClientPost from './ClientPost'

const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

// fetch post
async function fetchPosts() {
  const res = await fetch(`${APP_URL}/api/auth/post`, {
    cache: 'no-store', // to mimic getServerSideProps
  });
  return res.json();
}


const Home = async () => {

  const posts = await fetchPosts();
  // console.log(posts.data.data);

  return (
    <div>
      <ClientPost posts={posts.data.data} />
    </div>
  )
}

export default Home