import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

import ProfileHeader from "../components/profile/ProfileHeader";
import PersonalInfoCard from "../components/profile/PersonalInfoCard";
import BioCard from "../components/profile/BioCard";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/users/profile/${user.id}`);
      setProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <h2 className="text-2xl text-white">Loading Profile...</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProfileHeader profile={profile} />
        <PersonalInfoCard profile={profile} />
        <BioCard profile={profile} />
      </div>
    </DashboardLayout>
  );
}