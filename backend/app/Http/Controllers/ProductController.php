<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use PhpParser\Node\Stmt\TryCatch;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user_id = auth()->user()->id;
        $products = Product::where("user_id", $user_id)->get()->map(function($product){
            $product->banner_image = $product->banner_image ? asset("storage/" . $product->banner_image) : null;
            return $product;
        });
        return response()->json([
            "status" => true,
            "product" => $products
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            "title" => "required",
        ]);

        $data["description"] = $request->description;
        $data["cost"] = $request->cost;


        $data["user_id"] = auth()->user()->id;
        if($request->hasFile("banner_image")){
            $data["banner_image"] = $request->file("banner_image")->store("products", "public");
        }


        Product::create($data);
        return response()->json([
            "status" => true,
            "message" => "product created succesfully"
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json([
            "status" => true,
            "message" => "product data found",
            "product" => $product
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            "title" => "required"
        ]);

        $data["description"]=isset($request->description) ? $request->description : $product->description;
        $data["cost"]=isset($request->cost) ? $request->cost : $product->cost;
        $data["title"]=isset($request->title) ? $request->title : $product->title;

        if($request->hasFile("banner_image")){
            if($product->banner_image){
                Storage::disk("public")->delete($product->banner_image);
            }
            $data["banner_image"] = $request->file("banner_image")->store("products", "public");
        }

        $product->update($data);
        return response()->json([
            "status" => true,
            "message" => "product updated succesfully"
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json([
            "status" => true,
            "message" => "product deleted succesfully"
        ]);
    }
}
