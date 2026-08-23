import Link from "next/link";
import { api } from "~/trpc/server";

export default async function Home() {
  const { status } = await api.health.getHealth.query();
  return (
    <main className="flex justify-center items-center min-w-screen min-h-screen">
      <div>
        <h1 className="text-3xl">Rayyan Op</h1>
        <Link href="/dashboard" className="text-blue-600 underline">
          Go see the dashboard
        </Link>
        <h2>Server Status: {status}</h2>
      </div>
    </main>
  );
}
