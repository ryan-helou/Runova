import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-green-50">
      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="mb-8">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-6">
            Runova
          </h1>
          <p className="text-2xl font-semibold text-gray-800 mb-4">
            Your AI-Powered Running Coach
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Get personalized training plans tailored to your goals, track your progress,
            and achieve your running potential with AI-powered guidance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
          <Link
            href="/signup"
            className="px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-10 py-4 bg-white text-green-700 rounded-xl font-bold text-lg border-2 border-green-600 hover:bg-green-50 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Sign In
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-300 transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-3xl mb-4 mx-auto">
              🎯
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Personalized Plans
            </h3>
            <p className="text-gray-600 leading-relaxed">
              AI-generated training plans based on your experience, goals, and schedule
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-300 transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-3xl mb-4 mx-auto">
              📊
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Track Progress
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Log your workouts and monitor your improvement over time
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-100 hover:border-amber-300 transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-3xl mb-4 mx-auto">
              🔄
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Adaptive Training
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Plans adjust based on your progress and feedback
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
