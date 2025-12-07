<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class student_subject_enrolled extends Model
{
    //
    use SoftDeletes;
    protected $table = 'student_subject_enrolled';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'student_account_id',
        'schedules_id',
        'status',
    ];
    public function student()
    {
        return $this->belongsTo(student_account::class, 'student_account_id');
    }
    public function schedules()
    {
        return $this->belongsTo(schedules::class, 'schedules_id');
    }
}
