import React, { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Comment } from '@/types';
import axios from 'axios';
import { myAppHook } from '@/context/AppProvider';
import toast from 'react-hot-toast';
import { COMMENT_END_POINT, GET_COMMENT } from '@/lib/ApiEndPoints';
import { Pencil, TrashIcon } from 'lucide-react';

interface CommentFormData {
    comment: string;
    post_id: number;
}

interface CommentSectionProps {
    postID: number;
}

const CommentSection = ({ postID }: CommentSectionProps) => {

    const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
    const { authToken } = myAppHook();
    const [comments, setComments] = useState<Comment[]>([]);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CommentFormData>();



    const onSubmit: SubmitHandler<CommentFormData> = async (data) => {

        try {

            const response = await axios.post(`${COMMENT_END_POINT}`, {
                body: data.comment,
                post_id: postID
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                withCredentials: true,
            })

            toast.success('Comment posted successfully');
            reset({ comment: "" });
            fetchComments();

        } catch (error) {
            console.error(error);
        }

    }

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${GET_COMMENT}/${postID}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                withCredentials: true,
            })
            setComments(response.data.data.data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (!authToken || !postID) return;
        fetchComments();
    }, [postID]);

    return (
        <div>
            <div className="mt-6 max-w-3xl">
                <h2 className="text-xl font-semibold mb-4">Comments</h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <textarea
                        id="comment"
                        placeholder="Write your comment here..."
                        rows={4}
                        {...register('comment', { required: 'Comment is required' })}
                        className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                    {errors.comment && <p className='text-red-500'>{errors.comment.message as string}</p>}

                    <button
                        type="submit"
                        className="cursor-pointer mt-3 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Post Comment
                    </button>
                </form>

                <div className="mt-6 space-y-4">
                    {
                        comments ? comments.map(comment => (
                            <div key={comment.id} className="p-4 border rounded-md shadow-sm relative">
                                <p className="text-gray-700 dark:text-white">{comment.body}</p>
                                <span className="text-sm text-gray-400">2 hours ago</span>

                                {/* Action Icons */}
                                <div className="absolute top-2 right-2 flex space-x-2">
                                    <Pencil className="h-5 w-5 text-blue-500 cursor-pointer hover:text-blue-700" />
                                    <TrashIcon className="h-5 w-5 text-red-500 cursor-pointer hover:text-red-700" />
                                </div>
                            </div>
                        )) : (
                            <div className="p-4 border rounded-md shadow-sm relative">
                                <span className="text-sm text-gray-400">No comments yet.</span>
                            </div>
                        )
                    }
                </div>
            </div>

        </div>
    )
}

export default CommentSection