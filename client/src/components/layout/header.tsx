import { useLocation } from "wouter";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const [location, setLocation] = useLocation();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2" onClick={() => setLocation("/")} style={{ cursor: "pointer" }}>
          <svg xmlns="http://www.w3.org/2000/svg" 
               viewBox="0 0 24 24" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="2" 
               strokeLinecap="round" 
               strokeLinejoin="round" 
               className="w-6 h-6 text-primary">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <h1 className="text-xl font-semibold text-primary">LendMatch AI</h1>
        </div>

        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <a 
                href="#" 
                className={`text-neutral-600 hover:text-primary transition-colors ${location === "/" ? "text-primary" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setLocation("/");
                }}
              >
                Dashboard
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`text-neutral-600 hover:text-primary transition-colors ${location === "/lending-partners" ? "text-primary" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setLocation("/lending-partners");
                }}
              >
                Lending Partners
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`text-neutral-600 hover:text-primary transition-colors ${location === "/analytics" ? "text-primary" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  // setLocation("/analytics");
                }}
              >
                Analytics
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`text-neutral-600 hover:text-primary transition-colors ${location === "/help" ? "text-primary" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  // setLocation("/help");
                }}
              >
                Help
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex items-center space-x-4">
          <button className="text-neutral-600 hover:text-primary">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 bg-primary">
              <AvatarFallback className="text-white text-sm">JD</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden md:inline">John Doe</span>
          </div>
        </div>
      </div>
    </header>
  );
}
