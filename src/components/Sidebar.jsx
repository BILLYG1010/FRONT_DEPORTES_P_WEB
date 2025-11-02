import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "inicio", icon: "inicio" },
  { to: "/clientes", label: "clientes", icon: "clientes" },
  { to: "/inventario", label: "inventario", icon: "inventario" },
  { to: "/facturas", label: "facturas", icon: "facturas" },
  
  
];

function Icon({ name, className = "w-5 h-5" }) {
  switch (name) {
    case "inicio":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" class="size-6">
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
          <path d="M12 5.432l8.159 8.159v6.198A1.875 1.875 0 0118.284 21.6H15v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21.6H5.625A1.875 1.875 0 013.75 19.725V13.59L12 5.432z" />
        </svg>
      );
    case "clientes":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" class="size-6">
            <path fill-rule="evenodd" d="M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-3.873 8.703a4.126 4.126 0 0 1 7.746 0 .75.75 0 0 1-.351.92 7.47 7.47 0 0 1-3.522.877 7.47 7.47 0 0 1-3.522-.877.75.75 0 0 1-.351-.92ZM15 8.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15ZM14.25 12a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15Z" clip-rule="evenodd" />
        </svg>

      );
    case "facturas":
        return (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor" class="size-6">
            <path fill-rule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 0 0 3 3h15a3 3 0 0 1-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125ZM12 9.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H12Zm-.75-2.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75ZM6 12.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5H6Zm-.75 3.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75ZM6 6.75a.75.75 0 0 0-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-3A.75.75 0 0 0 9 6.75H6Z" clip-rule="evenodd" />
            <path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 0 1-3 0V6.75Z" />
            </svg>

        );

    case "inventario":
        return (
            <svg className={className}  viewBox="0 0 24 24" fill="currentColor" class="size-6">
             <path fill-rule="evenodd" d="M1.5 7.125c0-1.036.84-1.875 1.875-1.875h6c1.036 0 1.875.84 1.875 1.875v3.75c0 1.036-.84 1.875-1.875 1.875h-6A1.875 1.875 0 0 1 1.5 10.875v-3.75Zm12 1.5c0-1.036.84-1.875 1.875-1.875h5.25c1.035 0 1.875.84 1.875 1.875v8.25c0 1.035-.84 1.875-1.875 1.875h-5.25a1.875 1.875 0 0 1-1.875-1.875v-8.25ZM3 16.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875v2.25c0 1.035-.84 1.875-1.875 1.875h-5.25A1.875 1.875 0 0 1 3 18.375v-2.25Z" clip-rule="evenodd" />
            </svg>

        );     

    case "user":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.75 20.105a8.25 8.25 0 0116.5 0 .75.75 0 01-.437.695A18.68 18.68 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.438-.695z" clipRule="evenodd" />
        </svg>
      );
    case "table":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M1.5 5.625C1.5 4.59 2.34 3.75 3.375 3.75h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM21 9.375h-7.875v2.25H21v-2.25zm0 4.5h-7.875v2.25H21v-2.25zM10.875 15.75h-7.5v2.25h7.5v-2.25zM3.375 9.375h7.5v2.25h-7.5v-2.25z" clipRule="evenodd" />
        </svg>
      );
    case "configuracion":
        return (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor" class="size-6">
             <path fill-rule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clip-rule="evenodd" />
            </svg>
        );
    case "bell":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar({ open, onClose }) {
  return (
    <aside
      className={[
        "bg-gradient-to-br from-gray-800 to-gray-900 fixed inset-y-4 left-4 z-50 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-80 xl:translate-x-0",
      ].join(" ")}
    >
      <div className="relative border-b border-white/20">
        <a className="flex items-center gap-4 py-6 px-8" href="#/">
          <h6 className="text-white font-sans font-semibold text-base">Material Tailwind Dashboard</h6>
        </a>
        <button
          onClick={onClose}
          className="absolute right-0 top-0 grid h-8 w-8 place-items-center rounded-lg text-white hover:bg-white/10 xl:hidden"
          type="button"
          aria-label="Close sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="m-4">
        <ul className="mb-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    "w-full flex items-center gap-4 px-4 py-3 rounded-lg text-xs capitalize transition-all",
                    isActive
                      ? "bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-md shadow-blue-500/20"
                      : "text-white hover:bg-white/10 active:bg-white/30",
                  ].join(" ")
                }
              >
                <Icon name={item.icon} />
                <p className="font-sans text-base font-medium">{item.label}</p>
              </NavLink>
            </li>
          ))}
        </ul>

        <ul className="mb-4 flex flex-col gap-1">
          <li className="mx-3.5 mt-4 mb-2">
            <p className="text-white opacity-75 font-black uppercase text-sm">auth pages</p>
          </li>
          <li>
            <a href="Ajustes" className="flex items-center gap-4 px-4 py-3 rounded-lg text-white hover:bg-white/10">
              <Icon name="configuracion" />
              <p className="font-sans text-base font-medium capitalize">Ajustes</p>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-4 px-4 py-3 rounded-lg text-white hover:bg-white/10">
              <Icon name="user" />
              <p className="font-sans text-base font-medium capitalize">Cerrar sesión</p>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
