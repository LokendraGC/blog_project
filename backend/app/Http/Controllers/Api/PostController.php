<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostUpdate;
use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use App\Services\ResponseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{

    public $response;

    public function __construct(ResponseService $response)
    {
        $this->response = $response;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $posts = Post::with(['user', 'tags'])->get();

            return $this->response->successMessage(
                ['data' => $posts],
                message: 'Posts retrieved successfully',
                code: 200
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: 'Error retrieving posts' . $err->getMessage(),
                code: 501
            );
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostRequest $request)
    {
        try {
            $data = $request->validated();

            $data['user_id'] = Auth::id();

            if ($request->hasFile('feature_image')) {
                $data['feature_image'] = $request->file('feature_image')->store("post_images/{$data['user_id']}", 'public');
            }

            $post = Post::create($data);

            if (isset($data['tags']) && is_array($data['tags'])) {
                $post->tags()->attach($data['tags']);
            }

            return $this->response->successMessage(
                [
                    'data' => $data
                ],
                message: 'Post Created Successfully',
                code: 200
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: 'Post cannot be created: ' . $err->getMessage(),
                code: 500
            );
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {


            $post = Post::with(['user', 'tags'])->find($id);

            if (!$post) {
                return $this->response->errorMessage(
                    message: 'Post not found',
                    code: 404
                );
            }

            return $this->response->successMessage(
                ['data' => $post],
                message: 'Post retrieved successfully',
                code: 200
            );
        } catch (\Exception $err) {
            return $this->response->successMessage(
                message: 'Error retrieving post' . $err->getMessage(),
                code: 501
            );
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PostUpdate $request, Post $post)
    {
        $payload = $request->validated();

        try {
            // Handle file upload if exists
            if ($request->hasFile('feature_image')) {
                // Delete old image
                if ($post->feature_image && Storage::disk('public')->exists($post->feature_image)) {
                    Storage::disk('public')->delete($post->feature_image);
                }

                // Store new image
                $payload['feature_image'] = $request->file('feature_image')
                    ->store("post_images/{$post->user_id}", 'public');
            }

            // Extract tags from payload
            $tags = $payload['tags'] ?? [];
            unset($payload['tags']);

            $post->update($payload);

            if (!empty($tags) && is_array($tags)) {
                $post->tags()->sync($tags);
            }

            return $this->response->successMessage(
                ['data' => $post],
                message: 'Post updated successfully',
                code: 200
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: 'Post cannot be updated: ' . $err->getMessage(),
                code: 500
            );
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        try {
            $user = Auth::user();

            if ($user->id != $post->user_id) {
                return $this->response->errorMessage(
                    message: 'You cannot delete this post',
                    code: 501
                );
            }

            if ($post->feature_image && Storage::disk('public')->exists($post->feature_image)) {
                Storage::disk('public')->delete($post->feature_image);
            }

            $post->delete();

            return $this->response->successMessage(
                message: 'Post deleted successfully',
                code: 201
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: "Error while deleting post " . $err->getMessage(),
                code: 500
            );
        }
    }
}
