<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['text', 'project_id', 'content', 'bloom_taxonomy'];
    protected $hidden = [
        'project_id',
        'user_id'
    ];
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
    public function options()
    {
        return $this->hasMany(Option::class);
    }
}
