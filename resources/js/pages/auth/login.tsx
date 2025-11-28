import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAppearance } from '@/hooks/use-appearance';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { GraduationCap, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const { updateAppearance } = useAppearance();
    const [userType, setUserType] = useState<'admin' | 'student' | 'teacher'>('admin');

    useEffect(() => {
        updateAppearance('light');
    }, [updateAppearance]);

    const getUsernameLabel = () => {
        switch (userType) {
            case 'student':
                return 'Student ID';
            case 'teacher':
                return 'Email address';
            case 'admin':
            default:
                return 'Email address';
        }
    };

    const getUsernamePlaceholder = () => {
        switch (userType) {
            case 'student':
                return 'Enter your student ID';
            case 'teacher':
                return 'email@example.com';
            case 'admin':
            default:
                return 'email@example.com';
        }
    };

    const getUsernameType = () => {
        return userType === 'student' ? 'text' : 'email';
    };

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <input type="hidden" name="user_type" value={userType} />

                            <div className="grid gap-2">
                                <Label htmlFor="email">{getUsernameLabel()}</Label>
                                <Input
                                    id="email"
                                    type={getUsernameType()}
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete={userType === 'student' ? 'username' : 'email'}
                                    placeholder={getUsernamePlaceholder()}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                <TextLink
                                    href={request()}
                                    className="ml-auto text-sm"
                                    tabIndex={3}
                                >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Login as
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-6">
                            <button
                                type="button"
                                onClick={() => setUserType('student')}
                                className={`flex flex-col items-center gap-2 rounded-lg p-4 transition-all ${
                                    userType === 'student'
                                        ? 'bg-primary/10 ring-2 ring-primary'
                                        : 'hover:bg-muted'
                                }`}
                            >
                                <div
                                    className={`rounded-full p-3 ${
                                        userType === 'student'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <span className="text-sm font-medium">Student</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setUserType('teacher')}
                                className={`flex flex-col items-center gap-2 rounded-lg p-4 transition-all ${
                                    userType === 'teacher'
                                        ? 'bg-primary/10 ring-2 ring-primary'
                                        : 'hover:bg-muted'
                                }`}
                            >
                                <div
                                    className={`rounded-full p-3 ${
                                        userType === 'teacher'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <User className="h-6 w-6" />
                                </div>
                                <span className="text-sm font-medium">Teacher</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setUserType('admin')}
                                className={`flex flex-col items-center gap-2 rounded-lg p-4 transition-all ${
                                    userType === 'admin'
                                        ? 'bg-primary/10 ring-2 ring-primary'
                                        : 'hover:bg-muted'
                                }`}
                            >
                                <div
                                    className={`rounded-full p-3 ${
                                        userType === 'admin'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <Shield className="h-6 w-6" />
                                </div>
                                <span className="text-sm font-medium">Admin</span>
                            </button>
                        </div>

                        {/* {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={6}>
                                    Sign up
                                </TextLink>
                            </div>
                        )} */}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
