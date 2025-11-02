import { useLocation } from "react-router-dom";

export default function Topbar({ onOpenSidebar }) {
  const { pathname } = useLocation();
  const crumb = pathname === "/" ? "home" : pathname.replace("/", "");

  return (
    <nav className="w-full bg-transparent rounded-xl px-0 py-1">
      <div className="flex flex-col-reverse gap-6 md:flex-row md:items-center md:justify-between">
        <div className="capitalize">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center">
              <li className="text-sm text-blue-900 opacity-50">
                <span className="hover:text-blue-500">dashboard</span>
                <span className="mx-2 text-gray-500">/</span>
              </li>
              <li className="text-sm text-blue-900">{crumb}</li>
            </ol>
          </nav>
          <h6 className="text-base font-semibold text-slate-900">{crumb}</h6>
        </div>

        <div className="flex items-center">
          <div className="mr-auto md:mr-4 md:w-56">
            <div className="relative h-10 min-w-[200px]">
              <input
                className="peer w-full h-full bg-transparent text-slate-700 outline-none border placeholder:text-slate-400 text-sm px-3 py-2.5 rounded-[7px] border-slate-200 focus:border-2 focus:border-blue-500"
                placeholder="Search"
              />
            </div>
          </div>

          <button
            onClick={onOpenSidebar}
            className="grid xl:hidden place-items-center h-10 w-10 rounded-lg text-slate-500 hover:bg-slate-500/10"
            type="button"
            aria-label="Open sidebar"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M3 6.75h18v1.5H3v-1.5zM3 12h18v1.5H3V12zm0 5.25h18v1.5H3v-1.5z" clipRule="evenodd" />
            </svg>
          </button>

          <button className="grid place-items-center h-10 w-10 rounded-lg text-slate-500 hover:bg-slate-500/10" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653z" clipRule="evenodd" />
            </svg>
          </button>

          <button className="grid place-items-center h-10 w-10 rounded-lg text-slate-500 hover:bg-slate-500/10" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.5 7.5 0 00-.986.57l-.45.083-1.006-.382A1.875 1.875 0 004.03 6.596l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.618 7.618 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57l.45-.082 1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382-.45-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348L12.922 3.82A1.875 1.875 0 0011.078 2.25h-.001zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
