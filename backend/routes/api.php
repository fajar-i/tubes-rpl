<?php

use App\Http\Controllers\AnswerController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\QuestionController;

Route::post('register',  [AuthController::class, "register"]);
Route::post('login',  [AuthController::class, "login"]);

Route::middleware(['api', 'auth:sanctum'])->group(
    function () {
        Route::get('profile',  [AuthController::class, "profile"]);
        Route::get('logout',  [AuthController::class, "logout"]);
        Route::get('/projects/{project}/questions', [QuestionController::class, 'indexByProject']);
        Route::post('/projects/{project}/questions', [QuestionController::class, 'store']);
        Route::get('/projects/{project}/answers', [AnswerController::class, 'getJawaban']);
        Route::post('/projects/{project}/answers', [AnswerController::class, 'simpanJawaban']);
        Route::put('/rightOption/{option}', [OptionController::class, 'setIsRight']);
        Route::apiResource("projects", ProjectController::class);
        Route::apiResource("questions", QuestionController::class);
        Route::apiResource("options", OptionController::class);
    }
);
