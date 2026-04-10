import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-center">
                        Welcome Back to Theme Park Planner
                    </h2>
                </div>

                <LoginForm />
            </div>
        </div>
    );
}