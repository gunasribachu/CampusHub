
function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-bold text-slate-900">
        My Profile
      </h2>
      <p className="mt-1 text-slate-500">
        View your student account details.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
          {(user.name || "S").charAt(0).toUpperCase()}
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-sm text-slate-500">Full Name</p>
            <p className="font-semibold text-slate-900">
              {user.name || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-semibold text-slate-900">
              {user.email || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Branch</p>
            <p className="font-semibold text-slate-900">
              {user.branch || "Not available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
