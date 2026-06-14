import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import {
  BookOpen,
  Calendar,
  ChevronsUpDown,
  Scroll,
  Shapes,
  User,
} from "lucide-react"
import { ComponentProps, ComponentType } from "react"
import NavHeader from "@/components/dashboard/nav-header"
import NavContent from "@/components/dashboard/nav-content"

export interface NavItem {
  title: string
  description?: string
  icon: ComponentType<ComponentProps<"svg">>
  href: string
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const data = {
    header: {
      title: "Literaturhaus München",
      description: "Internal",
      icon: BookOpen,
      href: "/",
    },
    items: [
      {
        label: "Platform",
        items: [
          {
            title: "Users",
            description: "Desc",
            icon: User,
            href: "/dashboard/users",
          },
          {
            title: "Orders",
            description: "",
            icon: Scroll,
            href: "/dashboard/orders",
          },
        ],
      },
      {
        label: "Products",
        items: [
          {
            title: "Books",
            description: "",
            icon: BookOpen,
            href: "/dashboard/books",
          },
          {
            title: "Events",
            description: "",
            icon: Calendar,
            href: "/dashboard/events",
          },
          {
            title: "Collections",
            description: "",
            icon: Shapes,
            href: "/dashboard/collections",
          },
        ],
      },
    ],
  } satisfies Record<string, NavItem | { label: string; items: NavItem[] }[]>

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader data={data.header} />
      </SidebarHeader>
      <SidebarContent>
        <NavContent data={data.items} />
      </SidebarContent>
      <SidebarFooter>User</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
