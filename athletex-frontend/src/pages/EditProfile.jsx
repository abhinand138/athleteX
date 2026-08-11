import DashboardLayout from "../layouts/DashboardLayout";
import ProfileForm from "../components/profile/ProfileForm";

export default function EditProfile() {
  return (
    <DashboardLayout>
      <div className="space-y-6">

        <h1 className="text-4xl font-bold text-white">
          Edit Profile
        </h1>

        <ProfileForm />

      </div>
    </DashboardLayout>
  );
}