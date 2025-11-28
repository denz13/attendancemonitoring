<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class teacher_account extends Authenticatable
{
    use Notifiable;

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
