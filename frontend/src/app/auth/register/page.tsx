import RegistrationForm from '@/components/auth/RegistrationForm';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-center">
                        Join Theme Park Planner
                    </h2>
                </div>
                <RegistrationForm />
            </div>
        </div>
    );
}