export default function TeacherNoClass() {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/20 p-8 text-center">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">No class assigned</h2>
      <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
        You are not set as the class teacher for any class. Ask an administrator to assign you as class teacher on a
        class. Use <strong>Logout</strong> or change password from the header when needed.
      </p>
    </div>
  );
}
