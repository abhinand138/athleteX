import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiAward,
  FiCheck,
  FiArrowLeft,
  FiCamera,
  FiMap
} from "react-icons/fi";
import { FaDumbbell, FaCalendarAlt } from "react-icons/fa";
import { uploadProfilePhotoFromDevice } from "../../utils/profilePhotoUpload";
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
  COACH_DESIGNATIONS
} from "../../utils/sportsData";
import { getErrorMessage } from "../../utils/errorHandler";

const InputField = ({ label, name, value, onChange, icon: Icon, type = "text", placeholder, required = false, list }) => (
  <div className="relative group">
    <label className="block text-xs font-semibold text-gray-400 mb-2 group-focus-within:text-brand-peach transition-colors">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    <div className="relative flex items-center">
      {Icon && (
        <div className="absolute left-4 text-gray-500 group-focus-within:text-brand-peach transition-colors pointer-events-none">
          <Icon size={17} />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        list={list}
        className={`w-full bg-[#111317]/90 border border-white/10 rounded-2xl py-3.5 ${
          Icon ? "pl-11" : "pl-4"
        } pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 focus:ring-1 focus:ring-brand-peach/50 transition-all text-sm`}
      />
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, icon: Icon, children }) => (
  <div className="relative group">
    <label className="block text-xs font-semibold text-gray-400 mb-2 group-focus-within:text-brand-peach transition-colors">
      {label}
    </label>
    <div className="relative flex items-center">
      {Icon && (
        <div className="absolute left-4 text-gray-500 group-focus-within:text-brand-peach transition-colors pointer-events-none">
          <Icon size={17} />
        </div>
      )}
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className={`w-full bg-[#111317] border border-white/10 rounded-2xl py-3.5 ${
          Icon ? "pl-11" : "pl-4"
        } pr-10 text-white focus:outline-none focus:border-brand-peach/50 focus:ring-1 focus:ring-brand-peach/50 transition-all text-sm appearance-none cursor-pointer`}
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
        ▼
      </div>
    </div>
  </div>
);

export default function CoachEditProfile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const coachId = storedUser?.id;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customStateMode, setCustomStateMode] = useState(false);
  const [customCityMode, setCustomCityMode] = useState(false);
  const [customSportMode, setCustomSportMode] = useState(false);
  const [customPositionMode, setCustomPositionMode] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    sport: "",
    position: "", // Coaching Designation / Title
    title: "",
    specialization: "",
    experienceYears: "",
    certifications: "",
    age: "",      // Years of Experience fallback
    gender: "",
    city: "",
    state: "",
    country: "India",
    bio: "",
    profileImage: ""
  });

  useEffect(() => {
    if (!coachId) {
      toast.error("User session not found. Please log in.");
      navigate("/login");
      return;
    }
    loadProfile();
  }, [coachId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/profile/${coachId}`);
      if (res.data) {
        const countryVal = res.data.country && res.data.country.trim() ? res.data.country : "India";
        setFormData({
          fullName: res.data.fullName || "",
          phone: res.data.phone || "",
          sport: res.data.sport || "",
          position: res.data.position || res.data.title || "",
          title: res.data.title || res.data.position || "",
          specialization: res.data.specialization || "",
          experienceYears: res.data.experienceYears || res.data.age || "",
          certifications: res.data.certifications || "",
          age: res.data.age || res.data.experienceYears || "",
          gender: res.data.gender || "",
          city: res.data.city || "",
          state: res.data.state || "",
          country: countryVal,
          bio: res.data.bio || "",
          profileImage: res.data.profileImage || ""
        });

        if (res.data.state && countryVal === "India" && !INDIAN_STATES_AND_UTS.includes(res.data.state)) {
          setCustomStateMode(true);
        } else if (countryVal !== "India") {
          setCustomStateMode(true);
        }

        const citiesForState = MAJOR_INDIAN_CITIES_BY_STATE[res.data.state] || [];
        if (res.data.city && citiesForState.length > 0 && !citiesForState.includes(res.data.city)) {
          setCustomCityMode(true);
        }

        if (res.data.sport && !SPORTS_LIST.includes(res.data.sport)) {
          setCustomSportMode(true);
        }

        const currentPos = res.data.position || res.data.title;
        if (currentPos && !COACH_DESIGNATIONS.includes(currentPos)) {
          setCustomPositionMode(true);
        }
      }
    } catch (err) {
      console.error("Failed to load coach profile:", err);
      toast.error(getErrorMessage(err, "Failed to load profile details."));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const expYears = formData.experienceYears || formData.age;
      const coachTitle = formData.title || formData.position;

      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        sport: formData.sport.trim(),
        position: coachTitle ? coachTitle.trim() : "",
        title: coachTitle ? coachTitle.trim() : "",
        specialization: formData.specialization ? formData.specialization.trim() : "",
        experienceYears: expYears ? parseInt(expYears, 10) : null,
        certifications: formData.certifications ? formData.certifications.trim() : "",
        age: expYears ? parseInt(expYears, 10) : null,
        gender: formData.gender,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        bio: formData.bio.trim(),
        profileImage: formData.profileImage.trim()
      };

      await api.put(`/users/profile/${coachId}`, payload);

      // Synchronize localStorage so Topbar and Welcome headers update immediately
      const updatedUser = {
        ...storedUser,
        fullName: payload.fullName,
        profileImage: payload.profileImage
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Coach profile updated successfully!");
      setTimeout(() => {
        navigate("/coach/profile");
      }, 1000);
    } catch (err) {
      console.error("Failed to update coach profile:", err);
      toast.error(getErrorMessage(err, "Failed to update profile."));
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-peach/20 border-t-brand-peach rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Top Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/settings")}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"
          >
            <FiArrowLeft size={14} />
            <span>Back to Settings</span>
          </button>
          <span className="text-xs text-brand-peach font-mono uppercase tracking-widest font-bold">
            Coach Management
          </span>
        </div>

        {/* Form Card */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="glass-card bg-[#161A20]/80 backdrop-blur-xl rounded-3xl border border-white/5 p-6 sm:p-10 shadow-2xl relative space-y-8"
        >
          {/* Section: Core Info */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
              <FiUser className="text-brand-peach" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Personal Information
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                icon={FiUser}
                placeholder="Coach Full Name"
                required
              />
              <InputField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon={FiPhone}
                placeholder="+1 234 567 890"
              />
              <InputField
                label="Years of Experience"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                icon={FaCalendarAlt}
                placeholder="e.g. 8"
              />
              <div className="relative group">
                <label className="block text-xs font-semibold text-gray-400 mb-2 group-focus-within:text-brand-peach transition-colors">
                  Gender
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-gray-500 group-focus-within:text-brand-peach transition-colors pointer-events-none">
                    <FiUser size={17} />
                  </div>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-[#111317]/90 border border-white/10 rounded-2xl py-3.5 pl-11 pr-10 text-white focus:outline-none focus:border-brand-peach/50 focus:ring-1 focus:ring-brand-peach/50 transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#111317]">Select Gender</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g} className="bg-[#111317]">
                        {g}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Coaching Details */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
              <FaDumbbell className="text-brand-peach" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Coaching Credentials & Sport
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Primary Sport Dropdown with Custom Option */}
              {!customSportMode ? (
                <div className="flex flex-col">
                  <SelectField
                    label="Primary Sport / Discipline"
                    name="sport"
                    value={formData.sport || ""}
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (selected === "__CUSTOM_SPORT__") {
                        setCustomSportMode(true);
                        setFormData(prev => ({ ...prev, sport: "" }));
                      } else {
                        setFormData(prev => ({ ...prev, sport: selected }));
                      }
                    }}
                    icon={FaDumbbell}
                  >
                    <option value="" className="bg-[#111317] text-gray-400">-- Select Sport --</option>
                    {SPORTS_LIST.map((sp) => (
                      <option key={sp} value={sp} className="bg-[#111317] text-white">
                        {sp}
                      </option>
                    ))}
                    <option value="__CUSTOM_SPORT__" className="bg-[#111317] text-brand-peach font-semibold">
                      + Other / Enter Custom Sport
                    </option>
                  </SelectField>
                </div>
              ) : (
                <div className="flex flex-col">
                  <InputField
                    label="Primary Sport / Discipline"
                    name="sport"
                    value={formData.sport}
                    onChange={handleChange}
                    icon={FaDumbbell}
                    placeholder="Enter custom sport"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSportMode(false);
                      setFormData(prev => ({ ...prev, sport: "" }));
                    }}
                    className="text-[10px] text-brand-peach hover:underline text-left mt-1.5 ml-4 cursor-pointer"
                  >
                    ← Select from Sports list
                  </button>
                </div>
              )}

              {/* Coaching Designation Dropdown with Custom Option */}
              {!customPositionMode ? (
                <div className="flex flex-col">
                  <SelectField
                    label="Coaching Title / Designation"
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
                    icon={FiAward}
                  >
                    <option value="" className="bg-[#111317] text-gray-400">-- Select Title / Designation --</option>
                    {COACH_DESIGNATIONS.map((title) => (
                      <option key={title} value={title} className="bg-[#111317] text-white">
                        {title}
                      </option>
                    ))}
                    <option value="__CUSTOM_POSITION__" className="bg-[#111317] text-brand-peach font-semibold">
                      + Other / Enter Custom Designation
                    </option>
                  </SelectField>
                </div>
              ) : (
                <div className="flex flex-col">
                  <InputField
                    label="Coaching Title / Designation"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    icon={FiAward}
                    placeholder="e.g. Head Coach, Tactical Analyst"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPositionMode(false);
                      setFormData(prev => ({ ...prev, position: "" }));
                    }}
                    className="text-[10px] text-brand-peach hover:underline text-left mt-1.5 ml-4 cursor-pointer"
                  >
                    ← Select from Designation list
                  </button>
                </div>
              )}

              {/* Primary Specialization */}
              <InputField
                label="Primary Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                icon={FaDumbbell}
                placeholder="e.g. Sprint Biomechanics, Plyometrics, VO2 Max"
              />

              {/* Certifications & Licenses */}
              <InputField
                label="Certifications & Licenses"
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                icon={FiAward}
                placeholder="e.g. CSCS, USATF Level 3, UEFA A License"
              />

              <div className="sm:col-span-2 space-y-2">
                <input
                  type="file"
                  id="coach-profile-file-input"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && coachId) {
                      uploadProfilePhotoFromDevice(file, coachId, (newImg) => {
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
                      icon={FiCamera}
                      placeholder="https://example.com/coach-photo.jpg or click upload"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById("coach-profile-file-input")?.click()}
                    className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-brand-peach hover:text-black border border-white/10 text-xs font-bold text-gray-200 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <FiCamera size={15} />
                    <span>Upload from Device</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
              <FiMapPin className="text-brand-peach" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Location & Base
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                  <option key={c} value={c} className="bg-[#111317] text-white">
                    {c}
                  </option>
                ))}
              </SelectField>

              {/* State / Province */}
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
                    <option value="" className="bg-[#111317] text-gray-400">-- Select State / UT --</option>
                    <optgroup label="28 States" className="bg-[#111317] text-brand-peach font-bold">
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st} className="bg-[#111317] text-white font-normal">
                          {st}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="8 Union Territories" className="bg-[#111317] text-cyan-400 font-bold">
                      {INDIAN_UNION_TERRITORIES.map((ut) => (
                        <option key={ut} value={ut} className="bg-[#111317] text-white font-normal">
                          {ut}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__CUSTOM__" className="bg-[#111317] text-brand-peach font-semibold">
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
                      className="text-[10px] text-brand-peach hover:underline text-left mt-1.5 cursor-pointer"
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
                    <option value="" className="bg-[#111317] text-gray-400">-- Select City in {formData.state} --</option>
                    {MAJOR_INDIAN_CITIES_BY_STATE[formData.state].map((c) => (
                      <option key={c} value={c} className="bg-[#111317] text-white">
                        {c}
                      </option>
                    ))}
                    <option value="__CUSTOM_CITY__" className="bg-[#111317] text-brand-peach font-semibold">
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
                      className="text-[10px] text-brand-peach hover:underline text-left mt-1.5 cursor-pointer"
                    >
                      ← Choose from City dropdown
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section: Coaching Philosophy & Bio */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Coaching Philosophy & Bio
              </h2>
            </div>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio || ""}
              onChange={handleChange}
              placeholder="Describe your coaching methodology, career achievements, player development track record, or certifications (e.g. AFC B License, CSCS)..."
              className="w-full bg-[#111317]/90 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-peach/50 focus:ring-1 focus:ring-brand-peach/50 transition-all text-sm leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition font-bold text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-peach to-orange-500 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-brand-peach/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <FiCheck size={16} />
                  <span>Save Coach Profile</span>
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  );
}
