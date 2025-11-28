<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class student_account extends Model
{
    //
    protected $table = 'student_account';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'student_id',
        'fullname',
        'year_level',
        'section',
        'password',
        'image',
        'status',
    ];
}
