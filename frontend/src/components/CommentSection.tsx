import React, { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Comment } from '@/types';
import axios from 'axios';
import { myAppHook } from '@/context/AppProvider';
import toast from 'react-hot-toast';
import { COMMENT_END_POINT, GET_COMMENT } from '@/lib/ApiEndPoints';
import { Pencil, TrashIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface CommentFormData {
    comment: string;
    post_id: number;
}

interface CommentSectionProps {
    postID: number | undefined;
}

const CommentSection = ({ postID }: CommentSectionProps) => {

    const AVATAR_URL = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/`;
    const { authToken, user } = myAppHook();
    const [comments, setComments] = useState<Comment[]>([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);
    const [editComment, setEditComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CommentFormData>();

    const onSubmit: SubmitHandler<CommentFormData> = async (data) => {

        try {

            if (editComment && editingCommentId !== null) {
                const response = axios.put(`${COMMENT_END_POINT}/${editingCommentId}`, {
                    body: data.comment,
                    post_id: postID
                }, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    withCredentials: true,
                })
                console.log(response);
                reset({ comment: "" });
                setEditComment(false);
                toast.success('Comment updated successfully');
                fetchComments();
            } else {
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
            }

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

    const handleDeleteComment = async (commentId: number) => {

        if (!authToken || commentId === null) {
            return;
        }
        setShowConfirmModal(true);
        setPostIdToDelete(commentId);
    }


    // confirm delete comment function
    const confirmDelete = async () => {
        try {

            const response = await axios.delete(`${COMMENT_END_POINT}/${postIdToDelete}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                withCredentials: true,
            });

            toast.success('Comment deleted successfully');
            fetchComments();

        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete comment");
        } finally {
            setShowConfirmModal(false);
            setPostIdToDelete(null);
        }

    }

    // edit comment function
    const handleEditComment = (commentId: number) => {
        if (!authToken || commentId === null) {
            return;
        }
        setEditingCommentId(commentId);
        setEditComment(true);
        setShowConfirmModal(false);
        try {

            const commentToEdit = comments.find(comment => comment.id === commentId);
            if (!commentToEdit) {
                toast.error('Comment not found');
                return;
            }

            reset({
                comment: commentToEdit.body,
                post_id: postID
            });


        } catch (error) {
            console.error("Error editing comment:", error);
            toast.error("Failed to edit comment");
        }
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
                        {`${editComment ? 'Update Comment' : 'Post Comment'}`}
                    </button>
                </form>

                <div className="mt-6 space-y-4">
                    {
                        comments ? comments.map(comment => (
                            <div key={comment.id} className="p-4 border rounded-md shadow-sm relative">
                                <div className="flex items-center gap-2 mb-3">
                                    <Image
                                        width={24}
                                        height={24}
                                        src={
                                            comment.user.avatar && typeof comment.user.avatar === 'string' && comment.user.avatar.length > 0
                                                ? AVATAR_URL + comment.user.avatar
                                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'U')}&background=random`
                                        }
                                        alt={comment.user.name}
                                        className="rounded-full w-6 h-6"
                                    />
                                    <span className='font-bold'>{comment.user.name}</span>
                                    <span className="text-sm text-gray-400">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                                </div>
                                <p className="text-gray-700 dark:text-white ml-[34px]">{comment.body}</p>

                                {/* Action Icons */}
                                {comment.user.id === user?.user.id && (
                                    <div className="absolute top-2 right-2 flex space-x-2">
                                        <Pencil
                                            className="h-5 w-5 text-blue-500 cursor-pointer hover:text-blue-700"
                                            onClick={() => handleEditComment(comment.id)}
                                        />
                                        <TrashIcon
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="h-5 w-5 text-red-500 cursor-pointer hover:text-red-700"
                                        />
                                    </div>
                                )}

                                {
                                    showConfirmModal && (
                                        <div className="fixed inset-0 z-5 flex items-center justify-center bg-transparent bg-opacity-50">
                                            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                                                <h2 className="text-lg font-semibold mb-4 text-gray-800">Confirm Deletion</h2>
                                                <p className="text-gray-600 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() => setShowConfirmModal(false)}
                                                        className="cursor-pointer px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={confirmDelete}
                                                        className="cursor-pointer px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        )) : (
                            <div className="p-4 border rounded-md shadow-sm relative">
                                <span className="text-sm text-gray-400">No comments yet.</span>
                            </div>
                        )
                    }
                </div>
            </div>

        </div >
    )
}

export default CommentSection