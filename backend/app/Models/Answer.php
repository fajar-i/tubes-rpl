<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    protected $table = 'answers';
    protected $fillable = [
        'project_id',
        'kode_peserta',
        'question_id',
        'jawaban_huruf',
    ];
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
