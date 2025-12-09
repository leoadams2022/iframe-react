import React from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Label, TextInput, Popover } from "flowbite-react";
const STORAGE_KEY = "iframe_links_v1";

const topbarButtonClass =
  "size-6 flex justify-center items-center rounded-full cursor-pointer bg-slate-100 hover:bg-white dark:hover:bg-gray-600 dark:bg-gray-700";
/* eslint-disable react-refresh/only-export-components */
// StateManger.jsx

const StateMangerContext = React.createContext(undefined);

export function StateMangerProvider({ children }) {
  // ✅ exposed states
  const [links, setLinks] = React.useState([]);
  const [selectedLink, setSelectedLink] = React.useState(null);
  const [lastSelectedLink, setLastSelectedLink] = React.useState(null);
  const [editingId, setEditingId] = React.useState(null);
  const [showTopBar, setShowTopBar] = React.useState(true);
  const [activeScreen, setActiveScreen] = React.useState(null);
  //   const [showForm, setShowForm] = React.useState(false);
  //   const [showChannels, setShowChannels] = React.useState(false);
  const [armedId, setArmedId] = React.useState(null);

  const value = React.useMemo(
    () => ({
      links,
      setLinks,
      selectedLink,
      setSelectedLink,
      lastSelectedLink,
      setLastSelectedLink,
      editingId,
      setEditingId,
      //   showForm,
      //   setShowForm,
      showTopBar,
      setShowTopBar,
      activeScreen,
      setActiveScreen,
      //   showChannels,
      //   setShowChannels,
      armedId,
      setArmedId,
    }),
    [
      links,
      selectedLink,
      lastSelectedLink,
      editingId,
      //   showForm,
      showTopBar,
      activeScreen,
      //   showChannels,
      armedId,
    ]
  );

  return (
    <StateMangerContext.Provider value={value}>
      {children}
    </StateMangerContext.Provider>
  );
}

export function useStateManger() {
  const ctx = React.useContext(StateMangerContext);
  if (!ctx) {
    throw new Error("useStateManger must be used within a StateMangerProvider");
  }
  return ctx;
}

export default function Drawer() {
  return (
    <StateMangerProvider>
      <DrawerUnderContext />
    </StateMangerProvider>
  );
}

