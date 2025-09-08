"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { Search, Loader2, ExternalLink, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

// --- HELPER & UI COMPONENTS ---

const EmptyState = ({ title, message, icon: Icon }) => (
  <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/10">
    <Icon className="mx-auto h-12 w-12 text-slate-500" />
    <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm text-slate">{message}</p>
  </div>
);

// --- MAIN PAGE COMPONENT ---

export default function StudentGalleryPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Set up the real-time listener for gallery albums
    const albumsCollectionRef = collection(db, "galleryAlbums");

    // Query to get only 'Published' albums. We will sort later.
    const q = query(albumsCollectionRef, where("status", "==", "Published"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const albumsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // --- FIX: Sort the data here, in the browser, instead of in the query ---
        albumsData.sort((a, b) => b.eventDate.toDate() - a.eventDate.toDate());

        setAlbums(albumsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching gallery albums:", error);
        setLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  // Memoized filtering for performance
  const filteredAlbums = useMemo(
    () =>
      albums.filter((album) =>
        (album.title || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [albums, searchTerm]
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
        </div>
      );
    }
    if (albums.length === 0 && !loading) {
      return (
        <EmptyState
          title="Gallery is Empty"
          message="There are no photo albums to display at the moment. Check back soon!"
          icon={ImageIcon}
        />
      );
    }
    if (filteredAlbums.length === 0) {
      return (
        <EmptyState
          title="No Results Found"
          message="Your search did not match any photo albums."
          icon={Search}
        />
      );
    }

    return (
      <motion.div
        className="rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Table Header */}
            <div className="grid grid-cols-10 gap-4 p-4 border-b border-slate-700/50 text-xs font-semibold text-slate uppercase tracking-wider">
              <div className="col-span-6">Album Title</div>
              <div className="col-span-3">Event Date</div>
              <div className="col-span-1 text-right">Link</div>
            </div>
            {/* Table Body */}
            <div className="divide-y divide-slate-800">
              {filteredAlbums.map((album) => (
                <div
                  key={album.id}
                  className="grid grid-cols-10 gap-4 items-center p-4 text-sm hover:bg-slate-800/20 transition-colors">
                  <div className="col-span-6 flex items-center gap-4">
                    <div className="p-2 bg-slate-700/50 rounded-lg text-brand-gold">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium text-light-slate truncate">
                        {album.title}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3 text-slate-400">
                    {album.eventDate
                      ? format(album.eventDate.toDate(), "MMMM d, yyyy")
                      : "N/A"}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <a
                      href={album.gdriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 text-slate-400 hover:text-brand-gold rounded-md hover:bg-brand-gold/10 transition-colors"
                      aria-label={`View album ${album.title}`}>
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <main>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-light-slate mb-1">
            Event Gallery
          </h1>
          <p className="text-base text-slate">
            Browse and view photos from past institute events.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {albums.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by album title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg border border-slate-700 bg-slate-900 text-light-slate focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderContent()}
    </main>
  );
}
