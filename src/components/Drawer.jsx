import React from "react";
import { Button, Label, TextInput, Popover } from "flowbite-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STORAGE_KEY = "iframe_links_v1";

/** Random ID generator (prefers crypto.randomUUID) */
function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `id_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/** Ensures every link has an id (migrates old storage format). */
function ensureIds(list) {
  let changed = false;
  const next = (Array.isArray(list) ? list : []).map((l) => {
    if (l && typeof l === "object" && l.id) return l;
    changed = true;
    return { ...l, id: makeId() };
  });
  return { next, changed };
}

/** Consistent name key for duplicate checks */
function canonicalizeName(name) {
  return (name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

/** Trim + auto-add https:// if scheme missing */
function normalizeUrl(input) {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  // If it already has a scheme (http, https, ftp, etc.), keep it.
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw)) return raw;
  // Protocol-relative URLs like //example.com -> https://example.com
  if (raw.startsWith("//")) return `https:${raw}`;
  return `https://${raw}`;
}

export default function Drawer() {
  const [selectedLink, setSelectedLink] = React.useState(null);

  const [isOpen, setIsOpen] = React.useState(false);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [viewCode, setViewCode] = React.useState("list");

  const [links, setLinks] = React.useState([]);
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [iconUrl, setIconUrl] = React.useState("");
  const [error, setError] = React.useState("");

  // When editing, we store the link id here. null = adding new.
  const [editingId, setEditingId] = React.useState(null);

  const toggleDrawer = () => setIsOpen((v) => !v);

  const resetForm = React.useCallback(() => {
    setEditingId(null);
    setName("");
    setUrl("");
    setIconUrl("");
    setError("");
  }, []);

  const startEdit = React.useCallback((link) => {
    setEditingId(link.id);
    setName(link.name ?? "");
    setUrl(link.url ?? "");
    setIconUrl(link.iconUrl ?? "");
    setIsFormOpen(true);
  }, []);

  return (
    <div className="w-screen h-screen relative">
      <div
        className={`w-full sm:w-[calc(100%-50px)] h-screen absolute top-0 right-0 ${
          popoverOpen ? "-z-20" : ""
        }`}
      >
        {selectedLink ? (
          <>
            <p className="text-sm italic font-semibold text-gray-800 text-center">
              {selectedLink.name} -- {selectedLink.url}
            </p>
            <iframe
              src={selectedLink ? selectedLink.url : "about:blank"}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              className="w-full border-0"
              style={{ height: "calc(100% - 20px)" }}
            ></iframe>
          </>
        ) : (
          <p className="text-sm italic font-semibold text-gray-800 text-center">
            Select a link
          </p>
        )}
      </div>
      <aside
        className={`w-full sm:w-[300px] md:w-[400px] h-screen ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-[calc(100%-50px)] sm:-translate-x-[250px] md:-translate-x-[350px]"
        } transition-transform duration-300 ehiddenase-in-out relative bg-slate-300 text-slate-900 dark:bg-gray-800 dark:text-slate-100 shadow-xl`}
      >
        {/* Drawer Edge */}
        <div className="w-[50px] h-full float-end flex flex-col justify-start items-center py-2 gap-2 bg-slate-400/30 dark:bg-gray-900/30 shadow-lg">
          <DrawerToggleButton onClick={toggleDrawer} isOpen={isOpen} />
          <DarkModeToggleButton />
          <TimerButton setPopoverOpen={setPopoverOpen} />
        </div>

        {/* Drawer Body */}
        <div className="h-screen" style={{ width: "calc(100% - 50px)" }}>
          {/* Drawer Header */}
          <div className="py-4 px-2 ">
            <h2 className="flex justify-start items-center gap-2 text-4xl font-bold dark:text-white">
              Channels
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                />
              </svg>
            </h2>
          </div>
          {/* Drawer Body  */}
          <div className="h-[calc(100vh-96px)] px-2 pb-4 flex flex-col gap-6 overflow-hidden">
            <DrawerForm
              {...{
                isFormOpen,
                setIsFormOpen,
                name,
                setName,
                url,
                setUrl,
                iconUrl,
                setIconUrl,
                error,
                setError,
                setLinks,
                links, // needed for duplicate-name check
                editingId,
                setEditingId,
                resetForm,
              }}
            />

            <hr
              className={`${
                isFormOpen ? "opacity-100" : "opacity-0"
              } transition-opacity duration-300 ease-in-out`}
            />

            <DrawerList
              {...{
                setIsOpen,
                isFormOpen,
                setIsFormOpen,
                links,
                setLinks,
                startEdit,
                resetForm,
                selectedLink,
                setSelectedLink,
                iconUrl,
                setIconUrl,
                viewCode,
                setViewCode,
              }}
            />
          </div>
        </div>
      </aside>
      <Overlay
        isOpen={isOpen}
        popoverOpen={popoverOpen}
        onClick={toggleDrawer}
      />
    </div>
  );
}

