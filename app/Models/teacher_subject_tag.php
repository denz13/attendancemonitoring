<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class teacher_subject_tag extends Model
{
    //
    protected $table = 'teacher_subject_tag';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'teacher_id',
        'subject_id',
        'status',
    ];
    public function teacher()
    {
        return $this->belongsTo(teacher_account::class, 'teacher_id');
    }
    public function subject()
    {
        return $this->belongsTo(subject::class, 'subject_id');
    }
}
