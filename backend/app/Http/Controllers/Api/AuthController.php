<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePassword;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Services\ResponseService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    protected $response;

    public function __construct(ResponseService $response)
    {
        $this->response = $response;
    }

    public function register(RegisterRequest $request)
    {
        $payload =  $request->validated();

        try {

            $payload['password'] = Hash::make($payload['password']);
            $user = User::create($payload);

            return $this->response->successMessage(
                data: ['user' => $user,],
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

    public function profile()
    {
        $user = Auth::user();

        if (!$user) {
            return $this->response->errorMessage(
                message: 'Unauthorized.',
                code: 401
            );
        }

        return $this->response->successMessage(
            data: ['user' => $user],
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
}
