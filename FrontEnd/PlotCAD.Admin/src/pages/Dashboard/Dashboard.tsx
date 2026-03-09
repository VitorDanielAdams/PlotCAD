import { Building2, Puzzle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardApi from "../../api/Dashboard";
import { IDashboardStats } from "../../types/backoffice.types";

const { getStats } = DashboardApi();

const Dashboard = () => {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-light" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-gray-500">Erro ao carregar dados</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Tenants",
      value: stats.totalTenants,
      subtitle: `${stats.activeTenants} ativos`,
      icon: <Building2 className="h-8 w-8 text-primary-light" />,
      bg: "bg-primary-soft",
    },
    {
      title: "Usuários",
      value: stats.totalUsers,
      subtitle: `${stats.activeUsers} ativos`,
      icon: <Users className="h-8 w-8 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      title: "Módulos",
      value: stats.totalModules,
      subtitle: "módulos configurados",
      icon: <Puzzle className="h-8 w-8 text-amber-600" />,
      bg: "bg-amber-50",
    },
  ];

  const breakdown = [
    { label: "Trial", value: stats.trialTenants, color: "text-yellow-600" },
    { label: "Expirados", value: stats.expiredTenants, color: "text-red-600" },
    {
      label: "Suspensos",
      value: stats.suspendedTenants,
      color: "text-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#15803d] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">{card.subtitle}</p>
                </div>
                <div className={`${card.bg} p-3 rounded-lg`}>{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Situação das Assinaturas
          </h2>
          <div className="flex flex-wrap gap-4 sm:gap-8">
            {breakdown.map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <span className={`text-2xl font-bold ${item.color}`}>
                  {item.value}
                </span>
                <span className="text-sm text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
