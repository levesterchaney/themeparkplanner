import UserProfileForm from '@/forms/user/UserProfileForm';

export default function UserProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">
          Account Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your profile and preferences
        </p>
      </div>

      <UserProfileForm />
    </div>
  );
}
