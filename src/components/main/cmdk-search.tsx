"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type JSX,
  type SetStateAction,
} from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Banknote,
  Bell,
  Calendar,
  CornerDownLeft,
  FileSpreadsheet,
  Footprints,
  GraduationCap,
  Home,
  Megaphone,
  Settings,
  SquarePlay,
  Tally5,
  Trophy,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Kbd } from "../ui/key-bind";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type NavTabItem = {
  label: string;
  href: string;
  icon: typeof Home;
  tooltip?: string;
  dev?: boolean;
};

const tabs: { group: string; items: NavTabItem[] }[] = [
  {
    group: "Academics",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: Home,
        tooltip: "Dashboard",
      },
      {
        label: "Hall of Fame",
        href: "/hall-of-fame",
        icon: Trophy,
        tooltip: "Hall of Fame",
      },
      {
        label: "Courses",
        href: "/courses",
        icon: GraduationCap,
        tooltip: "Courses",
      },
      {
        label: "Schedule",
        href: "/schedule",
        icon: Calendar,
        tooltip: "Schedule",
      },
      { label: "Tryouts", href: "/tryouts", icon: Tally5, tooltip: "Try Outs" },
      {
        label: "Scholarships",
        href: "/scholarships",
        icon: Banknote,
        tooltip: "Scholarships",
      },
    ],
  },
  {
    group: "Himpunan",
    items: [
      { label: "Events", href: "/events", icon: Footprints, tooltip: "Events" },
      {
        label: "Announcements",
        href: "/announcements",
        icon: Megaphone,
        tooltip: "Announcements",
      },
    ],
  },
  {
    group: "Preferences",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        tooltip: "Settings",
        dev: false,
      },
    ],
  },
  {
    group: "Others",
    items: [
      { label: "Profile", href: "/profile", icon: User },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
];

export type TabsType = {
  courses: {
    id: string;
    title: string;
    classCode?: string;
    totalLessons: number;
    totalVideos: number;
  }[];
  announcements: {
    id: string;
    title: string;
    date: Date;
  }[];
  events: {
    id: string;
    title: string;
    date: Date;
  }[];
  scholarships: {
    id: string;
    title: string;
    date: Date;
  }[];
  tryouts: {
    id: string;
    title: string;
    classCode: string;
  }[];
};

// Helper type for the router prop
// Helper type for the common router and setOpen props
type SearchItemBaseProps = {
  router: AppRouterInstance;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

function CourseSearchItem({
  props,
  router,
  setOpen,
}: { props: TabsType["courses"][number] } & SearchItemBaseProps) {
  const handleSelect = () => {
    router.push(`/courses/${props.id}`);
    setOpen(false); // Close the command menu on selection
  };

  return (
    <CommandItem
      onSelect={handleSelect}
      className="cursor-pointer"
      value={[
        props.title,
        props.classCode ?? "",
        `${props.totalLessons} materials`,
        `${props.totalVideos} videos`,
        "course",
      ].join(" ")}
    >
      <GraduationCap className="mr-2 h-4 w-4 shrink-0" />
      <span className="truncate">{props.title}</span>
      <div className="text-muted-foreground ml-auto flex items-center gap-1.5 text-xs">
        <span className="bg-muted inline-flex items-center gap-1 rounded-md px-2 py-0.5">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>{props.totalLessons} materials</span>
        </span>
        <span className="bg-muted inline-flex items-center gap-1 rounded-md px-2 py-0.5">
          <SquarePlay className="h-3.5 w-3.5" />
          <span>{props.totalVideos} videos</span>
        </span>
      </div>
    </CommandItem>
  );
}

function AnnouncementSearchItem({
  props,
  router,
  setOpen,
}: { props: TabsType["announcements"][number] } & SearchItemBaseProps) {
  const handleSelect = () => {
    router.push(`/announcements?id=${props.id}`);
    setOpen(false);
  };

  return (
    <CommandItem
      onSelect={handleSelect}
      className="cursor-pointer"
      value={`${props.title} announcement`}
    >
      <Megaphone className="mr-2" />
      <span>{props.title}</span>
    </CommandItem>
  );
}

function EventSearchItem({
  props,
  router,
  setOpen,
}: { props: TabsType["events"][number] } & SearchItemBaseProps) {
  const handleSelect = () => {
    router.push(`/events?id=${props.id}`);
    setOpen(false);
  };

  return (
    <CommandItem
      onSelect={handleSelect}
      className="cursor-pointer"
      value={`${props.title} event`}
    >
      <Footprints className="mr-2" />
      <span>{props.title}</span>
    </CommandItem>
  );
}

function ScholarshipSearchItem({
  props,
  router,
  setOpen,
}: { props: TabsType["scholarships"][number] } & SearchItemBaseProps) {
  const handleSelect = () => {
    router.push(`/scholarships?id=${props.id}`);
    setOpen(false);
  };

  return (
    <CommandItem
      onSelect={handleSelect}
      className="cursor-pointer"
      value={`${props.title} scholarship`}
    >
      <Banknote className="mr-2" />
      <span>{props.title}</span>
    </CommandItem>
  );
}

function TryOutSearchItem({
  props,
  router,
  setOpen,
}: { props: TabsType["tryouts"][number] } & SearchItemBaseProps) {
  const handleSelect = () => {
    router.push(`/try-outs/${props.id}`);
    setOpen(false);
  };

  return (
    <CommandItem
      onSelect={handleSelect}
      className="cursor-pointer"
      value={`${props.title} ${props.classCode} tryout`}
    >
      <Tally5 className="mr-2" />
      <span>{props.title}</span>
      <p className="text-muted-foreground ml-auto">{props.classCode}</p>
    </CommandItem>
  );
}

const tabsItems: {
  [K in keyof TabsType]: (
    props: Record<"props", TabsType[K][number]> & SearchItemBaseProps,
  ) => JSX.Element;
} = {
  courses: CourseSearchItem,
  announcements: AnnouncementSearchItem,
  events: EventSearchItem,
  scholarships: ScholarshipSearchItem,
  tryouts: TryOutSearchItem,
};

/** Keeps `tabKey` and `items` in sync so we don't get a cross-tab props intersection. */
function SearchItemsForKey<K extends keyof TabsType>({
  tabKey,
  items,
  router,
  setOpen,
}: {
  tabKey: K;
  items: TabsType[K];
  router: AppRouterInstance;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  // Tab components are a union; assert ties `K` to the correct `props` shape for `tsc`.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- see comment above
  const Comp = tabsItems[tabKey] as (
    props: { props: TabsType[K][number] } & SearchItemBaseProps,
  ) => JSX.Element;
  return items.map((item) => (
    <Comp
      key={item.id + "-cmd-item-" + String(tabKey)}
      props={item}
      router={router}
      setOpen={setOpen}
    />
  ));
}

export default function SearchCMDK({ data }: { data: TabsType }) {
  const [open, setOpen] = useState(false);
  const pathName = usePathname();
  const firstPath = pathName.split("/")[1] as keyof TabsType;
  const primaryData = data[firstPath];
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div
        className="bg-card text-muted-foreground hidden cursor-pointer items-center rounded-md px-3 py-1.5 text-sm sm:flex"
        onClick={() => setOpen(true)}
      >
        <span className="mr-8">Search...</span>
        <Kbd>Ctrl K</Kbd>
      </div>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        showCloseButton={false}
        className="border-4 border-b-0"
      >
        <CommandInput placeholder="Search anything..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {primaryData && (
            <CommandGroup heading={firstPath} className="capitalize">
              <SearchItemsForKey
                tabKey={firstPath}
                items={primaryData}
                router={router}
                setOpen={setOpen}
              />
            </CommandGroup>
          )}
          {tabs.map((group) => (
            <CommandGroup
              heading={group.group}
              key={group.group + group.items[0]?.label}
            >
              {group.items.map((item) => (
                <CommandItem
                  key={item.label + "-cmd-item-" + group.group}
                  value={[
                    item.label,
                    item.tooltip ?? "",
                    item.href,
                    group.group,
                  ].join(" ")}
                  // asChild
                  onSelect={() => {
                    // Close the dialog when user selects
                    router.push(item.href);
                    setOpen(false);
                  }}
                >
                  <item.icon />
                  {item.label}
                  <span className="text-muted-foreground ml-auto">Tab</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          {(Object.keys(data) as (keyof TabsType)[]).map((label) => {
            if (label === firstPath) return null;
            return (
              <CommandGroup
                key={String(label) + "-cmd-group"}
                heading={String(label)}
                className="capitalize"
              >
                <SearchItemsForKey
                  tabKey={label}
                  items={data[label]}
                  router={router}
                  setOpen={setOpen}
                />
              </CommandGroup>
            );
          })}
        </CommandList>
        <div className="bg-border text-muted-foreground flex items-center gap-2 px-3 py-3 text-xs">
          <Kbd className="bg-card">
            <CornerDownLeft className="h-3 w-3" />
          </Kbd>
          <span className="">Go to page</span>
          <Kbd className="bg-card ml-4">Esc</Kbd>
          <span className="">Close</span>
        </div>
      </CommandDialog>
    </>
  );
}
