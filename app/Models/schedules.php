<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class schedules extends Model
{
    //
    protected $table = 'schedules';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'teacher_subject_tag_id',
        'day_name',
        'start_at',
        'end_at',
        'status',
    ];
    public function teacher_subject_tag()
    {
        return $this->belongsTo(teacher_subject_tag::class, 'teacher_subject_tag_id');
    }
}
