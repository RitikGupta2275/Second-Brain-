import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CreateContentModel } from "../components/ui/createContentModel";
import { PlusIcon } from "../icons/PlusIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { MenuIcon } from "../icons/MenuIcon";
import { LogoItem } from "../icons/LogoIcon";
import { Sidebar } from "../components/ui/Sidebar";
import { useContent } from "../hooks/useContent";
import { ShareBrainModel } from "../components/ui/shareBrainModel";
import { GridIcon } from "../icons/GridIcon";
import { ListIcon } from "../icons/ListIcon";
import { SearchIcon } from "../icons/SearchIcon";
import { CrossIcon } from "../icons/CrossIcon";
import { Toast } from "../components/ui/Toast";
import { DeleteModal } from "../components/ui/DeleteModal";
import axios from "axios";
import { BACKEND_URL } from "../Config";

export function Dashboard() {
  const [modelOpen, setModelOpen] = useState(false);
  const [shareModelOpen, setShareModelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [selectedType, setSelectedType] = useState<"all" | "youtube" | "twitter" | "bookmark">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast Notification State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({
    show: false,
    message: "",
    type: "success"
  });

  // Delete Warning Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ open: boolean; id: string; title: string }>({
    open: false,
    id: "",
    title: ""
  });
  const [deleting, setDeleting] = useState(false);

  // Persistent Bookmarked Card IDs
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("second_brain_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("second_brain_bookmarks", JSON.stringify(bookmarkedIds));
    } catch {
      // Ignore storage errors
    }
  }, [bookmarkedIds]);

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const isAlready = prev.includes(id);
      if (isAlready) {
        triggerToast("Removed from Bookmarks", "info");
        return prev.filter(bId => bId !== id);
      } else {
        triggerToast("Saved to Bookmarks! 🔖", "info");
        return [...prev, id];
      }
    });
  };

  const {
    contents,
    refresh,
    setContents,
    loading,
    error
  } = useContent();

  const filteredContent = contents.filter((content) => {
    const matchesType = selectedType === "all"
      ? true
      : selectedType === "bookmark"
      ? (content.type === "bookmark" || bookmarkedIds.includes(content._id))
      : content.type === selectedType;

    const matchesSearch = searchQuery.trim() === "" ? true : 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.link.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  useEffect(() => {
    refresh();
  }, [modelOpen]);

  // Open Delete Confirmation Warning Popup
  const initiateDelete = (id: string) => {
    const item = contents.find(c => c._id === id);
    if (item) {
      setDeleteTarget({ open: true, id, title: item.title });
    }
  };

  // Perform Actual Delete after Confirmation
  const confirmDelete = async () => {
    if (!deleteTarget.id) return;
    setDeleting(true);

    try {
      await axios.delete(`${BACKEND_URL}/api/v1/content`, {
        data: {
          contentId: deleteTarget.id
        },
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      setContents(prev => prev.filter(content => content._id !== deleteTarget.id));
      triggerToast("Content deleted successfully!", "success");
      setDeleteTarget({ open: false, id: "", title: "" });
    } catch {
      triggerToast("Failed to delete content. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const getPageTitle = () => {
    switch (selectedType) {
      case "youtube":
        return "YouTube Videos";
      case "twitter":
        return "Twitter / X Bookmarks";
      case "bookmark":
        return "Saved Bookmarks";
      default:
        return "All Notes & Bookmarks";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />

      {/* Delete Warning Popup Modal */}
      <DeleteModal
        open={deleteTarget.open}
        title={deleteTarget.title}
        loading={deleting}
        onClose={() => setDeleteTarget({ open: false, id: "", title: "" })}
        onConfirm={confirmDelete}
      />

      {/* Sidebar (Desktop static & Mobile drawer) */}
      <Sidebar
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="md:ml-64 min-h-screen flex flex-col">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <MenuIcon size="md" />
          </button>

          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <LogoItem size="sm" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Second Brain</span>
          </div>

          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <CreateContentModel
            open={modelOpen}
            onClose={() => {
              setModelOpen(false);
              triggerToast("Content added successfully! 🎉", "success");
            }}
          />

          <ShareBrainModel
            count={contents.length}
            open={shareModelOpen}
            onClose={() => {
              setShareModelOpen(false);
            }}
          />

          {/* Page Title & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {getPageTitle()}
                </h1>
                {!loading && !error && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {filteredContent.length} {filteredContent.length === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Organize, search, and revisit your saved online knowledge.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => {
                  setShareModelOpen(true);
                }}
                startIcon={<ShareIcon size="md" />}
                variant="secondary"
                text="Share Brain"
              />

              <Button
                onClick={() => {
                  setModelOpen(true);
                }}
                startIcon={<PlusIcon size="md" />}
                variant="primary"
                text="Add Content"
              />
            </div>
          </div>

          {/* Filter, Search & Layout Bar */}
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2 sm:p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <SearchIcon size="sm" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or link..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <CrossIcon size="sm" />
                </button>
              )}
            </div>

            {/* View Mode Switcher Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto border border-slate-200/60">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <GridIcon size="sm" />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <ListIcon size="sm" />
                List
              </button>
            </div>
          </div>

          {/* Loading Skeleton State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs animate-pulse space-y-4 flex flex-col justify-between min-h-[300px]"
                >
                  <div className="aspect-video bg-slate-200 rounded-2xl w-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                    <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State with Retry Button */
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-lg mx-auto">
              <div className="size-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                <svg
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Failed to load content</h3>
              <p className="text-sm text-slate-500 mb-5">{error}</p>
              <Button
                onClick={refresh}
                variant="secondary"
                text="Try Again"
              />
            </div>
          ) : filteredContent.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-300 shadow-xs max-w-xl mx-auto">
              <div className="size-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100 shadow-xs">
                <LogoItem size="md" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {searchQuery
                  ? "No matching results"
                  : selectedType === "all"
                  ? "Your Second Brain is empty"
                  : selectedType === "bookmark"
                  ? "No saved bookmarks yet"
                  : `No ${selectedType === "youtube" ? "YouTube videos" : "Twitter posts"} found`}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1.5 mb-6">
                {searchQuery
                  ? `No notes matched "${searchQuery}". Try a different keyword.`
                  : selectedType === "all"
                  ? "Start saving your favorite YouTube tutorials, lectures, and Twitter/X threads to build your second brain."
                  : selectedType === "bookmark"
                  ? "Click the bookmark icon on any card to save it here for quick access."
                  : `You haven't saved any ${selectedType === "youtube" ? "YouTube videos" : "Twitter/X posts"} yet.`}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {searchQuery ? (
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="outline"
                    text="Clear Search"
                  />
                ) : (
                  <Button
                    onClick={() => setModelOpen(true)}
                    startIcon={<PlusIcon size="md" />}
                    variant="primary"
                    text="Add Content"
                  />
                )}
              </div>
            </div>
          ) : (
            /* Content Feed (Grid or List Mode) */
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 items-start"
                  : "space-y-3"
              }
            >
              {filteredContent.map(({ type, link, title, _id }) => (
                <div key={_id} className={viewMode === "grid" ? "w-full self-start" : ""}>
                  <Card
                    id={_id}
                    type={type}
                    link={link}
                    title={title}
                    viewMode={viewMode}
                    isBookmarked={bookmarkedIds.includes(_id)}
                    onToggleBookmark={toggleBookmark}
                    onDelete={initiateDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
