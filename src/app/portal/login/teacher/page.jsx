import LoginFormComponent from "@/app/portal/login/components/LoginFormComponent";

export default function TeacherLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center pt-24">
      <LoginFormComponent roleTitle="Teacher" />
    </div>
  );
}
