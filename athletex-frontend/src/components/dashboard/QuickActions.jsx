export default function QuickActions() {
  return (
    <div className="bg-[#111317] rounded-xl p-6 border border-white/5">
      <h2 className="text-xl text-white font-semibold mb-4">
        Quick Actions
      </h2>

      <div className="flex flex-col gap-3">
        <button className="bg-brand-peach text-black py-3 rounded-lg font-semibold">
          Update Profile
        </button>

        <button className="bg-blue-600 text-white py-3 rounded-lg font-semibold">
          View Performance
        </button>

        <button className="bg-green-600 text-white py-3 rounded-lg font-semibold">
          Training Schedule
        </button>
      </div>
    </div>
  );
}