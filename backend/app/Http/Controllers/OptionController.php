<?php

namespace App\Http\Controllers;

use App\Models\Options;
use Illuminate\Http\Request;

class OptionController extends Controller
{

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'text'        => 'required|string',
        ]);

        $option = Options::create($validated);

        // Kembalikan langsung $option, bukan dibungkus
        return response()->json($option, 201);
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
            "message" => "question updated succesfully",
            "option" => $option
        ]);
    }

    public function destroy(Options $option)
    {
        $option->delete();
        return response()->json([
            "status" => true,
            "message" => "options deleted succesfully"
        ]);
    }
}
