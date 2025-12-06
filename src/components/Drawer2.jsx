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

const topbarButtonClass =
  "size-6 flex justify-center items-center rounded-full cursor-pointer bg-slate-100 hover:bg-white dark:hover:bg-gray-600 dark:bg-gray-700";
export default function Drawer() {
  const [links, setLinks] = React.useState([]);
  const [selectedLink, setSelectedLink] = React.useState(null);
  const [lastSelectedLink, setLastSelectedLink] = React.useState(null);

  const [showTopBar, setShowTopBar] = React.useState(true);
  const [showChannels, setShowChannels] = React.useState(false);

  return (
    <div className=" w-svw h-svh relative ">
      <h1 className="text-5xl font-bold text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        Pick a Channel
      </h1>
      <iframe
        src={selectedLink ? selectedLink.url : "about:blank"}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        className={`w-full h-[calc(100%-32px)] absolute bottom-0 left-0 border-0 ${
          selectedLink ? "block" : "hidden"
        }`}
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
            setShowChannels((c) => !c);
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
      </div>

      {/* channels  */}
      <Channels
        {...{
          links,
          setLinks,
          selectedLink,
          setSelectedLink,
          lastSelectedLink,
          setLastSelectedLink,
          showChannels,
          setShowChannels,
        }}
      />
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

function Channels({
  links,
  setLinks,
  selectedLink,
  setSelectedLink,
  lastSelectedLink,
  setLastSelectedLink,
  showChannels,
  setShowChannels,
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
  return (
    <div
      className={`size-full absolute top-0 left-0 flex justify-center items-center bg-white/50 dark:bg-gray-500/50  ${
        showChannels ? "block" : "hidden"
      }`}
      onClick={() => setShowChannels((c) => !c)}
    >
      <div
        className={`size-[90%] relative overflow-y-auto rounded-lg bg-slate-300 text-slate-900 dark:bg-gray-800 dark:text-slate-100 border border-gray-600 dark:border-gray-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* close button   */}
        <button
          className={
            topbarButtonClass +
            " absolute top-4 right-4 bg-slate-300 text-slate-900 dark:bg-gray-800 dark:text-slate-100"
          }
          onClick={() => setShowChannels((c) => !c)}
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
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
        {/* channels grid  */}
        <DndGrid
          links={links}
          setLinks={setLinks}
          selectedLink={selectedLink}
          setSelectedLink={setSelectedLink}
          setLastSelectedLink={setLastSelectedLink}
          setShowChannels={setShowChannels}
        />
        {/* <div className="grid grid-cols-4 gap-4 p-4 ">
          {links.map((link) => (
            <ChannleGridItem
              key={link.id}
              {...{
                link,
                links,
                setLinks,
                selectedLink,
                setSelectedLink,
                lastSelectedLink,
                setLastSelectedLink,
                showChannels,
                setShowChannels,
              }}
            />
          ))}
        </div> */}
      </div>
    </div>
  );
}

function DndGrid({
  links,
  setLinks,
  selectedLink,
  setSelectedLink,
  setLastSelectedLink,
  setShowChannels,
}) {
  // ✅ which item is currently "pressed/armed" for drag (during long-press delay)
  const [armedId, setArmedId] = React.useState(null);
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
                    link={link}
                    selectedLink={selectedLink}
                    setSelectedLink={setSelectedLink}
                    setLastSelectedLink={setLastSelectedLink}
                    setShowChannels={setShowChannels}
                    activatorProps={activatorProps}
                    isDragging={isDragging}
                    isOver={isOver}
                    isArmed={armedId === link.id}
                    setArmedId={setArmedId}
                    justDraggedRef={justDraggedRef}
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
  selectedLink,
  setSelectedLink,
  setLastSelectedLink,
  setShowChannels,
  activatorProps,
  isDragging,
  isOver,
  isArmed,
  setArmedId,
  justDraggedRef,
}) {
  const { id, name, url, iconUrl } = link;

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
    setShowChannels(false);
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
        "bg-gray-100 dark:bg-gray-700 ring-1 ring-black/5 dark:ring-white/10 transition",
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
      <div className="absolute inset-x-0 bottom-0 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition p-2">
        <div className="w-full rounded-lg bg-black/55 backdrop-blur text-white text-xs font-semibold px-2 py-1 line-clamp-1 text-center">
          {name}
        </div>
      </div>

      {/* ✅ only show drag handle button on sm+ */}
      {isSmUp && (
        <button
          {...handleActivatorProps}
          onClick={(e) => e.stopPropagation()}
          type="button"
          className={[
            "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition",
            "text-gray-500 cursor-move hover:text-white hover:bg-gray-400 dark:hover:bg-gray-500",
            "rounded-md p-1 absolute top-2 right-2 touch-none select-none",
            isArmed || isDragging
              ? "opacity-100 translate-y-0 bg-black/20 text-white"
              : "",
          ].join(" ")}
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
      )}
    </div>
  );
}
