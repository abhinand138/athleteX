import profile from "../../assets/images/profile.jpg";
export default function AthleteProfileCard() {
  return (
    <div className="bg-[#111317] rounded-2xl border border-white/5 p-6">

      <div className="flex items-center gap-4">

        <img
          src={profile}
          alt="profile"
          className="w-20 h-20 rounded-full border-2 border-brand-peach"
        />

        <div>

          <h2 className="text-white text-xl font-bold">
            Abhinand MA
          </h2>

          <p className="text-gray-400">
            Football Player
          </p>

          <span className="text-brand-peach">
            Kerala 🇮🇳
          </span>

        </div>

      </div>

    </div>
  );
}