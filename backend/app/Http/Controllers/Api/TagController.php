<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Models\Tag;
use App\Services\ResponseService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TagController extends Controller
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
            $posts = Tag::with(['user','posts'])->get();

            return $this->response->successMessage(
                ['data' => $posts],
                message: 'Tags retrieved successfully',
                code: 200
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: 'Error retrieving tags' . $err->getMessage(),
                code: 501
            );
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTagRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();


        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store("tag_images/{$data['user_id']}", 'public');
        }
        Tag::create($data);

        return $this->response->successMessage(
            ['data' => $data],
            message: 'Tag created successfully',
            code: 201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $tag = Tag::with(['user', 'posts'])->find($id);

            if (!$tag) {
                return $this->response->errorMessage(
                    message: 'Tag not found',
                    code: 404
                );
            }

            return $this->response->successMessage(
                ['data' => $tag],
                message: 'Tag retrieved successfully',
                code: 200
            );
        } catch (\Exception $err) {
            return $this->response->successMessage(
                message: 'Error retrieving tag' . $err->getMessage(),
                code: 501
            );
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTagRequest $request, Tag $tag)
    {
        $payload = $request->validated();

        try {
            // Handle file upload if exists
            if ($request->hasFile('image')) {
                // Delete old image
                if ($tag->image && Storage::disk('public')->exists($tag->image)) {
                    Storage::disk('public')->delete($tag->image);
                }

                // Store new image
                $payload['image'] = $request->file('image')
                    ->store("tag_images/{$tag->user_id}", 'public');
            }

            $tag->update($payload);

            return $this->response->successMessage(
                ['data' => $tag],
                message: 'Tag updated successfully',
                code: 200
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: 'Tag cannot be updated: ' . $err->getMessage(),
                code: 500
            );
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag)
    {
        try {
            $user = Auth::user();

            if ($user->id != $tag->user_id) {
                return $this->response->errorMessage(
                    message: 'You cannot delete this tag',
                    code: 501
                );
            }


            if ($tag->image && Storage::disk('public')->exists($tag->image)) {
                Storage::disk('public')->delete($tag->image); // delete image
            }

            $tag->delete();

            return $this->response->successMessage(
                message: 'Tag deleted successfully',
                code: 201
            );
        } catch (\Exception $err) {
            return $this->response->errorMessage(
                message: "Error while deleting tag " . $err->getMessage(),
                code: 500
            );
        }
    }
}
