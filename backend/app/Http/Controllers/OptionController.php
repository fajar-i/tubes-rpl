<?php

namespace App\Http\Controllers;

use App\Models\Options;
use Illuminate\Http\Request;

class OptionController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            "question_id" => "required|exists:questions,id",
            "text" => "string|required"
        ]);

        Options::create($data);
        return response()->json([
            "status" => true,
            "message" => "option created succesfully"
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            "text" => "required"
        ]);
        $option = Options::findOrFail($id);
        $option->update(['text' => $request->input('text')]);
        return response()->json([
            "status" => true,
            "message" => "question updated succesfully"
        ]);
    }

    public function destroy(Options $options)
    {
        $options->delete();
        return response()->json([
            "status" => true,
            "message" => "options deleted succesfully"
        ]);
    }
}