function DrawerUnderContext() {
  const {
    links,
    selectedLink,
    setSelectedLink,
    lastSelectedLink,
    setLastSelectedLink,
    showTopBar,
    activeScreen,
    setActiveScreen,
  } = useStateManger();
  return (
    <div className=" w-svw h-svh relative ">
      <h1 className="text-5xl font-bold text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        Pick-a-Channel
      </h1>
      <iframe
        //  ${selectedLink ? "block" : "hidden"}
        className={`${
          selectedLink ? "block" : "hidden"
        } w-full h-[calc(100%-32px)]  absolute bottom-0 left-0 border-0`}
        src={selectedLink ? selectedLink.url : "about:blank"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
      {/* top bar  */}
      <div
        className={`${
          showTopBar ? "block" : "hidden"
        } w-full h-8 flex justify-evenly items-center absolute top-0 left-0 bg-slate-300 text-slate-900 dark:bg-gray-800 dark:text-slate-100 shadow-xl`}
      >
        {/* channels button  */}
        <button
          className={topbarButtonClass}
          onClick={() => {
            setActiveScreen("channels");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
            />
          </svg>
        </button>
        {/* theme toggle button */}
        <DarkModeToggleButton />
        {/* add button  */}
        <button
          className={topbarButtonClass}
          onClick={() => {
            setActiveScreen("form");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </button>
        <div className="flex items-center justify-evenly gap-4">
          {/* priveos channel */}
          <button
            className={
              topbarButtonClass +
              " " +
              (selectedLink ? "" : "hidden") +
              " " +
              (0 === links.findIndex((l) => l.id === selectedLink?.id)
                ? "hidden"
                : "")
            }
            onClick={() => {
              const currentIndex = links.findIndex(
                (l) => l.id === selectedLink?.id
              );
              const nextLink =
                currentIndex <= links.length - 1
                  ? links[currentIndex - 1]
                  : undefined;

              if (nextLink) {
                setLastSelectedLink(selectedLink);
                setSelectedLink(nextLink);
              } else {
                alert("No more channels");
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
              />
            </svg>
          </button>
          {/* go back channel  */}
          {lastSelectedLink && (
            <button
              onClick={() => {
                setLastSelectedLink(selectedLink);
                setSelectedLink(lastSelectedLink);
              }}
              className={`px-1 rounded-full cursor-pointer bg-slate-100 hover:bg-white dark:hover:bg-gray-600 dark:bg-gray-700 flex justify-center items-center gap-1`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
              <p className="text-xs">{lastSelectedLink.name}</p>
            </button>
          )}
          {selectedLink && (
            <button
              className={`px-1 rounded-full cursor-pointer bg-slate-100 hover:bg-white dark:hover:bg-gray-600 dark:bg-gray-700 flex justify-center items-center gap-1`}
            >
              <p className="text-xs">{selectedLink.name}</p>
            </button>
          )}
          {/* next channel */}
          <button
            className={
              topbarButtonClass +
              " " +
              (selectedLink ? "" : "hidden") +
              " " +
              (links.length - 1 ===
              links.findIndex((l) => l.id === selectedLink?.id)
                ? "hidden"
                : "")
            }
            onClick={() => {
              const currentIndex = links.findIndex(
                (l) => l.id === selectedLink?.id
              );
              const nextLink =
                currentIndex >= 0 ? links[currentIndex + 1] : undefined;

              if (nextLink) {
                setLastSelectedLink(selectedLink);
                setSelectedLink(nextLink);
              } else {
                alert("No more channels");
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* channels  */}
      {activeScreen === "channels" && <Channels />}
      {activeScreen === "form" && <Form />}
    </div>
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
      className={
        "size-6 rounded-full cursor-pointer bg-slate-100 hover:bg-white dark:hover:bg-gray-600 dark:bg-gray-700" +
        " overflow-hidden text-slate-900 dark:text-slate-100"
      }
    >
      <div
        className={`w-6 h-12 relative ${
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
          className="size-4 absolute top-1 left-1"
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
          className="size-4 absolute top-7 left-1 rotate-180"
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

// ! Channels-------------------------------------------------------------------------------------------------------------------

// helpers functions
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

function Channels() {
  const {
    setLinks,
    // showChannels,
    // setShowChannels,
    activeScreen,
    setActiveScreen,
    // showForm,
    // setShowForm,
  } = useStateManger();
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
  return (
    <div
      className={`size-full absolute top-0 left-0 flex justify-center items-center  bg-white/50 dark:bg-gray-500/50  ${
        activeScreen === "channels" ? "block" : "hidden"
      }`}
      onClick={() => setActiveScreen(null)}
    >
      <div
        className={`size-[90%] relative p-2 overflow-y-auto rounded-lg bg-slate-300 text-slate-900 dark:bg-gray-800 dark:text-slate-100 border border-gray-600 dark:border-gray-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* close button   */}
        <button
          className={
            topbarButtonClass +
            " absolute top-1 right-1 bg-slate-300 text-slate-900 dark:bg-gray-800 dark:text-slate-100"
          }
          onClick={() => setActiveScreen(null)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
        {/* channels grid  */}
        <DndGrid />
      </div>
    </div>
  );
}

function DndGrid() {
  const { links, setLinks } = useStateManger();
  // ✅ which item is currently "pressed/armed" for drag (during long-press delay)
  const { setArmedId } = useStateManger();
  const justDraggedRef = React.useRef(false);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  function onDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(links, oldIndex, newIndex);
    setLinks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => {
        setArmedId(null);
        justDraggedRef.current = true;
      }}
      onDragCancel={() => {
        setArmedId(null);
        requestAnimationFrame(() => (justDraggedRef.current = false));
      }}
      onDragEnd={(e) => {
        setArmedId(null);
        onDragEnd(e);
        requestAnimationFrame(() => (justDraggedRef.current = false));
      }}
    >
      <SortableContext
        items={links.map((l) => l.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-4 gap-4 p-4">
          {links.map((link) => (
            <SortableGridItem key={link.id} id={link.id}>
              {({ setNodeRef, style, activatorProps, isDragging, isOver }) => (
                <div ref={setNodeRef} style={style}>
                  <ChannleGridItem
                    {...{
                      link,
                      activatorProps,
                      isDragging,
                      isOver,
                      justDraggedRef,
                    }}
                  />
                </div>
              )}
            </SortableGridItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
function SortableGridItem({ id, children }) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    attributes,
    listeners,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.9 : 1,
  };

  return children({
    setNodeRef,
    style,
    isDragging,
    isOver,
    activatorProps: { ...attributes, ...listeners },
  });
}

function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    onChange(mql);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);

  return matches;
}

function ChannleGridItem({
  link,
  activatorProps,
  isDragging,
  isOver,
  justDraggedRef,
}) {
  const {
    selectedLink,
    setSelectedLink,
    setLastSelectedLink,
    // setShowChannels,
    setArmedId,
    setEditingId,
    setActiveScreen,
    // setShowForm,
    armedId,
  } = useStateManger();
  const { id, name, iconUrl } = link;
  const isArmed = armedId === id;
  const isSmUp = useMediaQuery("(min-width: 640px)"); // Tailwind sm breakpoint

  const tileActivatorProps = !isSmUp
    ? {
        ...activatorProps,
        onPointerDown: (e) => {
          e.stopPropagation();
          setArmedId(id);
          activatorProps?.onPointerDown?.(e);
        },
        onPointerUp: () => setArmedId(null),
        onPointerCancel: () => setArmedId(null),
        onPointerLeave: () => setArmedId(null),
      }
    : {};

  const handleActivatorProps = isSmUp
    ? {
        ...activatorProps,
        onPointerDown: (e) => {
          e.stopPropagation();
          setArmedId(id);
          activatorProps?.onPointerDown?.(e);
        },
        onPointerUp: () => setArmedId(null),
        onPointerCancel: () => setArmedId(null),
        onPointerLeave: () => setArmedId(null),
      }
    : null;

  const handleSelect = () => {
    setLastSelectedLink(selectedLink);
    setSelectedLink(link);
    setActiveScreen(null);
  };

  return (
    <div
      {...tileActivatorProps}
      title={name}
      onClick={(e) => {
        e.stopPropagation();
        if (justDraggedRef?.current) return; // ✅ don't select right after sorting
        handleSelect();
      }}
      className={[
        "group relative select-none aspect-square w-full rounded-xl overflow-hidden cursor-pointer",
        " ring-1 ring-black/5 dark:ring-white/10 transition",
        id == selectedLink?.id
          ? "bg-slate-400 dark:bg-slate-900 "
          : " bg-gray-100 dark:bg-gray-700 ",
        isOver
          ? "ring-2 ring-blue-500/70"
          : "hover:ring-2 hover:ring-blue-500/60",
        isArmed ? "ring-2 ring-yellow-400 shadow-lg scale-[1.01]" : "",
        isDragging ? "ring-2 ring-emerald-400 shadow-xl scale-[1.03]" : "",
        !isSmUp ? "touch-pan-y" : "", // whole tile is handle on mobile
      ].join(" ")}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={iconUrl}
          alt={name}
          className="w-[70%] sm:w-[60%] rounded-2xl object-cover "
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>

      {/* label */}
      <div
        className={`absolute inset-x-0 bottom-0 p-2 ${
          id !== selectedLink?.id &&
          "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition"
        }`}
      >
        <div className="w-full rounded-lg bg-black/55 backdrop-blur text-white text-xs font-semibold px-2 py-1 line-clamp-1 text-center">
          {name}
        </div>
      </div>

      {/* ✅ only show drag handle button on sm+ */}
      {isSmUp && (
        <>
          <button
            {...handleActivatorProps}
            onClick={(e) => e.stopPropagation()}
            type="button"
            className={[
              " ",
              "text-gray-500 cursor-move hover:text-white hover:bg-gray-400 dark:hover:bg-gray-500",
              "rounded-md md:p-1 absolute top-1 right-1 md:top-2 md:right-2 touch-none select-none",
              isArmed || isDragging
                ? "opacity-100  bg-black/20 text-white"
                : "",
            ].join(" ")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-3 md:size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 9h16.5m-16.5 6.75h16.5"
              />
            </svg>
          </button>
        </>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setActiveScreen("form");
          setEditingId(id);
        }}
        type="button"
        className={[
          "text-gray-500 cursor-pointer md:hover:text-white md:hover:bg-gray-400 md:dark:hover:bg-gray-500",
          "rounded-md md:p-1 absolute top-1 left-1 md:top-2 md:left-2  select-none",
        ].join(" ")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-3 md:size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
          />
        </svg>
      </button>
    </div>
  );
}

// ! ////////////////////////////////////////////////////////////////////////////////////// Channels
// ! From-------------------------------------------------------------------------------------------------------------------
function Form() {
  const {
    links,
    setLinks,
    activeScreen,
    setActiveScreen,
    editingId,
    setEditingId,
  } = useStateManger();
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [iconUrl, setIconUrl] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      // update
      const newLinks = links.map((link) => {
        if (link.id === editingId) {
          return { ...link, name, url, iconUrl };
        }
        return link;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLinks));
      setLinks(newLinks);
    } else {
      // add
      const newLink = { id: makeId(), name, url, iconUrl };
      const newLinks = [...links, newLink];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLinks));
      setLinks(newLinks);
    }
    close();
  };

  const resetForm = () => {
    setName("");
    setUrl("");
    setIconUrl("");
    setError("");
  };

  const close = () => {
    resetForm();
    if (editingId) setActiveScreen("channels");
    else setActiveScreen(null);
    setEditingId(null);
  };
  const handleCancel = () => {
    if (editingId || name || url || iconUrl) {
      // alert the user he will lose his changes
      const answer = window.confirm(
        "Are you sure you want to discard your changes?"
      );
      if (!answer) return;
      close();
    } else close();
  };

  React.useEffect(() => {
    const link = links.find((l) => l.id === editingId);
    if (link) {
      setName(link.name);
      setUrl(link.url);
      setIconUrl(link.iconUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);
  return (
    <div
      className={`size-full absolute top-0 left-0 flex justify-center items-center bg-white/50 dark:bg-gray-500/50  ${
        activeScreen === "form" ? "block" : "hidden"
      }`}
      onClick={handleCancel}
    >
      <div
        className={`size-[90%] flex justify-center items-center px-2 relative overflow-y-auto rounded-lg bg-slate-300 text-slate-900 dark:bg-gray-800 dark:text-slate-100 border border-gray-600 dark:border-gray-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* close button   */}
        <button
          className={
            topbarButtonClass +
            " absolute top-1 right-1 bg-slate-300 text-slate-900 dark:bg-gray-800 dark:text-slate-100"
          }
          onClick={handleCancel}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
        <form
          className={`flex max-w-md flex-col gap-4 overflow-hidden transition-all duration-400 ease-in-out`}
          onSubmit={handleSubmit}
        >
          <div>
            <div className="mb-2 block">
              <Label htmlFor="display_name" className="red-star">
                Display Name
              </Label>
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
              <Label htmlFor="icon_url" className="red-star">
                Icon URL
              </Label>
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
              <Label htmlFor="url" className="red-star">
                URL
              </Label>
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

          {error && (
            <div className="text-red-500 text-sm font-bold">{error}</div>
          )}

          <div className="flex justify-evenly items-center">
            <Button
              type="submit"
              pill
              outline
              className="cursor-pointer font-bold"
            >
              {editingId ? "Update" : "Add"}
            </Button>

            {/* Cancel edit only when editing */}
            <Button
              pill
              outline
              color={"gray"}
              className={`${
                editingId ? "" : "hidden"
              } cursor-pointer font-bold`}
              onClick={handleCancel}
            >
              {editingId ? "Cancel Edit" : "Reset"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ! ////////////////////////////////////////////////////////////////////////////////////// From
