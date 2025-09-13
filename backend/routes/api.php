<?php

use App\Http\Controllers\AnswerController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\GeminiController;
use App\Http\Controllers\MaterialController;

Route::post('register',  [AuthController::class, "register"]);
Route::post('login',  [AuthController::class, "login"]);

Route::middleware(['api', 'auth:sanctum'])->group(
    function () {
        Route::get('profile',  [AuthController::class, "profile"]);
        Route::get('logout',  [AuthController::class, "logout"]);
        Route::get('/projects/{project}/questions', [QuestionController::class, 'indexByProject']);
        Route::post('/projects/{project}/questions', [QuestionController::class, 'store']);
        Route::get('/projects/{project}/materials', [MaterialController::class, 'index']);
        Route::post('/projects/{project}/materials', [MaterialController::class, 'store']);
        Route::get('/projects/{project}/answers', [AnswerController::class, 'getJawaban']);
        Route::post('/projects/{project}/answers', [AnswerController::class, 'simpanJawaban']);
        Route::put('/materials/{material}', [MaterialController::class, 'update']);
        Route::delete('/materials/{material}', [MaterialController::class, 'destroy']);
        Route::put('/rightOption/{option}', [OptionController::class, 'setIsRight']);
        Route::apiResource("projects", ProjectController::class);
        Route::apiResource("questions", QuestionController::class);
        Route::apiResource("options", OptionController::class);
        Route::get('/projects/{project}/result', [ResultController::class, 'getAnalisis']);
        Route::post('/gemini/generate', [GeminiController::class, 'generate']);
        Route::post('/question/{question}/validate', [QuestionController::class, 'validateQuestion']);
        Route::post('/questions/{question}/apply-suggestion', [QuestionController::class, 'applySuggestion']);
    }
);
