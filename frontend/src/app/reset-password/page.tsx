import ResetPasswordForm from '@/forms/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center">
            Reset Your Password
          </h2>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
