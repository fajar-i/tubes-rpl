<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['text', 'user_id'];
    public function options() {
        return $this->hasMany(Options::class);
    }
}
