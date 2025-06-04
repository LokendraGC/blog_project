<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePassword;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfile;
use App\Models\User;
use App\Services\ResponseService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravolt\Avatar\Avatar;

class AuthController extends Controller
{
    protected $response;

    public function __construct(ResponseService $response)
    {
        $this->response = $response;
    }

    public function register(RegisterRequest $request, Avatar $avatarGenerator)
    {
        $payload = $request->validated();

        try {
            // Hash password
            $payload['password'] = Hash::make($payload['password']);

            // Create the user
            $user = User::create($payload);

            // In your registration controller
            if ($request->hasFile('avatar')) {
                $uploaded = $request->file('avatar')->store('avatars', 'public');
                $user->avatar = basename($uploaded);
            } else {
                // Generate smaller base64 avatar
                $avatar = $avatarGenerator->create($payload['name'])
                    ->setDimension(100, 100)
                    ->toBase64();

                $user->avatar = $avatar;
            }
            $user->save();

            return $this->response->successMessage(
                data: ['user' => $user],
                message: 'User registered successfully.',
                code: 201
            );
        } catch (\Exception $e) {
            return $this->response->errorMessage(
                message: 'Registration failed: ' . $e->getMessage(),
                code: 500
            );
        }
    }



    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return $this->response->errorMessage(
                message: 'Invalid credentials.',
                code: 401
            );
        }

        $token = $user->createToken('myToken')->plainTextToken;

        return $this->response->successMessage(
            data: ['user' => $user],
            message: 'Login successful.',
            code: 200,
            token: $token
        );
    }


    public function profile(Avatar $avatarGenerator) // Inject the service
    {
        $user = Auth::user();

        if (!$user) {
            return $this->response->errorMessage(
                message: 'Unauthorized.',
                code: 401
            );
        }

        $user->load('savedPosts');

        // Use the injected instance
        $avatarUrl = $user->avatar ?? $avatarGenerator->create($user->name)->toBase64();

        return $this->response->successMessage(
            data: [
                'user' => $user,
                'saved_posts' => $user->savedPosts,
                'avatar' => $avatarUrl
            ],
            message: 'User profile retrieved successfully.',
            code: 200
        );
    }


    public function logout()
    {

        $user = Auth::user();
        if (!$user) {
            return $this->response->errorMessage(
                message: 'Unauthorized.',
                code: 401
            );
        }

        // Revoke the user's token
        $user->tokens()->delete();

        return $this->response->successMessage(
            message: 'User logged out successfully.',
            code: 200
        );
    }

    public function changePassword(ChangePassword $request)
    {

        try {
            $data = $request->validated();

            $user = Auth::user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            if (!Hash::check($data['current_password'], $user->password)) {
                return response()->json(['error' => 'Current password incorrect'], 400);
            }

            $user->password = Hash::make($data['new_password']);
            $user->save();

            return response()->json(['message' => 'Password changed successfully'], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ], 500);
        }
    }

    public function updateProfile(UpdateProfile $request)
    {
        $user = Auth::user();

        if (!$user) {
            return $this->response->errorMessage(
                message: 'Unauthorized.',
                code: 401
            );
        }

        try {
            $data = $request->validated();

            // Handle avatar upload if present
            if ($request->hasFile('avatar')) {
                // Delete old avatar if exists
                if ($user->avatar) {
                    Storage::delete('public/avatars/' . basename($user->avatar));
                }

                // Store new avatar
                // $avatarPath = $request->file('avatar')->store('public/avatars');
                // $data['avatar'] = Storage::url($avatarPath);

                $uploaded = $request->file('avatar')->store('avatars', 'public');
                $data['avatar'] = basename($uploaded);
            }

            // Update user data
            $user->update($data);

            return $this->response->successMessage(
                data: [
                    'user' => $user,
                    'avatar' => $user->avatar
                ],
                message: 'Profile updated successfully.',
                code: 200
            );
        } catch (\Exception $e) {
            return $this->response->errorMessage(
                message: 'Failed to update profile: ' . $e->getMessage(),
                code: 500
            );
        }
    }
}
