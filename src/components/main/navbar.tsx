import { cookies } from "next/headers";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import ProfileMenu from './profile-menu';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import SearchCMDK, { type TabsType } from './cmdk-search';
import { Banknote, Briefcase, Calendar, Footprints, GraduationCap, Home, Megaphone, Settings, Tally5, Phone } from 'lucide-react';
import { auth } from '~/server/auth';
import ThemeSwitch from '../theme-switch';
import { getAnnoucements, getCourses, getScholarships, getTryouts, getUserEvents } from '~/server/action';
import StudentBreadcrumb from '../student-breadcrumb';

const sidebarTabs: {
  group: string,
  items: {
    label: string,
    href: string,
    icon: typeof Banknote,
    tooltip: string,
    dev?: boolean
  }[]
}[] = [
    {
      group: 'General', items: [
        { label: 'Dashboard', href: '/dashboard', icon: Home, tooltip: 'Dashboard' },
        { label: 'Schedule', href: '/schedule', icon: Calendar, tooltip: 'Schedule', dev: true },
      ]
    },
    {
      group: 'Academics',
      items: [
        { label: 'Courses', href: '/courses', icon: GraduationCap, tooltip: 'Courses' },
        { label: 'Tryouts', href: '/tryouts', icon: Tally5, tooltip: 'Tryouts' },
        { label: 'Scholarships', href: '/scholarships', icon: Banknote, tooltip: 'Scholarships' },
      ],
    },
    {
      group: 'Himpunan',
      items: [
        { label: 'Events', href: '/events', icon: Footprints, tooltip: 'Events', dev: false },
        { label: 'Announcements', href: '/announcements', icon: Megaphone, tooltip: 'Announcements', dev: false },
        { label: "M-Opportunity", href: "/loker", icon: Briefcase, tooltip: "M-Opportunity", dev: true },
        { label: "Hotline", href: "/hotline", icon: Phone, tooltip: "Hotline", dev: false },
      ],
    },
    {
      group: 'Preferences',
      items: [
        { label: 'Settings', href: '/settings', icon: Settings, tooltip: 'Settings', dev: true },
      ],
    },
    {
      group: 'Admin',
      items: [
        { label: 'Admin Panel', href: '/admin', icon: Home, tooltip: 'Admin Panel' },
      ],
    },
  ]

export default async function MainNavbar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const SIDEBAR_COOKIE_NAME = "sidebar_state"
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === "true"
  const session = await auth()

  const courses = (await getCourses()).map(course => ({
    id: course.id,
    title: course.title,
    totalLessons: 12,
    totalVideos: 10
  }));
  const announcements = (await getAnnoucements()).map(announcement => ({
    id: announcement.id,
    title: announcement.title,
    date: announcement.createdAt
  }));
  const events = (await getUserEvents(session?.user.id ?? "")).map(event => ({
    id: event.id,
    title: event.title,
    date: event.createdAt
  }));
  const scholarships = (await getScholarships()).map(scholarship => ({
    id: scholarship.id,
    title: scholarship.title,
    date: scholarship.createdAt
  }));
  const tryout = (await getTryouts()).map(tryout => ({
    id: tryout.id,
    title: tryout.title,
    classCode: tryout.course.classCode ?? "N/A"
  }))

  const tabs =
  {
    courses,
    announcements,
    events,
    scholarships,
    tryouts: tryout
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen} cookieName={SIDEBAR_COOKIE_NAME}>
      <AppSidebar />
      <main className='w-full overflow-y-auto h-screen'>
        <SiteHeader data={tabs} />
        <div className="h-[calc(100%-16*var(--spacing)))] p-4 md:p-6 group-has-data-[collapsible=icon]/sidebar-wrapper:h-[calc(100%-12*var(--spacing))]">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}

async function AppSidebar() {
  const session = await auth();
  const user = session?.user ?? {
    name: "Guest",
    role: 'STUDENT',
    image: ''
  }

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-inherit"
            >
              <div className="flex aspect-square transition-all items-center justify-center rounded-lg h-full">
                <Image
                  src="/hmm-vstock/logo.png"
                  alt="Logo"
                  width={196}
                  height={196}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1 text-left text-sm leading-tight ml-2">
                <h1 className="text-xl font-semibold truncate">HMM ITB</h1>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarTabs.map((group) => {
          if (group.group === 'Admin' && (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
            return null;
          }
          return (
            <SidebarGroup key={'sidebar-group-' + group.group}>
              <SidebarGroupLabel>
                {group.group}
              </SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={'sidebar-item-' + item.label}>
                    <SidebarMenuButton tooltip={item.tooltip} asChild>
                      <Link href={item.href} className='transition-all rounded-l-full pl-4 py-1.5 flex items-center'>
                        <item.icon />
                        <span>{item.label}</span>
                        {item.dev && <Badge variant='secondary' className='ml-2'>dev</Badge>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter>
        <ProfileMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

function SiteHeader({ data }: { data: TabsType }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 py-2 sticky top-0 z-50 border-b bg-background">
      <div className="flex items-center w-full gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className='-ml-1 cursor-pointer' />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <StudentBreadcrumb />
        <div className="ml-auto flex gap-4 items-center">
          <SearchCMDK data={data} />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  )
}