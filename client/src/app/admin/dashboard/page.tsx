import PaymentsChart from "./charts-container";
import StatsContainer from "./stats-container";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <main className="w-full h-full px-6 py-8">
        {/* Stats Cards */}
        <StatsContainer />
        <PaymentsChart />
      </main>
    </div>
  );
}

