"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Sparkles, ArrowDown, Upload } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import api from "@/lib/api";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { JobListItem } from "@/components/JobListItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CloudMascot } from "@/components/CloudMascot";

interface Job {
  id: number;
  title: string;
  company: string;
  url: string;
  description: string;
  location?: string;
  created_at: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  const { scrollYProgress } = useScroll();

  // Smooth color transitions based on scroll
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ['#FF3E3E', '#FFE800', '#8A2BE2', '#00D1FF', '#00D1FF']
  );

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);

  // Load email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("job_agent_email");
    if (savedEmail) {
      setUserEmail(savedEmail);
      // If we have an email but haven't searched, auto-fetch to show results
      if (jobs.length === 0) {
        fetchJobs();
      }
    }
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    locationType: [],
    jobType: [],
    experienceLevel: [],
    datePosted: "all",
    salaryRange: [0, 10000000],
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
      setFilteredJobs(res.data);
      setHasSearched(true);

      // Auto scroll to jobs section if search/onboard just happened
      const urlQuery = searchParams.get("query");
      if (urlQuery) {
        setTimeout(() => {
          document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 800);
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to jobs
  useEffect(() => {
    let filtered = [...jobs];

    // Apply selected filter buttons
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((job) => {
        const text = `${job.title} ${job.description} ${job.location || ""}`.toLowerCase();
        return selectedFilters.some((filter) => {
          const filterLower = filter.toLowerCase();
          if (filterLower === "full-time") return text.includes("full") || text.includes("fulltime");
          if (filterLower === "remote") return text.includes("remote");
          if (filterLower === "senior") return text.includes("senior") || text.includes("lead");
          if (filterLower === "entry-level") return text.includes("entry") || text.includes("junior");
          if (filterLower === "contract") return text.includes("contract");
          if (filterLower === "hybrid") return text.includes("hybrid");
          return false;
        });
      });
    }

    // Location Type Filter
    if (filters.locationType.length > 0) {
      filtered = filtered.filter((job) => {
        const location = (job.location || "").toLowerCase();
        return filters.locationType.some((type) => location.includes(type));
      });
    }

    // Job Type Filter
    if (filters.jobType.length > 0) {
      filtered = filtered.filter((job) => {
        const text = `${job.title} ${job.description}`.toLowerCase();
        return filters.jobType.some((type) => text.includes(type));
      });
    }

    // Experience Level Filter
    if (filters.experienceLevel.length > 0) {
      filtered = filtered.filter((job) => {
        const text = `${job.title} ${job.description}`.toLowerCase();
        return filters.experienceLevel.some((level) => {
          if (level === "entry level") return text.includes("entry") || text.includes("junior");
          if (level === "mid level") return text.includes("mid") || text.includes("intermediate");
          if (level === "senior level") return text.includes("senior") || text.includes("lead");
          return false;
        });
      });
    }

    // Date Posted Filter
    if (filters.datePosted !== "all") {
      const now = new Date();
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.created_at);
        const diffInDays = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (filters.datePosted) {
          case "24h": return diffInDays < 1;
          case "7d": return diffInDays < 7;
          case "14d": return diffInDays < 14;
          case "30d": return diffInDays < 30;
          default: return true;
        }
      });
    }

    setFilteredJobs(filtered);
  }, [jobs, filters, selectedFilters]);

  // Handle search from URL params (e.g. from onboarding redirect)
  useEffect(() => {
    const urlQuery = searchParams.get("query");
    const autoSearch = searchParams.get("auto");

    if (urlQuery && autoSearch === "true") {
      // If query is an email (contains @), it's from onboard
      if (urlQuery.includes("@")) {
        setUserEmail(urlQuery);
        localStorage.setItem("job_agent_email", urlQuery);
        // Refresh jobs (fetchJobs will handle scroll)
        fetchJobs();
      } else {
        setQuery(urlQuery);
        handleSearch(urlQuery);
      }
    }
  }, [searchParams]);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) {
      toast.error("Please enter a job title or keyword to search");
      return;
    }

    setSearching(true);
    setHasSearched(true);
    try {
      const res = await api.post(`/search?query=${encodeURIComponent(q)}`);
      toast.success(`Search completed! Found ${res.data.count || 0} potential jobs.`);
      fetchJobs();

      // Explicitly scroll if initiated by user
      setTimeout(() => {
        document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (error) {
      console.error("Search failed", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // Toggle filter button
  const toggleFilter = (filter: string) => {
    if (!hasSearched) {
      toast.error("Please search for jobs first or upload your CV!");
      return;
    }
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <motion.div className="min-h-screen" style={{ backgroundColor }}>
      {/* Hero Section - FlyingPapers Style */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-24">
          <div className="flex items-center justify-center gap-12">
            {/* Mascot on Left */}
            <div className="flex-shrink-0">
              <CloudMascot />
            </div>

            {/* Content on Right */}
            <div className="text-left">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-7xl md:text-9xl text-mega-bold text-black mb-6"
              >
                READY TO FIND<br />YOUR NEXT JOB?
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-2xl md:text-3xl font-bold text-black mb-12"
              >
                Let's explore your options together
              </motion.p>

              {/* Action Buttons - Horizontal Layout */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-6"
              >
                {/* Search Jobs Button */}
                <Button
                  onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
                  size="lg"
                  className="bg-white text-black hover:bg-yellow-300 text-xl px-10 py-6 rounded-full font-black border-[5px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <Search className="w-6 h-6 mr-2" />
                  SEARCH JOBS
                </Button>

                {/* Upload CV Button */}
                <Link href="/onboard">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-yellow-300 text-xl px-10 py-6 rounded-full font-black border-[5px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <Upload className="w-6 h-6 mr-2" />
                    UPLOAD YOUR CV
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Section - Yellow */}
      <section id="explore" className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-1000" style={{ backgroundColor: '#FFE800' }}>
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl text-mega-bold text-black mb-12 text-center"
          >
            WHAT KIND OF JOB<br />ARE YOU LOOKING FOR?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Job Type Filter Buttons */}
            {["FULL-TIME", "REMOTE", "SENIOR", "ENTRY-LEVEL", "CONTRACT", "HYBRID"].map((type, idx) => (
              <motion.button
                key={type}
                onClick={() => toggleFilter(type)}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, type: "spring" }}
                className={`sticker-card p-6 cursor-pointer group transition-all ${selectedFilters.includes(type)
                  ? "bg-yellow-300"
                  : "bg-white hover:bg-yellow-200"
                  }`}
              >
                <h3 className="text-2xl font-black text-black text-center group-hover:scale-105 transition-transform">{type}</h3>
              </motion.button>
            ))}
          </div>

          {/* Search Input */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="e.g., 'Software Engineer in New York'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 text-xl py-6 px-6 rounded-full border-[4px] border-black font-bold"
              />
              <Button
                onClick={() => handleSearch()}
                disabled={searching}
                className="bg-black text-white hover:bg-neutral-800 text-xl px-8 py-6 rounded-full font-black border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                {searching ? "SEARCHING..." : "SEARCH"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section - Purple */}
      <section id="jobs-section" className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-1000" style={{ backgroundColor: '#8A2BE2' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-12">
            <motion.img
              src="/job_rocket_illustration_1768564588529.png"
              alt="Career Launch"
              width="200"
              height="200"
              className="mr-8"
              animate={{
                y: [0, -15, 0],
                rotate: [-3, 3, -3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-6xl md:text-8xl text-mega-bold text-white"
            >
              {filteredJobs.length}<br />JOBS FOUND
            </motion.h2>
          </div>

          {loading || searching ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl bg-white/20" />
              ))}
            </div>
          ) : !hasSearched ? (
            <div className="text-center py-20">
              <h3 className="text-4xl text-mega-bold text-white mb-4">NO JOBS YET!</h3>
              <p className="text-2xl text-white mb-8">Please search for jobs or upload your CV first!</p>
              <div className="flex justify-center gap-6">
                <Button
                  onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-black hover:bg-yellow-300 text-xl px-8 py-4 rounded-full font-black border-[4px] border-black"
                >
                  <Search className="w-5 h-5 mr-2" />
                  SEARCH JOBS
                </Button>
                <Link href="/onboard">
                  <Button className="bg-white text-black hover:bg-yellow-300 text-xl px-8 py-4 rounded-full font-black border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <Upload className="w-5 h-5 mr-2" />
                    UPLOAD CV
                  </Button>
                </Link>
              </div>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid gap-6">
              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job) => (
                  <JobListItem key={job.id} job={job} userEmail={userEmail} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-4xl text-mega-bold text-white mb-4">NO JOBS FOUND</h3>
              <p className="text-2xl text-white">Try adjusting your search or filters!</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer - Cyan */}
      <section className="py-20 px-4 text-center transition-colors duration-1000" style={{ backgroundColor: '#00D1FF' }}>
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="text-6xl md:text-8xl text-mega-bold text-black mb-8"
        >
          THANKS FOR<br />USING JOB AGENT
        </motion.h2>
        <Link href="/onboard">
          <Button className="bg-white text-black hover:bg-yellow-300 text-2xl px-12 py-6 rounded-full font-black border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
            UPLOAD YOUR CV
          </Button>
        </Link>
      </section>
    </motion.div>
  );
}
