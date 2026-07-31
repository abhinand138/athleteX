export default function RecentActivity() {
  return (
    <div className="bg-[#111317] rounded-xl p-6 border border-white/5">
      <h2 className="text-xl text-white font-semibold mb-4">
        Recent Activity
      </h2>

      <ul className="space-y-3 text-gray-300">
        <li>🏃 Performance updated</li>
        <li>🏅 Achievement unlocked</li>
        <li>👨‍🏫 Coach reviewed your profile</li>
      </ul>
    </div>
  );
}