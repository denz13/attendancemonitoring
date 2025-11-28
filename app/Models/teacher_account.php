<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class teacher_account extends Model
{
    //
    protected $table = 'teacher_account';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'fullname',
        'email',
        'password',
        'image',
        'status',
    ];
}
