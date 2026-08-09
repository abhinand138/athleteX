export default function PersonalInfoCard({ profile }) {

  const Item = ({ title, value }) => (

    <div>

      <p className="text-gray-500 text-sm">

        {title}

      </p>

      <h3 className="text-white font-semibold">

        {value || "-"}

      </h3>

    </div>

  );

  return (

    <div className="bg-[#111317] rounded-2xl border border-white/5 p-8">

      <h2 className="text-2xl font-bold text-white mb-8">

        Personal Information

      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

        <Item title="Phone" value={profile.phone} />

        <Item title="Sport" value={profile.sport} />

        <Item title="Position" value={profile.position} />

        <Item title="Age" value={profile.age} />

        <Item title="Gender" value={profile.gender} />

        <Item title="Height" value={profile.height} />

        <Item title="Weight" value={profile.weight} />

        <Item title="City" value={profile.city} />

        <Item title="State" value={profile.state} />

        <Item title="Country" value={profile.country} />

      </div>

    </div>

  );

}