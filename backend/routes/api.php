    <?php

    use App\Http\Controllers\Api\AuthController;
    use App\Http\Controllers\Api\CommentController;
    use App\Http\Controllers\Api\PostController;
    use App\Http\Controllers\Api\TagController;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\Route;

    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');

    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register'])
            ->name('auth.register');


        Route::middleware('auth:sanctum')->group(function () {
            Route::get('profile', [AuthController::class, 'profile']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('change-password', [AuthController::class, 'changePassword']);
            Route::post('get-avatar', [AuthController::class, 'getAvatar']);
            Route::post('update-profile', [AuthController::class, 'updateProfile']);

            // post, comment and tag
            Route::get('get-created-post', [PostController::class, 'getCreatedPost']);
            Route::get('get-comment/{postid}', [CommentController::class, 'getCommentsByPost']);
            Route::get('get-liked-post', [PostController::class, 'getLikedPosts']);
            Route::apiResource('post', PostController::class)->except(['index', 'show']);
            Route::apiResource('comment', CommentController::class)->except(['index', 'show']);
            Route::apiResource('tag', TagController::class)->except(['index', 'show']); 
        });

        Route::apiResource('post', PostController::class)->only(['index', 'show']);
        Route::apiResource('comment', CommentController::class)->only(['index', 'show']);
        Route::apiResource('tag', TagController::class)->only(['index', 'show']);
    });


    Route::middleware('auth:sanctum')->group(function () {
        // like post
        Route::post('/post/{post}/like', [PostController::class, 'like']);
        Route::delete('/post/{post}/unlike', [PostController::class, 'unlike']);

        // save post
        Route::post('/post/{post}/save', [PostController::class, 'savePost']);
        Route::delete('/post/{post}/unsave', [PostController::class, 'unsavePost']);
        Route::get('/post/saved-posts', [PostController::class, 'getSavedPosts']);
    });
