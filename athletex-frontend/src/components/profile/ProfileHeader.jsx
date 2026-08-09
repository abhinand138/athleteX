import profile from "../../assets/images/profile.jpg";

export default function ProfileHeader({ profile }) {

  return (

    <div className="bg-[#111317] rounded-2xl border border-white/5 p-8">

      <div className="flex flex-col md:flex-row items-center gap-6">

        <img
          src={profile.profileImage || profile}
          alt="Profile"
          className="w-36 h-36 rounded-full border-4 border-brand-peach object-cover"
        />

        <div>

          <h1 className="text-4xl font-bold text-white">

            {profile.fullName}

          </h1>

          <p className="text-brand-peach text-lg mt-2">

            {profile.role}

          </p>

          <p className="text-gray-400 mt-2">

            {profile.email}

          </p>

        </div>

      </div>

    </div>

  );

}