import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
