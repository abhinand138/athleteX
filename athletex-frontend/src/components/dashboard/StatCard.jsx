export default function StatCard({ title, value }) {
  return (
    <div className="bg-[#111317] rounded-xl p-6 border border-white/5">
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <h1 className="text-4xl text-white font-bold mt-3">
        {value}
      </h1>
    </div>
  );
}