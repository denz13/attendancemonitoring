<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class student_account extends Authenticatable
{
    use Notifiable;

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

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
