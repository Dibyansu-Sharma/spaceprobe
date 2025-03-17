import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to SpaceProbe
        </h1>
        <p className="text-gray-600 mb-6">
          Navigate to different sections using the links below.
        </p>
        <div className="space-y-4">
          <Link to="/dashboard" className="block w-full">
            <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded px-4 py-2 text-gray-700 hover:bg-gray-100">
              <span>View Real Time Dashboard</span>
            </button>
          </Link>

          <Link to="/mock-dashboard" className="block w-full">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View Mock Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
