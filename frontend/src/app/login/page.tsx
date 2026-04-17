import LoginForm from '@/forms/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center">Welcome!</h2>
          <p>Login or sign up to start planning today</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
