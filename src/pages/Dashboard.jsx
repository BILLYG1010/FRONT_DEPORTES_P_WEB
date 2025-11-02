import CardStat from "../components/CardStat";
import ProjectTable from "../components/ProjectTable";

const stats = [
  {
    title: "Today's Money",
    value: "$53k",
    delta: "+55%",
    deltaColor: "text-green-500",
    iconBg: "from-blue-600 to-blue-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
        <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z" clipRule="evenodd" />
        <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
      </svg>
    ),
  },
  {
    title: "Today's Users",
    value: "2,300",
    delta: "+3%",
    deltaColor: "text-green-500",
    iconBg: "from-pink-600 to-pink-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.75 20.105a8.25 8.25 0 0116.5 0 .75.75 0 01-.437.695A18.68 18.68 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.438-.695z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: "New Clients",
    value: "3,462",
    delta: "-2%",
    deltaColor: "text-red-500",
    iconBg: "from-green-600 to-green-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63A13.067 13.067 0 0112 21.75a17.1 17.1 0 01-6.76-1.873.75.75 0 01-.364-.63l-.001-.122z" />
      </svg>
    ),
  },
  {
    title: "Sales",
    value: "$103,430",
    delta: "+5%",
    deltaColor: "text-green-500",
    iconBg: "from-orange-600 to-orange-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 019.75 19.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
      </svg>
    ),
  },
];

const projects = [
  { company: "Material XD Version", budget: "$14,000", completion: 60, completionColor: "from-blue-600 to-blue-400" },
  { company: "Add Progress Track", budget: "$3,000", completion: 10, completionColor: "from-blue-600 to-blue-400" },
  { company: "Fix Platform Errors", budget: "Not set", completion: 100, completionColor: "from-green-600 to-green-400" },
  { company: "Launch our Mobile App", budget: "$20,500", completion: 100, completionColor: "from-green-600 to-green-400" },
  { company: "Add the New Pricing Page", budget: "$500", completion: 25, completionColor: "from-blue-600 to-blue-400" },
];

export default function Dashboard() {
  return (
    <>
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <CardStat key={i} {...s} />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="relative flex flex-col overflow-hidden rounded-xl bg-white text-slate-700 shadow-md xl:col-span-2">
          <div className="m-0 flex items-center justify-between p-6">
            <div>
              <h6 className="text-base font-semibold text-slate-900 mb-1">Projects</h6>
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 text-blue-500" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <strong>30 done</strong> this month
              </p>
            </div>
            <button className="grid place-items-center h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-500/10">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </button>
          </div>
          <ProjectTable rows={projects} />
        </div>
      </div>
    </>
  );
}
