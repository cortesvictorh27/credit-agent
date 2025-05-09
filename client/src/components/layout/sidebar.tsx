import { useLocation } from "wouter";
import { 
  MessageSquare, Users, Building2, BarChart3,
  Settings, MessagesSquare, Database, ShieldCheck, 
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <li>
      <a 
        href="#" 
        className={cn(
          "flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100",
          active && "bg-primary bg-opacity-10 text-primary"
        )}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        {icon}
        <span>{label}</span>
      </a>
    </li>
  );
}

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className="bg-white w-full md:w-64 md:min-h-[calc(100vh-64px)] border-r border-neutral-200 p-4">
      <div className="mb-6">
        <h2 className="text-sm font-medium text-neutral-500 mb-2">MAIN MENU</h2>
        <nav>
          <ul className="space-y-1">
            <SidebarItem 
              icon={<MessageSquare className="h-4 w-4" />} 
              label="Chatbot Interface" 
              active={isActive("/chatbot")} 
              onClick={() => setLocation("/chatbot")}
            />
            <SidebarItem 
              icon={<Users className="h-4 w-4" />} 
              label="Lead Management" 
              active={isActive("/leads")} 
              onClick={() => setLocation("/")}
            />
            <SidebarItem 
              icon={<Building2 className="h-4 w-4" />} 
              label="Lending Partners" 
              active={isActive("/lending-partners")} 
              onClick={() => setLocation("/lending-partners")}
            />
            <SidebarItem 
              icon={<BarChart3 className="h-4 w-4" />} 
              label="Analytics" 
              active={isActive("/analytics")} 
              onClick={() => {}}
            />
          </ul>
        </nav>
      </div>
      
      <div className="mb-6">
        <h2 className="text-sm font-medium text-neutral-500 mb-2">CONFIGURATIONS</h2>
        <nav>
          <ul className="space-y-1">
            <SidebarItem 
              icon={<Settings className="h-4 w-4" />} 
              label="Bot Settings" 
              active={isActive("/settings")} 
              onClick={() => {}}
            />
            <SidebarItem 
              icon={<MessagesSquare className="h-4 w-4" />} 
              label="Conversation Flows" 
              active={isActive("/flows")} 
              onClick={() => {}}
            />
            <SidebarItem 
              icon={<Database className="h-4 w-4" />} 
              label="Data Integration" 
              active={isActive("/integration")} 
              onClick={() => {}}
            />
          </ul>
        </nav>
      </div>
      
      <div>
        <h2 className="text-sm font-medium text-neutral-500 mb-2">SYSTEM</h2>
        <nav>
          <ul className="space-y-1">
            <SidebarItem 
              icon={<ShieldCheck className="h-4 w-4" />} 
              label="Admin Settings" 
              active={isActive("/admin")} 
              onClick={() => {}}
            />
            <SidebarItem 
              icon={<HelpCircle className="h-4 w-4" />} 
              label="Help & Support" 
              active={isActive("/help")} 
              onClick={() => {}}
            />
          </ul>
        </nav>
      </div>
    </aside>
  );
}
