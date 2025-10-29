import Link from "next/link";
import { Target, TrendingUp, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <h1 className="text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 bg-clip-text text-transparent">
            RUNOVA
          </h1>
          <p className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
            Your AI-Powered Running Coach
          </p>
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto font-medium">
            Get personalized training plans tailored to your goals, track your progress,
            and achieve your running potential with AI-powered guidance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="group px-12 py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-black text-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-12 py-5 bg-white text-gray-900 rounded-xl font-black text-xl border-2 border-gray-300 hover:border-orange-500 hover:shadow-xl transition-all duration-300 hover:scale-105 transform"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 transform cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              Personalized Plans
            </h3>
            <p className="text-gray-700 font-medium">
              AI-generated training plans based on your goals and schedule
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 transform cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              Track Progress
            </h3>
            <p className="text-gray-700 font-medium">
              Log your workouts and monitor your improvement over time
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 transform cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              Adaptive Training
            </h3>
            <p className="text-gray-700 font-medium">
              Plans adjust based on your progress and feedback
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
