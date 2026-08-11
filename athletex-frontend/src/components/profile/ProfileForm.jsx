import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function ProfileForm() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    sport: "",
    position: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    city: "",
    state: "",
    country: "",
    bio: "",
    profileImage: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {

    try {

      const response = await api.get(`/users/profile/${user.id}`);

      setFormData(response.data);

    } catch (err) {

      console.log(err);

    }

  };

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await api.put(`/users/profile/${user.id}`, formData);

      alert("Profile Updated Successfully");

      navigate("/profile");

    } catch (err) {

      console.log(err);

      alert("Update Failed");

    }

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="bg-[#111317] rounded-2xl border border-white/5 p-8 grid md:grid-cols-2 gap-6"
    >

      <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="p-3 rounded bg-[#1A1D23] text-white" />

      <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="p-3 rounded bg-[#1A1D23] text-white" />

      <input name="sport" value={formData.sport} onChange={handleChange} placeholder="Sport" className="p-3 rounded bg-[#1A1D23] text-white" />

      <input name="position" value={formData.position} onChange={handleChange} placeholder="Position" className="p-3 rounded bg-[#1A1D23] text-white" />

      <input name="age" value={formData.age} onChange={handleChange} placeholder="Age" className="p-3 rounded bg-[#1A1D23] text-white" />

      <input name="gender" value={formData.gender} onChange={handleChange} placeholder="Gender" className="p-3 rounded bg-[#1A1D23] text-white" />

      <input name="height" value={formData.height} onChange={handleChange} placeholder="Height" className="p-3 rounded bg-[#1A1D23] text-white" />

      <input name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight" className="p-3 rounded bg-[#1A1D23] text-white" />

      <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="p-3 rounded bg-[#1A1D23] text-white" />

      <input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="p-3 rounded bg-[#1A1D23] text-white" />

      <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="p-3 rounded bg-[#1A1D23] text-white" />

      <textarea
        name="bio"
        value={formData.bio}
        onChange={handleChange}
        placeholder="Bio"
        className="md:col-span-2 p-3 rounded bg-[#1A1D23] text-white h-32"
      />

      <button
        className="md:col-span-2 bg-brand-peach text-black py-3 rounded-xl font-bold hover:scale-[1.02] transition"
      >
        Save Changes
      </button>

    </form>

  );

}