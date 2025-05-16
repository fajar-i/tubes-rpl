<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
// routes/api.php

Route::middleware(['api'])->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    // ...route lainnya
});

Route::post('register',  [AuthController::class, "register"]);
Route::post('login',  [AuthController::class, "login"]);

Route::group([
    "middleware" => ['auth:sanctum']
], function(){
    Route::get('profile',  [AuthController::class, "profile"]);
    Route::get('logout',  [AuthController::class, "logout"]);
    Route::apiResource("products", ProductController::class);
}
);
// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
