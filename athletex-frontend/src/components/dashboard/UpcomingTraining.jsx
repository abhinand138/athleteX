export default function UpcomingTraining() {
  return (
    <div className="bg-[#111317] rounded-2xl border border-white/5 p-6">

      <h2 className="text-white text-xl font-bold mb-5">
        Upcoming Training
      </h2>

      <div className="space-y-4">

        <div>
          <p className="text-white">
            Sprint Practice
          </p>

          <span className="text-gray-400">
            Today • 6:00 PM
          </span>
        </div>

        <div>
          <p className="text-white">
            Strength Training
          </p>

          <span className="text-gray-400">
            Tomorrow • 8:00 AM
          </span>
        </div>

      </div>

    </div>
  );
}