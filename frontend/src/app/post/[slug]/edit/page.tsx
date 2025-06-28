'use client'

import TipTap from '@/components/TipTap'
import { myAppHook } from '@/context/AppProvider';
import { EDIT_POST } from '@/lib/ApiEndPoints';
import { useParams } from 'next/navigation';
import React from 'react'
import slugify from 'slugify';
import { PostData } from "@/types";


const EditPost = () => {

    const { posts } = myAppHook();
    const params = useParams();
    const slug = params.slug;
    const post = posts?.find((p) => slugify(p.title, { lower: true }) === slug);

    if (!posts) {
        return <div>Loading...</div>;
    }

    if (!post) {
        return <div>Post not found</div>;
    }


    // console.log(post);


    return (
        <div>
            <TipTap post={post} />
        </div>
    )
}

export default EditPost