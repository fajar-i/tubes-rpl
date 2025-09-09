<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'user_id',
        'public_id',
        'nama_ujian',
        'mata_pelajaran',
        'kelas',
        'semester'
    ];

    protected $hidden = [
        'id',
        'user_id'
    ];

    public function getRouteKeyName()
    {
        return 'public_id';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
    public function materials()
    {
        return $this->hasMany(Material::class);
    }
}
