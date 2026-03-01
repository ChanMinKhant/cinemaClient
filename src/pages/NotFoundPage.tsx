import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-400 px-4">
      <h1 className="text-[8rem] font-bold mb-4">404</h1>
      <h2 className="text-3xl md:text-4xl font-semibold mb-2">Page Not Found</h2>
      <p className="mb-8 text-lg md:text-xl opacity-80 text-center">
        The page you are looking for does not exist.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => navigate("/booking")}
          className="px-6 py-3 bg-blue-600 text-black font-semibold rounded-md hover:bg-blue-700 transition"
        >
          Go to Booking
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 border border-yellow-400 text-yellow-400 font-semibold rounded-md hover:bg-yellow-400 hover:text-black transition"
        >
          Go to Login
        </button>
      </div>

      {/* Optional small accent graphic */}
      <div className="mt-12 w-24 h-1 bg-blue-600 rounded-full animate-pulse"></div>
    </div>
  );
}