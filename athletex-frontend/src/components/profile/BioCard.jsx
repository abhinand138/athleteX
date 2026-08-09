export default function BioCard({ profile }) {

  return (

    <div className="bg-[#111317] rounded-2xl border border-white/5 p-8">

      <h2 className="text-2xl font-bold text-white mb-6">

        Athlete Bio

      </h2>

      <p className="text-gray-300 leading-8">

        {profile.bio || "No bio added yet."}

      </p>

    </div>

  );

}