<?php

namespace App\Actions\Fortify;

use App\Models\student_account;
use App\Models\teacher_account;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;

class AuthenticateUser
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function __invoke(Request $request)
    {
        $userType = $request->input('user_type', 'admin');
        $username = $request->input(Fortify::username());
        $password = $request->input('password');

        $user = null;
        $guard = 'web';

        switch ($userType) {
            case 'student':
                $user = student_account::where('student_id', $username)->first();
                $guard = 'student';
                break;
            case 'teacher':
                $user = teacher_account::where('email', $username)->first();
                $guard = 'teacher';
                break;
            case 'admin':
            default:
                $user = User::where('email', $username)->first();
                $guard = 'web';
                break;
        }

        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        if ($user->status !== null && $user->status !== 'active' && $user->status !== 1) {
            return null;
        }

        // Store the guard in session for later use
        session(['auth_guard' => $guard]);
        
        // If not using default guard, manually log in with correct guard
        // Fortify will still try to log in with default guard, but our guard takes precedence
        if ($guard !== 'web') {
            Auth::guard($guard)->login($user, $request->boolean('remember'));
            // Log out from default guard to prevent conflicts
            Auth::guard('web')->logout();
        }

        return $user;
    }
}

