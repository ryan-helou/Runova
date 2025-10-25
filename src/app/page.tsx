import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Runova
        </h1>
        <p className="text-2xl text-gray-600 mb-4">
          Your AI-Powered Running Coach
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
          Get personalized training plans tailored to your goals, track your progress,
          and achieve your running potential with AI-powered guidance.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transition"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Personalized Plans
            </h3>
            <p className="text-gray-600">
              AI-generated training plans based on your experience, goals, and schedule
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Track Progress
            </h3>
            <p className="text-gray-600">
              Log your workouts and monitor your improvement over time
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Adaptive Training
            </h3>
            <p className="text-gray-600">
              Plans adjust based on your progress and feedback
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
