import { NavItem } from "@/components/dashboard/app-sidebar"
import {
  SidebarGroup, SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem, useSidebar,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"

export default function NavContent({ data }: { data: { label: string; items: NavItem[] }[] }) {
  const {setOpenMobile} = useSidebar()

  return (
    <>
      {data.map((group, i) => (
        <SidebarGroup key={i}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item, j) => (
              <SidebarMenuItem key={j}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link onClick={() => setOpenMobile(false)} href={item.href}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}