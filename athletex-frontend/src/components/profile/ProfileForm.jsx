import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiUser, FiPhone, FiTarget, FiActivity, FiCalendar, FiMaximize2, FiMapPin, FiMap, FiGlobe, FiCheck } from "react-icons/fi";
import { FaWeightHanging } from "react-icons/fa";
import { BiImageAdd } from "react-icons/bi";
import { uploadProfilePhotoFromDevice } from "../../utils/profilePhotoUpload";
import { getErrorMessage } from "../../utils/errorHandler";
import {
  INDIAN_STATES,
  INDIAN_UNION_TERRITORIES,
  INDIAN_STATES_AND_UTS,
  COUNTRIES,
  MAJOR_INDIAN_CITIES_BY_STATE
} from "../../utils/locationData";
import {
  GENDER_OPTIONS,
  SPORTS_LIST,
  POSITIONS_BY_SPORT
} from "../../utils/sportsData";

const InputField = ({ label, name, value, onChange, icon: Icon, type = "text", placeholder, step, min, max, list }) => (
  <div className="relative group">
    <label className="absolute -top-2.5 left-4 px-1 bg-[#161A20] text-xs font-semibold text-gray-400 group-focus-within:text-brand-peach transition-colors z-10">
      {label}
    </label>
    <div className="relative flex items-center">
      <div className="absolute left-4 text-gray-500 group-focus-within:text-brand-peach transition-colors pointer-events-none">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        list={list}
        className="w-full bg-transparent border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 focus:ring-1 focus:ring-brand-peach/50 transition-all"
      />
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, icon: Icon, children }) => (
  <div className="relative group">
    <label className="absolute -top-2.5 left-4 px-1 bg-[#161A20] text-xs font-semibold text-gray-400 group-focus-within:text-brand-peach transition-colors z-10">
      {label}
    </label>
    <div className="relative flex items-center">
      <div className="absolute left-4 text-gray-500 group-focus-within:text-brand-peach transition-colors pointer-events-none">
        <Icon size={18} />
      </div>
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className="w-full bg-[#161A20] border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-white focus:outline-none focus:border-brand-peach/50 focus:ring-1 focus:ring-brand-peach/50 transition-all appearance-none cursor-pointer text-sm"
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
        ▼
      </div>
    </div>
  </div>
);

