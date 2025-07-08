<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostUpdate;
use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use App\Services\ResponseService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

use function Laravel\Prompts\error;

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
            $posts = Post::with(['user', 'tags'])->latest()->get();

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
    public function show(string $slug)
    {
        $post = Post::with(['user', 'tags'])->where('slug', $slug)->first();

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
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(PostUpdate $request, Post $post)
    {
        $payload = $request->validated();

        try {
            // Handle image removal if flag is set
            if ($request->input('remove_feature_image') === 'true') {
                // Delete old image if it exists
                if ($post->feature_image && Storage::disk('public')->exists($post->feature_image)) {
                    Storage::disk('public')->delete($post->feature_image);
                }
                $payload['feature_image'] = null; // Set to null in database
            }
            // Handle new file upload if exists
            elseif ($request->hasFile('feature_image')) {
                // Delete old image if it exists
                if ($post->feature_image && Storage::disk('public')->exists($post->feature_image)) {
                    Storage::disk('public')->delete($post->feature_image);
                }

                // Store new image
                $payload['feature_image'] = $request->file('feature_image')
                    ->store("post_images/{$post->user_id}", 'public');
            }

            // Preserve existing title if no new title is provided
            if (!isset($payload['title'])) {
                $payload['title'] = $post->title; // Fallback to current title
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

    public function savePost($postId)
    {
        try {
            $post = Post::findOrFail($postId); // throws 404 if not found

            $user = Auth::user();

            // Check if already saved to prevent duplicates
            if (!$user->savedPosts()->where('post_id', $postId)->exists()) {
                $user->savedPosts()->attach($postId);
            }

            return response()->json(['message' => 'Post saved']);
        } catch (\Exception $err) {
            return response()->json([
                'message' => "Error saving post: " . $err->getMessage()
            ], 500);
        }
    }

    public function unsavePost($postId)
    {
        try {
            $post = Post::findOrFail($postId);

            $user = Auth::user();
            $user->savedPosts()->detach($postId);

            return response()->json(['message' => 'Post unsaved']);
        } catch (\Exception $err) {
            return response()->json([
                'message' => 'Error unsaving post: ' . $err->getMessage()
            ], 500);
        }
    }

    // is saved post
    // Add a new endpoint to get all saved post IDs at once
    public function getSavedPosts()
    {
        try {
            $user = Auth::user();
            $savedPostIds = $user->savedPosts()->pluck('post_id')->toArray();
            // $savedPostIds = $user->savedPosts()
            //     ->orderBy('created_at', 'desc')
            //     ->pluck('id')
            //     ->toArray();

            return response()->json([
                'savedPostIds' => $savedPostIds
            ]);
        } catch (\Exception $err) {
            return response()->json([
                'message' => 'Error fetching saved posts: ' . $err->getMessage()
            ], 500);
        }
    }


    public function like(Post $post)
    {
        $user = Auth::user();

        // Attach the like if not already liked
        $user->likedPosts()->syncWithoutDetaching([$post->id]);

        $post->loadCount('likedByUsers');

        // Return the updated like count
        return response()->json([
            'message' => 'Post liked',
            'like_count' => $post->likes_count // Using our accessor
        ]);
    }

    public function unlike(Post $post)
    {
        $user = Auth::user();
        $user->likedPosts()->detach($post->id);

        $post->loadCount('likedByUsers');

        return response()->json([
            'message' => 'Post unliked',
            'like_count' => $post->likes_count // Using our accessor
        ]);
    }


    public function getLikedPosts()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // $liked_posts = $user->likedPosts()->pluck('id');
        $liked_posts = $user->likedPosts()->pluck('post_id')->toArray();


        return response()->json([
            'likedPostIds' => $liked_posts,
            'message' => 'Liked posts retrieved successfully'
        ]);
    }

    public function getCreatedPost()
    {
        $user = Auth::user();
        // $posts = Post::where('user_id', $user->id)->get();

        $posts = Post::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        try {

            if ($posts) {
                return $this->response->successMessage(
                    ['data' => $posts],
                    message: 'Posts retrieved successfully',
                    code: 200
                );
            }
        } catch (\Exception $err) {
            return response()->json([
                'message' => 'Error while getting created post: ' . $err->getMessage()
            ], 500);
        }
    }
}
