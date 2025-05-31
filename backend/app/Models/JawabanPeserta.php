<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JawabanPeserta extends Model
{
    use HasFactory;

    protected $table = 'answers';
    protected $fillable = [
        'project_id',
        'question_id',
        'option_id',
    ];
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
    public function options()
    {
        return $this->hasMany(Option::class);
    }
    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
