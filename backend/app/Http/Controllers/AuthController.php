<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            "name" => "required|string",
            "email" => "required|email|unique:users,email",
            "password" => "required|confirmed"
        ]);

        User::create($data);

        return response()->json([
            "status" => true,
            "message" => "User registered succesfully"
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            "email" => "required|email",
            "password" => "required"
        ]);

        if (!Auth::attempt($request->only("email", "password"))) {
            return response()->json([
                "status" => false,
                "message" => "Invalid Credentials"
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken("myToken")->plainTextToken;

        return response()->json([
            "status" => true,
            "message" => "User logged in succesfully",
            "token" => $token
        ]);
    }

    public function profile()
    {
        $user = Auth::user();
        return response()->json([
            "status" => true,
            "message" => "User profile data",
            "user" => $user
        ]);
    }

    public function logout()
    {
        Auth::logout();

        return response()->json([
            "status" => true,
            "message" => "User logged out succesfully",
        ]);
    }
}
