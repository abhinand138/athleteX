import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

import ProfileHeader from "../components/profile/ProfileHeader";
import PersonalInfoCard from "../components/profile/PersonalInfoCard";
import BioCard from "../components/profile/BioCard";

export default function Profile() {

  const [profile, setProfile] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {

    if (user?.id) {
      fetchProfile();
    }

  }, []);

  const fetchProfile = async () => {

    try {

      const response = await api.get(`/users/profile/${user.id}`);

      setProfile(response.data);

    } catch (error) {

      console.error("Failed to load profile:", error);

    }

  };

  if (!profile) {

    return (

      <DashboardLayout>

        <div className="flex justify-center items-center h-screen">

          <h1 className="text-white text-3xl">
            Loading Profile...
          </h1>

        </div>

      </DashboardLayout>

    );

  }

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Page Title */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold text-white">
              My Profile
            </h1>

            <p className="text-gray-400 mt-2">
              View and manage your athlete profile.
            </p>

          </div>

          <Link
            to="/profile/edit"
            className="bg-brand-peach text-black px-6 py-3 rounded-xl font-semibold hover:bg-brand-peach/90 transition"
          >
            Edit Profile
          </Link>

        </div>

        {/* Profile Header */}

        <ProfileHeader profile={profile} />

        {/* Personal Information */}

        <PersonalInfoCard profile={profile} />

        {/* Athlete Bio */}

        <BioCard profile={profile} />

      </div>

    </DashboardLayout>

  );

}