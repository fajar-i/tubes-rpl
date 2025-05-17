<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index()
    {
        $user_id = auth()->user()->id;
        $questions = Question::where("user_id", $user_id)->with('options')->get();
        return response()->json([
            "status" => true,
            "question" => $questions
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            "text" => "required",
        ]);

        $data["user_id"] = auth()->user()->id;
        Question::create($data);
        return response()->json([
            "status" => true,
            "message" => "question created succesfully"
        ]);
    }

    public function show(Question $question)
    {
        $question = $question->with('options')->get();
        return response()->json([
            "status" => true,
            "message" => "question data found",
            "question" => $question
        ]);
    }

    public function update(Request $request, Question $question)
    {
        $request->validate([
            "text" => "required"
        ]);
        $data["text"]=isset($request->text) ? $request->text : $question->text;

        $question->update($data);
        return response()->json([
            "status" => true,
            "message" => "question updated succesfully"
        ]);
    }

    public function destroy(Question $question)
    {
        $question->delete();
        return response()->json([
            "status" => true,
            "message" => "question deleted succesfully"
        ]);
    }
}
