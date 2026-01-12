import Login from "@/pages/auth/Login";

export const publicRoutes = [
  {
    path: "/login",
    element: (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-950">
        <Login />
      </div>
    ),
  },
];



