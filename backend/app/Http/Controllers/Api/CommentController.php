<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\comments\RequestComment;
use App\Http\Requests\comments\RequestCommentUpdate;
use App\Models\Comment;
use App\Services\ResponseService;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public $response;

    public function __construct(ResponseService $response)
    {
        $this->response = $response;
    }

    public function index()
    {
        try {
            $comments = Comment::with('user')->latest()->get();

            return $this->response->successMessage(
                ['data' => $comments],
                message: 'Comments fetched Successfully',
                code: 201
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: "error in comment" . $err->getMessage(),
                code: 500
            );
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RequestComment $request)
    {
        try {
            $payload = $request->validated();
            $payload['user_id'] = Auth::id();

            $comment = Comment::create($payload);

            return $this->response->successMessage(
                ['data' => $comment->load('user')],
                message: 'Comment added successfully',
                code: 201
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: "error in comment" . $err->getMessage(),
                code: 500
            );
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Comment $comment)
    {
        try {
            $comment->load('user');

            return $this->response->successMessage(
                ['data' => $comment],
                message: 'Comment fetched successfully',
                code: 200
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: "Error fetching comment: " . $err->getMessage(),
                code: 500
            );
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RequestCommentUpdate $request, string $id)
    {
        try {
            $payload = $request->validated();

            $payload['user_id'] = Auth::id();

            Comment::where('id', $id)->update($payload);

            return $this->response->successMessage(
                message: 'Comment Updated Successfully',
                code: 201
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: "error in comment" . $err->getMessage(),
                code: 500
            );
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comment $comment)
    {


        try {
            if (Auth::id() !== $comment->user_id) {
                return $this->response->errorMessage(
                    message: 'Unauthorized to delete this comment',
                    code: 403
                );
            }

            $comment->delete();

            return $this->response->successMessage(
                message: 'Comment deleted Successfully',
                code: 201
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: "error in comment" . $err->getMessage(),
                code: 500
            );
        }
    }

    public function getCommentsByPost($postId)
    {
        try {
            $comments = Comment::with('user')
                ->where('post_id', $postId)
                ->latest()
                ->get();

            return $this->response->successMessage(
                ['data' => $comments],
                message: 'Comments for the post fetched successfully',
                code: 200
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: "Error fetching comments: " . $err->getMessage(),
                code: 500
            );
        }
    }
}
