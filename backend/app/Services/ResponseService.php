<?php

namespace App\Services;

class ResponseService
{
    public function successMessage($data = [], $message = 'Success', $code = 200, $token = null)
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'token' => isset($token) ? $token : null,
        ], $code);
    }
    public function errorMessage($message = 'Error', $code = 500)
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], $code);
    }
}
