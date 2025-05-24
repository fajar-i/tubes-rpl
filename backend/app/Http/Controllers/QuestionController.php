<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function indexByProject(Project $project)
    {
        $questions = $project->questions()->with('options')->get();
        return response()->json([
            "status" => true,
            "questions" => $questions
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $data = $request->validate([
            "text" => "required",
        ]);
        $data['project_id'] = $project->id;
        $question = Question::create($data);

        $data = $request->validate([
            'options' => 'array',
            'options.*.text' => 'required|string'
        ]);
        if (!empty($data['options'])) {
            foreach ($data['options'] as $option) {
                $question->options()->create(['text' => $option['text']]);
            }
        }
        return response()->json([
            "status" => true,
            "message" => "question created succesfully",
            "questions" => $question->load('options')
        ]);
    }

    // public function show(Question $question)
    // {
    //     $question = $question->with('options')->get();
    //     return response()->json([
    //         "status" => true,
    //         "message" => "question data found",
    //         "question" => $question
    //     ]);
    // }

    public function update(Request $request, Question $question)
    {
        $request->validate([
            "text" => "required"
        ]);
        $data["text"] = isset($request->text) ? $request->text : $question->text;

        $question->update($data);
        return response()->json([
            "status" => true,
            "message" => "question updated succesfully",
            "question" => $question->load('options')
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
