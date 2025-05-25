<?php

namespace App\Http\Controllers;

use App\Models\Option;
use App\Models\Question;
use Illuminate\Http\Request;

class OptionController extends Controller
{

    public function store(Request $request)
    {
        $Options = Option::where('question_id', $request->question_id)->get();
        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'text'        => 'required|string',
        ]);
        $char = 'A';
        $validated['is_right'] = true;
        foreach ($Options as $i => $option) {
            $char = chr(65 + $i + 1);
            if ($i >= 0) $validated['is_right'] = false;
        }
        $validated['option_code'] = $char;
        $option = Option::create($validated);
        return response()->json($option, 201);
    }

    public function setIsRight(Option $option)
    {
        $Options = Option::where('question_id', $option->question_id)->get();
        foreach ($Options as $opt) {
            $data['is_right'] = false;
            $opt->update($data);
        }
        $data['is_right'] = true;
        $option->update($data);
        return response()->json(($option));
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            "text" => "required",
        ]);
        $option = Option::findOrFail($id);
        $option->update($validatedData);
        return response()->json([
            "status" => true,
            "message" => "option updated succesfully",
            "option" => $option
        ]);
    }

    public function destroy(Option $option)
    {
        $option->delete();
        return response()->json([
            "status" => true,
            "message" => "option deleted succesfully"
        ]);
    }
}
