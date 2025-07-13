import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Comment } from '@/types';

interface CommentFormData {
    comment: string;
    post_id: number;
}

interface CommentSectionProps {
    postID: number;
}

const CommentSection = ({ postID }: CommentSectionProps) => {

    const [comments, setComments] = useState<Comment[]>([]);
    const { register, handleSubmit, formState: { errors } } = useForm<CommentFormData>();


    console.log(postID);
    
    const onSubmit: SubmitHandler<CommentFormData> = async (data) => {
        console.log(data);
    }

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
                    <div className="p-4 border rounded-md shadow-sm">
                        <p className="text-gray-700">This is a sample comment.</p>
                        <span className="text-sm text-gray-400">2 hours ago</span>
                    </div>

                    <div className="p-4 border rounded-md shadow-sm">
                        <p className="text-gray-700">Another insightful comment!</p>
                        <span className="text-sm text-gray-400">1 hour ago</span>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CommentSection