export default function ProfileForm() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customStateMode, setCustomStateMode] = useState(false);
  const [customCityMode, setCustomCityMode] = useState(false);
  const [customSportMode, setCustomSportMode] = useState(false);
  const [customPositionMode, setCustomPositionMode] = useState(false);

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
    country: "India",
    bio: "",
    profileImage: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get(`/users/profile/${user.id}`);
      const data = response.data || {};
      const countryVal = data.country && data.country.trim() ? data.country : "India";
      setFormData({
        ...data,
        country: countryVal
      });

      if (data.state && countryVal === "India" && !INDIAN_STATES_AND_UTS.includes(data.state)) {
        setCustomStateMode(true);
      } else if (countryVal !== "India") {
        setCustomStateMode(true);
      }

      const citiesForState = MAJOR_INDIAN_CITIES_BY_STATE[data.state] || [];
      if (data.city && citiesForState.length > 0 && !citiesForState.includes(data.city)) {
        setCustomCityMode(true);
      }

      if (data.sport && !SPORTS_LIST.includes(data.sport)) {
        setCustomSportMode(true);
      }

      const positionsForSport = POSITIONS_BY_SPORT[data.sport] || [];
      if (data.position && positionsForSport.length > 0 && !positionsForSport.includes(data.position)) {
        setCustomPositionMode(true);
      }
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
      const payload = {
        ...formData,
        fullName: formData.fullName ? formData.fullName.trim() : "",
        phone: formData.phone ? formData.phone.trim() : "",
        sport: formData.sport ? formData.sport.trim() : "",
        position: formData.position ? formData.position.trim() : "",
        age: formData.age !== "" && formData.age !== null && formData.age !== undefined ? parseInt(formData.age, 10) : null,
        height: formData.height !== "" && formData.height !== null && formData.height !== undefined ? parseFloat(formData.height) : null,
        weight: formData.weight !== "" && formData.weight !== null && formData.weight !== undefined ? parseFloat(formData.weight) : null,
        city: formData.city ? formData.city.trim() : "",
        state: formData.state ? formData.state.trim() : "",
        country: formData.country ? formData.country.trim() : "India",
        bio: formData.bio ? formData.bio.trim() : "",
      };

      await api.put(`/users/profile/${user.id}`, payload);
      setSuccess(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => {
        navigate("/profile");
      }, 1200);
    } catch (err) {
      console.log(err);
      toast.error(getErrorMessage(err, "Failed to update profile."));
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

  const availablePositions = POSITIONS_BY_SPORT[formData.sport] || [];

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
        
        {/* Gender Dropdown */}
        <SelectField
          label="Gender"
          name="gender"
          value={formData.gender || ""}
          onChange={handleChange}
          icon={FiUser}
        >
          <option value="" className="bg-[#161A20] text-gray-400">-- Select Gender --</option>
          {GENDER_OPTIONS.map((g) => (
            <option key={g} value={g} className="bg-[#161A20] text-white">
              {g}
            </option>
          ))}
        </SelectField>

        <InputField label="Age" name="age" type="number" min="5" max="120" value={formData.age} onChange={handleChange} icon={FiCalendar} placeholder="22" />
        
        <SectionTitle title="Sports Information" />
        
        {/* Sport Dropdown with Custom Option */}
        {!customSportMode ? (
          <div className="flex flex-col">
            <SelectField
              label="Sport / Discipline"
              name="sport"
              value={formData.sport || ""}
              onChange={(e) => {
                const selected = e.target.value;
                if (selected === "__CUSTOM_SPORT__") {
                  setCustomSportMode(true);
                  setCustomPositionMode(true);
                  setFormData(prev => ({ ...prev, sport: "", position: "" }));
                } else {
                  setFormData(prev => ({ ...prev, sport: selected, position: "" }));
                  setCustomPositionMode(false);
                }
              }}
              icon={FiTarget}
            >
              <option value="" className="bg-[#161A20] text-gray-400">-- Select Sport --</option>
              {SPORTS_LIST.map((sp) => (
                <option key={sp} value={sp} className="bg-[#161A20] text-white">
                  {sp}
                </option>
              ))}
              <option value="__CUSTOM_SPORT__" className="bg-[#161A20] text-brand-peach font-semibold">
                + Other / Enter Custom Sport
              </option>
            </SelectField>
          </div>
        ) : (
          <div className="flex flex-col">
            <InputField
              label="Sport / Discipline"
              name="sport"
              value={formData.sport}
              onChange={handleChange}
              icon={FiTarget}
              placeholder="Enter custom sport"
            />
            <button
              type="button"
              onClick={() => {
                setCustomSportMode(false);
                setFormData(prev => ({ ...prev, sport: "", position: "" }));
              }}
              className="text-[10px] text-brand-peach hover:underline text-left mt-1.5 ml-4 cursor-pointer"
            >
              ← Select from Sports list
            </button>
          </div>
        )}

        {/* Position Dropdown (dynamically adapts to selected sport) */}
        {!customPositionMode && availablePositions.length > 0 ? (
          <div className="flex flex-col">
            <SelectField
              label="Position / Role"
              name="position"
              value={formData.position || ""}
              onChange={(e) => {
                const selected = e.target.value;
                if (selected === "__CUSTOM_POSITION__") {
                  setCustomPositionMode(true);
                  setFormData(prev => ({ ...prev, position: "" }));
                } else {
                  setFormData(prev => ({ ...prev, position: selected }));
                }
              }}
              icon={FiActivity}
            >
              <option value="" className="bg-[#161A20] text-gray-400">-- Select Position in {formData.sport} --</option>
              {availablePositions.map((pos) => (
                <option key={pos} value={pos} className="bg-[#161A20] text-white">
                  {pos}
                </option>
              ))}
              <option value="__CUSTOM_POSITION__" className="bg-[#161A20] text-brand-peach font-semibold">
                + Other / Enter Custom Position
              </option>
            </SelectField>
          </div>
        ) : (
          <div className="flex flex-col">
            <InputField
              label="Position / Role"
              name="position"
              value={formData.position}
              onChange={handleChange}
              icon={FiActivity}
              placeholder={formData.sport ? "Enter position / role" : "Select Sport first or enter position"}
            />
            {availablePositions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCustomPositionMode(false);
                  setFormData(prev => ({ ...prev, position: "" }));
                }}
                className="text-[10px] text-brand-peach hover:underline text-left mt-1.5 ml-4 cursor-pointer"
              >
                ← Choose from Position dropdown
              </button>
            )}
          </div>
        )}
        
        <SectionTitle title="Physical Information" />
        <InputField label="Height (cm)" name="height" type="number" step="any" min="0" value={formData.height} onChange={handleChange} icon={FiMaximize2} placeholder="185" />
        <InputField label="Weight (kg)" name="weight" type="number" step="any" min="0" value={formData.weight} onChange={handleChange} icon={FaWeightHanging} placeholder="75" />
        
        <SectionTitle title="Location" />
        <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Country */}
          <SelectField
            label="Country"
            name="country"
            value={formData.country || "India"}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({ ...prev, country: val }));
              if (val === "India") {
                setCustomStateMode(false);
                setCustomCityMode(false);
              } else {
                setCustomStateMode(true);
                setCustomCityMode(true);
              }
            }}
            icon={FiGlobe}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c} className="bg-[#161A20] text-white">
                {c}
              </option>
            ))}
          </SelectField>

          {/* State / Province (Dropdown for India, free input for custom / international) */}
          {!customStateMode && (formData.country === "India" || !formData.country) ? (
            <div className="flex flex-col">
              <SelectField
                label="State / UT"
                name="state"
                value={formData.state || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__CUSTOM__") {
                    setCustomStateMode(true);
                    setCustomCityMode(true);
                    setFormData(prev => ({ ...prev, state: "", city: "" }));
                  } else {
                    setFormData(prev => ({ ...prev, state: val, city: "" }));
                    setCustomCityMode(false);
                  }
                }}
                icon={FiMap}
              >
                <option value="" className="bg-[#161A20] text-gray-400">-- Select State / UT --</option>
                <optgroup label="28 States" className="bg-[#161A20] text-brand-peach font-bold">
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st} className="bg-[#161A20] text-white font-normal">
                      {st}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="8 Union Territories" className="bg-[#161A20] text-cyan-400 font-bold">
                  {INDIAN_UNION_TERRITORIES.map((ut) => (
                    <option key={ut} value={ut} className="bg-[#161A20] text-white font-normal">
                      {ut}
                    </option>
                  ))}
                </optgroup>
                <option value="__CUSTOM__" className="bg-[#161A20] text-brand-peach font-semibold">
                  + Other / Enter Custom State
                </option>
              </SelectField>
            </div>
          ) : (
            <div className="flex flex-col">
              <InputField
                label="State / Province"
                name="state"
                value={formData.state}
                onChange={handleChange}
                icon={FiMap}
                placeholder="Enter state or province"
              />
              {(formData.country === "India" || !formData.country) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStateMode(false);
                    setFormData(prev => ({ ...prev, state: "" }));
                  }}
                  className="text-[10px] text-brand-peach hover:underline text-left mt-1.5 ml-4 cursor-pointer"
                >
                  ← Select from Indian States dropdown
                </button>
              )}
            </div>
          )}

          {/* City (Dropdown based on selected state, with option for custom entry) */}
          {!customCityMode && (MAJOR_INDIAN_CITIES_BY_STATE[formData.state]?.length > 0) ? (
            <div className="flex flex-col">
              <SelectField
                label="City"
                name="city"
                value={formData.city || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__CUSTOM_CITY__") {
                    setCustomCityMode(true);
                    setFormData(prev => ({ ...prev, city: "" }));
                  } else {
                    setFormData(prev => ({ ...prev, city: val }));
                  }
                }}
                icon={FiMapPin}
              >
                <option value="" className="bg-[#161A20] text-gray-400">-- Select City in {formData.state} --</option>
                {MAJOR_INDIAN_CITIES_BY_STATE[formData.state].map((c) => (
                  <option key={c} value={c} className="bg-[#161A20] text-white">
                    {c}
                  </option>
                ))}
                <option value="__CUSTOM_CITY__" className="bg-[#161A20] text-brand-peach font-semibold">
                  + Other / Enter Custom City
                </option>
              </SelectField>
            </div>
          ) : (
            <div className="flex flex-col">
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                icon={FiMapPin}
                placeholder={formData.state ? "Enter city or town name" : "Select State first or enter city"}
              />
              {MAJOR_INDIAN_CITIES_BY_STATE[formData.state]?.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomCityMode(false);
                    setFormData(prev => ({ ...prev, city: "" }));
                  }}
                  className="text-[10px] text-brand-peach hover:underline text-left mt-1.5 ml-4 cursor-pointer"
                >
                  ← Choose from City dropdown
                </button>
              )}
            </div>
          )}
        </div>
        
        <SectionTitle title="Media & Biography" />
        <div className="col-span-full space-y-2">
          <input
            type="file"
            id="athlete-profile-file-input"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && user?.id) {
                uploadProfilePhotoFromDevice(file, user.id, (newImg) => {
                  setFormData((prev) => ({ ...prev, profileImage: newImg }));
                });
              }
            }}
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1">
              <InputField
                label="Profile Image URL or Uploaded Image"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                icon={BiImageAdd}
                placeholder="https://example.com/image.jpg or click upload"
              />
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("athlete-profile-file-input")?.click()}
              className="px-4 py-4 rounded-2xl bg-white/5 hover:bg-brand-peach hover:text-black border border-white/10 text-xs font-bold text-gray-200 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <BiImageAdd size={18} />
              <span>Upload from Device</span>
            </button>
          </div>
        </div>
        
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