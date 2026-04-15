import UserProfileForm from '@/components/user/UserProfileForm';

export default function UserProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center">User Profile</h2>
        </div>

        <UserProfileForm />
      </div>
    </div>
  );
}
