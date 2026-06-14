import AppBreadcrumb from "@/components/dashboard/app-breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { useAuth } from "@/components/auth"
import { User } from "@/components/user"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <AppBreadcrumb />
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <User />
      </div>
    </header>
  )
}