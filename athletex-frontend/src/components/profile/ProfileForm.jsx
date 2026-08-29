import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiUser, FiPhone, FiTarget, FiActivity, FiCalendar, FiMaximize2, FiMapPin, FiMap, FiGlobe, FiCheck } from "react-icons/fi";
import { FaWeightHanging } from "react-icons/fa";
import { BiImageAdd } from "react-icons/bi";

const InputField = ({ label, name, value, onChange, icon: Icon, type = "text", placeholder }) => (
  <div className="relative group">
    <label className="absolute -top-2.5 left-4 px-1 bg-[#161A20] text-xs font-semibold text-gray-400 group-focus-within:text-brand-peach transition-colors z-10">
      {label}
    </label>
    <div className="relative flex items-center">
      <div className="absolute left-4 text-gray-500 group-focus-within:text-brand-peach transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 focus:ring-1 focus:ring-brand-peach/50 transition-all"
      />
    </div>
  </div>
);

export default function ProfileForm() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "", phone: "", sport: "", position: "", age: "", gender: "", height: "", weight: "", city: "", state: "", country: "", bio: "", profileImage: ""
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/users/profile/${user.id}`, formData);
      setSuccess(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => {
        navigate("/profile");
      }, 1200);
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to update profile.");
      setIsSubmitting(false);
    }
  };

  const SectionTitle = ({ title }) => (
    <div className="col-span-full flex items-center gap-3 mt-6 mb-2">
      <div className="h-px bg-white/10 flex-1"></div>
      <h3 className="text-gray-400 font-semibold uppercase tracking-widest text-xs">{title}</h3>
      <div className="h-px bg-white/10 flex-1"></div>
    </div>
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="bg-[#161A20]/80 backdrop-blur-xl rounded-3xl border border-white/5 p-8 md:p-10 shadow-2xl relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-peach/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="grid md:grid-cols-2 gap-6 relative z-10">
        
        <SectionTitle title="Personal Information" />
        <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} icon={FiUser} placeholder="John Doe" />
        <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} icon={FiPhone} placeholder="+1 234 567 890" />
        <InputField label="Gender" name="gender" value={formData.gender} onChange={handleChange} icon={FiUser} placeholder="Male / Female / Other" />
        <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleChange} icon={FiCalendar} placeholder="22" />
        
        <SectionTitle title="Sports Information" />
        <InputField label="Sport" name="sport" value={formData.sport} onChange={handleChange} icon={FiTarget} placeholder="Soccer" />
        <InputField label="Position" name="position" value={formData.position} onChange={handleChange} icon={FiActivity} placeholder="Striker" />
        
        <SectionTitle title="Physical Information" />
        <InputField label="Height" name="height" value={formData.height} onChange={handleChange} icon={FiMaximize2} placeholder="6'1&quot; or 185cm" />
        <InputField label="Weight" name="weight" value={formData.weight} onChange={handleChange} icon={FaWeightHanging} placeholder="175 lbs or 80kg" />
        
        <SectionTitle title="Location" />
        <InputField label="City" name="city" value={formData.city} onChange={handleChange} icon={FiMapPin} placeholder="Los Angeles" />
        <InputField label="State / Province" name="state" value={formData.state} onChange={handleChange} icon={FiMap} placeholder="California" />
        <InputField label="Country" name="country" value={formData.country} onChange={handleChange} icon={FiGlobe} placeholder="USA" />
        
        <SectionTitle title="Media & Biography" />
        <InputField label="Profile Image URL" name="profileImage" value={formData.profileImage} onChange={handleChange} icon={BiImageAdd} placeholder="https://example.com/image.jpg" />
        
        <div className="col-span-full relative group mt-2">
          <label className="absolute -top-2.5 left-4 px-1 bg-[#161A20] text-xs font-semibold text-gray-400 group-focus-within:text-brand-peach transition-colors z-10">
            Biography
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about your career, achievements, and goals..."
            className="w-full bg-transparent border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 focus:ring-1 focus:ring-brand-peach/50 transition-all h-32 resize-none"
          />
        </div>

        <div className="col-span-full flex flex-col sm:flex-row justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="px-8 py-4 rounded-xl font-bold text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            Cancel
          </button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || success}
            className={`px-10 py-4 rounded-xl font-bold text-[#0F1115] transition-all flex items-center justify-center min-w-[200px] ${
              success ? "bg-emerald-400" : "bg-brand-peach hover:bg-brand-peach/90 shadow-[0_0_20px_rgba(244,162,97,0.3)]"
            }`}
          >
            {success ? (
              <span className="flex items-center gap-2"><FiCheck size={20} /> Saved Successfully</span>
            ) : isSubmitting ? (
              <div className="w-6 h-6 border-2 border-[#0F1115]/30 border-t-[#0F1115] rounded-full animate-spin"></div>
            ) : (
              "Save Profile Changes"
            )}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}