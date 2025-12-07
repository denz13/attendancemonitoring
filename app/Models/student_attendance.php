<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class student_attendance extends Model
{
    use SoftDeletes;
    protected $table = 'student_attendance';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'student_account_id',
        'student_subject_enrolled_id',
        'workstate',
        'timestamp',
        'status',
    ];
}