function DrawerToggleButton({ isOpen, className, ...props }) {
  const [animation, setAnimation] = React.useState(isOpen);

  React.useEffect(() => {
    const t = setTimeout(() => setAnimation(isOpen), 150);
    return () => clearTimeout(t);
  }, [isOpen]);

  return (
    <button
      {...props}
      className={`size-10 flex justify-center items-center rounded-full bg-slate-100 hover:bg-white dark:hover:bg-gray-600 dark:bg-gray-700 ${className} cursor-pointer`}
    >
      <svg
        id="drawer-toggle-icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className={`size-6 pointer-events-none transition-transform duration-300 ease-in-out ${
          animation ? "rotate-180" : ""
        }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
        />
      </svg>
    </button>
  );
}

function DarkModeToggleButton() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  function applyThemeFromStorage() {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;
    document.body.classList.toggle("dark", shouldUseDark);
    setIsDarkMode(shouldUseDark);
  }

  function toggleTheme() {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.body.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }

  React.useEffect(() => {
    applyThemeFromStorage();
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="size-10 overflow-hidden rounded-full bg-slate-100 hover:bg-white dark:hover:bg-gray-600 dark:bg-gray-700 cursor-pointer"
    >
      <div
        className={`w-10 h-20 relative ${
          isDarkMode ? "" : "rotate-180"
        } transition-transform duration-300 ease-in-out`}
      >
        {/* sun */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 absolute top-2 left-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>

        {/* moon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 absolute top-12 left-2 rotate-180"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      </div>
    </button>
  );
}

function TimerButton({ setPopoverOpen }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          setPopoverOpen(open);
        }}
        placement="left"
        content={
          <div className="flex w-64 flex-col gap-4 p-4 text-sm text-gray-500 dark:text-gray-400 ">
            <div>
              <h2 className="text-base text-gray-500">Area (sqft)</h2>
              <div className="mb-2 block">
                <Label htmlFor="minsqft">Minimum sqft</Label>
              </div>
              <TextInput id="minsqft" type="number" />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="maxsqft">Maximum sqft</Label>
              </div>
              <TextInput id="maxsqft" type="number" />
            </div>
            <div className="flex gap-2">
              <Button color="gray">Reset</Button>
              <Button color="success" onClick={() => setOpen(false)}>
                Save
              </Button>
            </div>
          </div>
        }
      >
        <button className="size-10 flex justify-center items-center rounded-full bg-slate-100 hover:bg-white dark:hover:bg-gray-600 dark:bg-gray-700 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </button>
      </Popover>
    </>
  );
}

function Overlay({ isOpen, popoverOpen, className, ...props }) {
  const [animation, setAnimation] = React.useState(isOpen);
  const [show, setShow] = React.useState(isOpen);

  React.useEffect(() => {
    let t1, t2;
    if (isOpen || popoverOpen) {
      setShow(true);
      t1 = setTimeout(() => setAnimation(true), 50);
    } else {
      setAnimation(false);
      t2 = setTimeout(() => setShow(false), 350);
    }
    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [isOpen, popoverOpen]);

  return (
    <div
      className={`w-0 ${
        popoverOpen && !isOpen
          ? "w-[calc(100vw-50px)] -z-10"
          : "sm:w-[calc(100vw-300px)] md:w-[calc(100vw-400px)]"
      } absolute top-0 right-0  bg-gray-400/60 h-screen  ${
        show ? "block" : "hidden"
      } ${
        animation ? "opacity-100" : "opacity-0"
      } transition-all duration-300 ease-in-out ${className}`}
      {...props}
    />
  );
}

function DrawerForm({
  isFormOpen,
  setIsFormOpen,
  name,
  setName,
  url,
  setUrl,
  error,
  setError,
  setLinks,
  links, // for duplicate checks
  editingId,
  setEditingId,
  resetForm,
  iconUrl,
  setIconUrl,
}) {
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 5000);
  };

  const hasDuplicateName = (candidateName, exceptId) => {
    const key = canonicalizeName(candidateName);
    if (!key) return false;
    return links.some(
      (l) => canonicalizeName(l.name) === key && l.id !== exceptId
    );
  };

  const upsertLink = (incomingName, incomingUrl, incomingIconUrl) => {
    const cleanName = (incomingName ?? "").trim().replace(/\s+/g, " ");
    const cleanUrl = normalizeUrl(incomingUrl);
    const cleanIconUrl = normalizeUrl(incomingIconUrl);

    if (!cleanName || !cleanUrl) {
      showError("Name and URL are required.");
      return false;
    }

    // Duplicate-name rule: prevent duplicates (case-insensitive), except self while editing.
    if (hasDuplicateName(cleanName, editingId)) {
      showError(
        "Display name already exists (duplicate names are not allowed)."
      );
      return false;
    }

    // Respect TextInput type="url" by ensuring it becomes a valid-looking absolute URL.
    // normalizeUrl already adds https:// but we can sanity-check quickly:
    try {
      new URL(cleanUrl);
    } catch {
      showError("Please enter a valid URL.");
      console.error("Invalid URL:", cleanUrl);
      return false;
    }

    try {
      new URL(cleanIconUrl);
    } catch {
      showError("Please enter a valid icon URL.");
      console.error("Invalid icon URL:", cleanIconUrl);
      return false;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    const { next: withIds, changed } = ensureIds(parsed);

    let next;
    if (editingId) {
      next = withIds.map((l) =>
        l.id === editingId
          ? { ...l, name: cleanName, url: cleanUrl, iconUrl: cleanIconUrl }
          : l
      );
      setEditingId(null);
    } else {
      next = [
        ...withIds,
        { id: makeId(), name: cleanName, url: cleanUrl, iconUrl: cleanIconUrl },
      ];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setLinks(next);

    // (optional) if failed migration before, this ensures storage is consistent.
    if (changed) {
      // already saved above
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = upsertLink(name, url, iconUrl);
    if (ok) {
      setName("");
      setUrl("");
      setIconUrl("");
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    resetForm();
  };

  const handleCancelEdit = (e) => {
    e.preventDefault();
    resetForm();
    // keep form open (so user can add something new) — change to false if you prefer:
    // setIsFormOpen(false);
  };

  return (
    <form
      className={`flex max-w-md flex-col gap-4 ${
        isFormOpen ? (error.length > 0 ? "h-[451px]" : "h-[393px]") : "h-0"
      } overflow-hidden transition-all duration-400 ease-in-out`}
      onSubmit={handleSubmit}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl italic font-semibold text-gray-900 dark:text-white">
          {editingId ? "Edit link" : "Add link"}
        </h3>
        <button
          type="button"
          className="size-8 flex justify-center items-center rounded-full bg-gray-50 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700"
          title="Collapse/expand form"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 18.75 7.5-7.5 7.5 7.5"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 7.5-7.5 7.5 7.5"
            />
          </svg>
        </button>
      </div>

      <div>
        <div className="mb-2 block">
          <Label htmlFor="display_name">Display Name</Label>
        </div>
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          id="display_name"
          type="text"
          required
        />
      </div>

      <div>
        <div className="mb-2 block">
          <Label htmlFor="icon_url">Icon URL</Label>
        </div>
        <TextInput
          value={iconUrl}
          onChange={(e) => setIconUrl(e.target.value)}
          id="icon_url"
          type="text"
          required
        />
      </div>

      <div>
        <div className="mb-2 block">
          <Label htmlFor="url">URL</Label>
        </div>
        <TextInput
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          id="url"
          type="url"
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tip: if you omit the protocol (example.com), it will be saved as
          https://example.com
        </p>
      </div>

      {error && <div className="text-red-500 text-sm font-bold">{error}</div>}

      <div className="flex justify-evenly items-center">
        <Button type="submit" pill outline className="cursor-pointer font-bold">
          {editingId ? "Save" : "Add"}
        </Button>

        <Button
          pill
          outline
          className={`${name || url ? "" : "hidden"} ${
            editingId === null ? "" : "hidden"
          } cursor-pointer font-bold`}
          color={"red"}
          onClick={handleReset}
        >
          Reset
        </Button>

        {/* Cancel edit only when editing */}
        <Button
          pill
          outline
          color={"gray"}
          className={`${editingId ? "" : "hidden"} cursor-pointer font-bold`}
          onClick={handleCancelEdit}
        >
          Cancel edit
        </Button>
      </div>
    </form>
  );
}

function DrawerList({
  setIsOpen,
  isFormOpen,
  setIsFormOpen,
  links,
  setLinks,
  startEdit,
  resetForm,
  selectedLink,
  setSelectedLink,
  viewCode,
  setViewCode,
  // iconUrl,
  // setIconUrl,
}) {
  function loadLinks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const { next, changed } = ensureIds(parsed);
        setLinks(next);
        if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } else {
        const seeded = [
          {
            id: "3c62d5dd-b656-4d6b-b6a9-010ad3820f3d",
            name: "MBC 1",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=mbc1",
            iconUrl: "https://www.elahmad.com/tv/mobiletv/images/mbc1.jpg?v=7",
          },
          {
            id: "3fcf7faa-6d76-4ac7-be3c-94770fa4ccdd",
            name: "MBC 2",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=mbc2",
            iconUrl: "https://www.elahmad.com/tv/mobiletv/images/mbc2.jpg",
          },
          {
            id: "0d555225-ee49-4534-9790-8472ffa4b48a",
            name: "MBC 3",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=mbc3",
            iconUrl: "https://www.elahmad.com/tv/mobiletv/images/mbc3.jpg",
          },
          {
            id: "4bc0dc98-8672-45ff-a124-6fe3896035e3",
            name: "MBC 4",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=mbc4",
            iconUrl: "https://www.elahmad.com/tv/mobiletv/images/mbc4.jpg",
          },
          {
            id: "3dc34409-5cb9-4054-a87a-c2c1ea3a03c8",
            name: "MBC 5",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=mbc5",
            iconUrl: "https://www.elahmad.com/tv/mobiletv/images/mbc5.jpg",
          },
          {
            id: "d75934a1-f1d0-4a99-aadf-acafeb823288",
            name: "MBC Drama",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=mbc_drama",
            iconUrl: "https://www.elahmad.com/tv/mobiletv/images/mbc_drama.jpg",
          },
          {
            id: "6fe29151-320b-49a3-aa8c-9f2a51490c2e",
            name: "MBC Drama Plus",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=mbc_drama_plus",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/mbc_drama_plus.jpg",
          },
          {
            id: "8ac9e906-7387-42fd-9d68-1e81b1121468",
            name: "MBC Maser",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=mbc_masr",
            iconUrl: "https://www.elahmad.com/tv/mobiletv/images/mbc_masr.jpg",
          },
          {
            id: "a9fe8296-7ac5-459f-ad24-dbd80552bc61",
            name: "MBC Maser 2",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=mbc_masr2",
            iconUrl: "https://www.elahmad.com/tv/mobiletv/images/mbc_masr2.jpg",
          },
          {
            id: "65fab3f7-b944-498c-9e2b-cbf4d1c4936e",
            name: "MBC Max",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=mbc_max",
            iconUrl: "https://www.elahmad.com/tv/mobiletv/images/mbc-max.jpg",
          },
          {
            id: "7da5d5f5-f4aa-43b7-a90a-4ddb1a5cfc56",
            name: "MBC Action",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=mbc_action",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/mbc_action.jpg",
          },
          {
            id: "60939b1c-d433-41b4-8abe-a3df9d9318b6",
            name: "MBC Variety",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=mbc_variety",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/mbc_variety.jpg",
          },
          {
            id: "b4788897-cf49-49d2-9b33-5617d1510ba6",
            name: "CN Arabic",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=cnarabia",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/CartoonNetwork.jpg?v=7",
          },
          {
            id: "ba1cfb36-76a3-4e72-a653-41c969395c3e",
            name: "spacetoon",
            url: "https://www.elahmad.com/tv/mobiletv/glarb.php?id=spacetoon",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/spacetoon.jpg?v=7",
          },
          {
            id: "b408e229-a9c0-4abb-a99a-0e706f4f1e55",
            name: "Rotana Cinema",
            url: "https://www.elahmad.com/tv/live/channels.php?id=954",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/rotana_cinema.jpg?v=7",
          },
          {
            id: "1a39c637-9612-4e28-95e6-3326d510b19e",
            name: "Rotana Classic",
            url: "https://www.elahmad.com/tv/watchtv.php?id=rotana_classic",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/rotana_classic.jpg?v=7",
          },
          {
            id: "ebc21434-94f9-46ea-8708-41e42360e204",
            name: "Rotana Aflam+",
            url: "https://www.elahmad.com/tv/mobiletv/glarb.php?id=rotana_aflam",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/rotana_aflam_plus.jpg?v=7",
          },
          {
            id: "ecf83f17-8bee-4052-bb2d-15940dda7146",
            name: "Rotana Comedy",
            url: "https://www.elahmad.com/tv/watchtv.php?id=rotana_comedy",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/rotana_comedy.jpg?v=7",
          },
          {
            id: "a850646f-9a54-4b83-b799-ab00736358ff",
            name: "Aljazeer",
            url: "https://www.elahmad.com/tv/radiant.php?id=aljazeer_ar1",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/aljazeera.jpg?v=7",
          },
          {
            id: "f9ee4743-c0dd-439c-8360-c6257a88dbfb",
            name: "Aljazeera doc",
            url: "https://www.elahmad.com/tv/radiant.php?id=aljazeeradoc1",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/aljazeera_documentaire.jpg?v=7",
          },
          {
            id: "5b23ff0e-a6b3-490b-9acf-3c5de7784b26",
            name: "AL arabiya",
            url: "https://www.elahmad.com/tv/radiant.php?id=alarabiya1",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/alarabiya.jpg?v=7",
          },
          {
            id: "1f253aa9-201f-459a-9408-8c82555af650",
            name: "AL arabiya AL-hadath",
            url: "https://www.elahmad.com/tv/radiant.php?id=alarabiya_alhadath1",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/al_arabiya_alhadath.jpg?v=7",
          },
          {
            id: "e8be3b7a-5440-4ad5-9ec5-581f4cefe08e",
            name: "Dubai one",
            url: "https://www.elahmad.com/tv/radiant.php?id=dubaione",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/dubai_one.jpg?v=7",
          },
          {
            id: "e72085d6-b79e-45f6-8288-09d0458bc1e0",
            name: "Nat Geo Abu Dhabi",
            url: "https://www.elahmad.com/tv/radiant.php?id=natgeo_1",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/national_geographic.jpg?v=7",
          },
          {
            id: "fb3f8cd0-a0b4-4078-9ca6-5df95cf7c83e",
            name: "Roya TV",
            url: "https://www.elahmad.com/tv/radiant.php?id=royatv1",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/royatv.jpg?v=7",
          },
          {
            id: "f93fc55f-ed59-4da4-9d95-255ac022c648",
            name: "Syria 2",
            url: "https://www.elahmad.com/tv/radiant.php?id=syriatv1",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/syria_althania.jpg?v=7",
          },
          {
            id: "6e2c9454-ec75-4ba2-b3a3-850d45da88b1",
            name: "Syria",
            url: "https://www.elahmad.com/tv/mobiletv/glarb.php?id=syria_tv",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/syria_tv.jpg?v=7",
          },
          {
            id: "5e4f44d5-992c-4ff9-bdc7-3054d4d3755e",
            name: "Lana TV",
            url: "https://www.elahmad.com/tv/watchtv.php?id=lanatv",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/lana_syria.jpg?v=7",
          },
          {
            id: "153b6dc6-7fe9-4543-b7ed-ca831f4644a6",
            name: "ALikhbaria Syria",
            url: "https://www.elahmad.com/tv/mobiletv/glarb.php?id=alikhbaria_syria1",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/alikhbaria_syria.jpg?v=7",
          },
          {
            id: "e6b0468d-0c32-4b68-915c-62e970fe5503",
            name: "Aljadeed",
            url: "https://www.elahmad.com/tv/live/shahid_shaka.php?id=aljadeed",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/aljadeed_tv.jpg?v=7",
          },
          {
            id: "0bf51a6f-0e55-4f34-a464-8b88b1fbe1e1",
            name: "MTV lebanon",
            url: "https://www.elahmad.com/tv/watchtv.php?id=mtv_lebanon",
            iconUrl: "https://www.elahmad.com/tv/mobiletv/images/mtv.jpg?v=7",
          },
          {
            id: "92fcbe91-8608-44ac-b5d6-47d3422821ba",
            name: "ON-TV",
            url: "https://www.elahmad.com/tv/radiant.php?id=ontv1",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/ontveg.jpg?v=7",
          },
          {
            id: "4f148088-d7cf-4b11-a3c1-4027531373c3",
            name: "TRT arabic",
            url: "https://www.elahmad.com/tv/radiant.php?id=trt_arabic1",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/trt_arabic.jpg?v=7",
          },
          {
            id: "0a645842-0b9c-49ba-8fb4-fca684165f9c",
            name: "RT arabic",
            url: "https://www.elahmad.com/tv/radiant.php?id=rt_ar1",
            iconUrl:
              "https://www.elahmad.com/tv/mobiletv/images/russia_today.jpg?v=7",
          },
          {
            id: "9d201972-0663-4420-87d6-96da5d97e3d2",
            name: "DW arabic",
            url: "https://www.elahmad.com/tv/radiant.php?id=dw_ar",
            iconUrl: "https://www.elahmad.com/tv/mobiletv/images/dw.jpg?v=7",
          },
        ];
        // const seeded = Array.from({ length: 10 }, (_, i) => ({
        //   id: makeId(),
        //   name: `Link ${i + 1}`,
        //   url: `https://link${i + 1}.com`,
        // }));
        // setLinks(seeded);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      }
    } catch (e) {
      console.warn("Failed to load from localStorage, starting empty.", e);
      setLinks([]);
    }
  }

  React.useEffect(() => {
    loadLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLinks((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === active.id);
      const newIndex = prev.findIndex((l) => l.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const next = arrayMove(prev, oldIndex, newIndex);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const ids = React.useMemo(() => links.map((l) => l.id), [links]);

  React.useEffect(() => {
    // get view from local
    const view = localStorage.getItem("viewCode");
    if (view) {
      setViewCode(view);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex justify-start items-center gap-2">
          <h2 className=" text-xl italic font-semibold text-gray-900 dark:text-white">
            Saved Links
          </h2>
          <div>
            {/* set view to list button  */}
            <button
              className={`${
                viewCode === "list" ? "hidden" : ""
              } bg-slate-100 hover:bg-white dark:hover:bg-gray-600 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-full size-8 flex justify-center items-center cursor-pointer`}
              onClick={() => {
                setViewCode("list");
                // save view to local
                localStorage.setItem("viewCode", "list");
              }}
              title="List View"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </button>
            {/* set view to grid button  */}
            <button
              className={`${
                viewCode === "grid" ? "hidden" : ""
              } bg-slate-100 hover:bg-white dark:hover:bg-gray-600 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-full size-8 flex justify-center items-center cursor-pointer`}
              onClick={() => {
                setViewCode("grid");
                // save view to local
                localStorage.setItem("viewCode", "grid");
              }}
              title="Grid View"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2">
          <span className="bg-slate-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-full size-8 flex justify-center items-center text-xs">
            {links.length}
          </span>

          <button
            type="button"
            className={`${
              isFormOpen ? "hidden" : ""
            } bg-slate-100 hover:bg-white dark:hover:bg-gray-600 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-full size-8 flex justify-center items-center cursor-pointer`}
            title="Add a new link"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div
            className={`flex-1 min-h-0 overflow-y-auto no-scrollbar text-gray-500 dark:text-gray-300 ${
              viewCode === "list" && "space-y-2 py-2"
            } ${viewCode === "grid" && "grid grid-cols-2 gap-2 p-2"}`}
          >
            {links.map((l) => (
              <SortableDrawerListItem
                setIsOpen={setIsOpen}
                key={l.id}
                id={l.id}
                link={l}
                setIsFormOpen={setIsFormOpen}
                startEdit={startEdit}
                setLinks={setLinks}
                selectedLink={selectedLink}
                setSelectedLink={setSelectedLink}
                viewCode={viewCode}
                // iconUrl={iconUrl}
                // setIconUrl={setIconUrl}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}

function SortableDrawerListItem({
  setIsOpen,
  id,
  link,
  setIsFormOpen,
  startEdit,
  setLinks,
  selectedLink,
  setSelectedLink,
  viewCode,
  // iconUrl,
  // setIconUrl,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {viewCode === "list" && (
        <DrawerListItem
          setIsOpen={setIsOpen}
          link={link}
          setIsFormOpen={setIsFormOpen}
          startEdit={startEdit}
          setLinks={setLinks}
          dragHandleProps={{ ...attributes, ...listeners }}
          selectedLink={selectedLink}
          setSelectedLink={setSelectedLink}
          // iconUrl={iconUrl}
          // setIconUrl={setIconUrl}
        />
      )}
      {viewCode === "grid" && (
        <DrawerGridItem
          setIsOpen={setIsOpen}
          link={link}
          setIsFormOpen={setIsFormOpen}
          startEdit={startEdit}
          setLinks={setLinks}
          dragHandleProps={{ ...attributes, ...listeners }}
          selectedLink={selectedLink}
          setSelectedLink={setSelectedLink}
          // iconUrl={iconUrl}
          // setIconUrl={setIconUrl}
        />
      )}
    </div>
  );
}

function DrawerListItem({
  setIsOpen,
  link,
  setIsFormOpen,
  startEdit,
  setLinks,
  dragHandleProps,
  // selectedLink,
  setSelectedLink,
}) {
  const { id, name, url, iconUrl } = link;

  const handleEdit = (e) => {
    e.stopPropagation();
    startEdit(link);
    setIsFormOpen(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    const ok = window.confirm("Delete this link?");
    if (!ok) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const { next: withIds } = ensureIds(parsed);
    const filtered = withIds.filter((l) => l.id !== id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    setLinks(filtered);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedLink(link);
    setIsOpen(false);
  };

  return (
    <div
      data-id={id}
      data-name={name}
      data-url={url}
      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white flex justify-between items-center select-none cursor-pointer"
      onClick={handleSelect}
    >
      <div className="min-w-0 flex items-center ">
        <img
          src={iconUrl}
          alt={name}
          className="w-8 h-8 rounded-full mr-2"
          style={{ objectFit: "contain" }}
        />
        <div>
          <h4 className="font-semibold text-sm mb-1 line-clamp-1" title={name}>
            {name}
          </h4>
          <p
            className="text-xs text-gray-600 dark:text-gray-300 break-all line-clamp-1"
            title={url}
          >
            {url}
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center gap-1">
        <button
          type="button"
          className="text-blue-600 hover:text-white hover:bg-blue-600 rounded-md p-1"
          onClick={handleEdit}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
        </button>

        <button
          type="button"
          className="text-red-600 hover:text-white hover:bg-red-600 rounded-md p-1"
          onClick={handleDelete}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>

        <button
          type="button"
          className="drag-handle text-gray-500 cursor-move hover:text-white hover:bg-gray-400 dark:hover:bg-gray-500 rounded-md p-1"
          onClick={(e) => e.stopPropagation()}
          {...dragHandleProps}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 9h16.5m-16.5 6.75h16.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function DrawerGridItem({
  setIsOpen,
  link,
  setIsFormOpen,
  startEdit,
  setLinks,
  // dragHandleProps,
  setSelectedLink,
}) {
  const { id, name, url, iconUrl } = link;

  const doDelete = () => {
    const ok = window.confirm(`Delete "${name}"?`);
    if (!ok) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const { next: withIds } = ensureIds(parsed);
    const filtered = withIds.filter((l) => l.id !== id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    setLinks(filtered);
  };

  const doEdit = () => {
    startEdit(link);
    setIsFormOpen(true);
  };

  const handleSelect = () => {
    console.log("selected", link);
    setSelectedLink(link);
    setIsOpen(false);
  };

  // Right-click / long-press friendly "no visible buttons" actions
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Minimal, buttonless UX using prompt. Swap with a nicer popover later if you want.
    const choice = window.prompt(
      `Actions for "${name}":\nE = edit\nD = delete\n(Anything else cancels)`,
      "E"
    );

    const c = (choice ?? "").trim().toLowerCase();
    if (c === "e") doEdit();
    if (c === "d") doDelete();
  };

  // Mobile long-press
  const pressRef = React.useRef(null);
  const onPointerDown = (e) => {
    // only long-press for touch/pen; mouse already has context menu
    if (e.pointerType === "mouse") return;
    pressRef.current = window.setTimeout(() => {
      // fake a context action without needing coordinates
      const choice = window.prompt(
        `Actions for "${name}":\nE = edit\nD = delete\n(Anything else cancels)`,
        "E"
      );
      const c = (choice ?? "").trim().toLowerCase();
      if (c === "e") doEdit();
      if (c === "d") doDelete();
    }, 520);
  };

  const onPointerUpOrCancel = () => {
    if (pressRef.current) {
      clearTimeout(pressRef.current);
      pressRef.current = null;
    }
  };

  return (
    <div
      data-id={id}
      data-name={name}
      data-url={url}
      title={name}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        doEdit();
      }}
      onContextMenu={handleContextMenu}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUpOrCancel}
      onPointerCancel={onPointerUpOrCancel}
      className="
        group relative select-none aspect-square w-full rounded-xl bg-gray-100 dark:bg-gray-700 ring-1 ring-black/5  dark:ring-white/10 hover:ring-2 hover:ring-blue-500/60 transition cursor-pointer overflow-hidden
      "
      // Make the whole tile a drag handle (no visible handle needed)
      // {...dragHandleProps}
    >
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={iconUrl}
          alt={name}
          className="
            w-[70%] sm:w-[60%] 
            rounded-2xl
            object-cover
          "
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>

      {/* Hover label (optional, still “no buttons”) */}
      <div
        className="
          absolute inset-x-0 bottom-0
          translate-y-2 opacity-0
          group-hover:translate-y-0 group-hover:opacity-100
          transition
          p-2
        "
      >
        <div
          className="
            w-full rounded-lg
            bg-black/55 backdrop-blur
            text-white text-xs font-semibold
            px-2 py-1
            line-clamp-1
          "
        >
          {name}
        </div>
      </div>

      {/* <button
        type="button"
        className="drag-handle text-gray-500 cursor-move hover:text-white hover:bg-gray-400 dark:hover:bg-gray-500 rounded-md p-1 absolute top-2 right-2"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onPointerCancel={(e) => e.stopPropagation()}
        {...dragHandleProps}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9h16.5m-16.5 6.75h16.5"
          />
        </svg>
      </button> */}
    </div>
  );
}
