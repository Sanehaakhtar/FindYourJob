"use client";
import { motion } from "framer-motion";
import { Building2, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverLetterDialog } from "./CoverLetterDialog";

interface Job {
    id: number;
    title: string;
    company: string;
    url: string;
    description: string;
    location?: string;
    created_at: string;
}

interface JobListItemProps {
    job: Job;
    userEmail: string;
}

export function JobListItem({ job, userEmail }: JobListItemProps) {
    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        const diffInWeeks = Math.floor(diffInDays / 7);
        return `${diffInWeeks}w ago`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="sticker-card bg-white p-8 group mb-8"
        >
            <div className="flex flex-col md:flex-row gap-8">
                {/* Company Icon - FlyingPapers Style */}
                <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-fp-yellow flex items-center justify-center border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Building2 className="w-10 h-10 text-black" />
                    </div>
                </div>

                {/* Job Details */}
                <div className="flex-1 min-w-0">
                    {/* Title & Company */}
                    <div className="mb-4">
                        <h3 className="text-3xl font-black text-black group-hover:text-fp-red transition-colors mb-1">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xl font-bold text-neutral-600">
                            <p>{job.company}</p>
                            <span>|</span>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-5 h-5" />
                                <span>{job.location || "Remote"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Meta & Description */}
                    <div className="flex items-center gap-4 mb-6 text-lg font-bold text-neutral-500">
                        <div className="flex items-center gap-1">
                            <Clock className="w-5 h-5" />
                            <span>{getTimeAgo(job.created_at)}</span>
                        </div>
                    </div>

                    <p className="text-xl font-medium text-neutral-700 line-clamp-3 mb-8 leading-relaxed">
                        {job.description || "No description available"}
                    </p>

                    {/* Action Buttons - Neubrutalist Style */}
                    <div className="flex flex-wrap gap-4">
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                size="lg"
                                className="bg-fp-red text-white hover:bg-red-600 text-xl px-10 py-6 rounded-full font-black border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                VIEW JOB
                            </Button>
                        </a>
                        <CoverLetterDialog job={job} userEmail={userEmail} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
