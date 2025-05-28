<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])
        ->name('auth.register');
    Route::post('login',    [AuthController::class, 'login']);


    Route::middleware('auth:sanctum')->group(function () {
        Route::get('profile', [AuthController::class, 'profile']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('change-Fpassword', [AuthController::class, 'changePassword']);

        // post
        Route::apiResource('post', PostController::class)->except(['index', 'show']);
        Route::apiResource('tag', TagController::class)->except(['index', 'show']);
    });

    Route::apiResource('post', PostController::class)->only(['index', 'show']);
    Route::apiResource('tag', TagController::class)->only(['index', 'show']);
});
