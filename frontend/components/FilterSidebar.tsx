"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { X, SlidersHorizontal } from "lucide-react";

export interface FilterState {
    locationType: string[];
    jobType: string[];
    experienceLevel: string[];
    datePosted: string;
    salaryRange: [number, number];
}

interface FilterSidebarProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export function FilterSidebar({ filters, onFilterChange, isOpen, onToggle }: FilterSidebarProps) {
    const handleLocationChange = (value: string, checked: boolean) => {
        const updated = checked
            ? [...filters.locationType, value]
            : filters.locationType.filter((v) => v !== value);
        onFilterChange({ ...filters, locationType: updated });
    };

    const handleJobTypeChange = (value: string, checked: boolean) => {
        const updated = checked
            ? [...filters.jobType, value]
            : filters.jobType.filter((v) => v !== value);
        onFilterChange({ ...filters, jobType: updated });
    };

    const handleExperienceChange = (value: string, checked: boolean) => {
        const updated = checked
            ? [...filters.experienceLevel, value]
            : filters.experienceLevel.filter((v) => v !== value);
        onFilterChange({ ...filters, experienceLevel: updated });
    };

    const clearAllFilters = () => {
        onFilterChange({
            locationType: [],
            jobType: [],
            experienceLevel: [],
            datePosted: "all",
            salaryRange: [0, 10000000],
        });
    };

    const activeFilterCount =
        filters.locationType.length +
        filters.jobType.length +
        filters.experienceLevel.length +
        (filters.datePosted !== "all" ? 1 : 0);

    return (
        <>
            {/* Mobile Toggle Button */}
            <Button
                onClick={onToggle}
                className="md:hidden fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 shadow-lg bg-gradient-to-br from-maroon-600 to-rose-700 hover:from-maroon-700 hover:to-rose-800 text-white"
            >
                <SlidersHorizontal className="w-6 h-6" />
                {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {activeFilterCount}
                    </span>
                )}
            </Button>

            {/* Sidebar */}
            <div
                className={`
          fixed md:block w-80 flex-shrink-0 bg-white dark:bg-neutral-900 
          overflow-y-auto transition-transform duration-300 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isOpen ? "top-0 left-0 h-screen border-r border-neutral-200 dark:border-neutral-800" : "hidden md:block card-pop rounded-2xl overflow-hidden m-4 sm:m-6 lg:m-8"}
        `}
            >
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">Filters</h2>
                            {activeFilterCount > 0 && (
                                <span className="bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs px-2 py-1 rounded-full">
                                    {activeFilterCount}
                                </span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggle}
                            className="md:hidden"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Clear All */}
                    {activeFilterCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllFilters}
                            className="w-full"
                        >
                            Clear All Filters
                        </Button>
                    )}

                    {/* Location Type */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Location Type</Label>
                        <div className="space-y-2">
                            {["Remote", "Onsite", "Hybrid"].map((type) => (
                                <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`location-${type}`}
                                        checked={filters.locationType.includes(type.toLowerCase())}
                                        onCheckedChange={(checked) =>
                                            handleLocationChange(type.toLowerCase(), checked as boolean)
                                        }
                                    />
                                    <label
                                        htmlFor={`location-${type}`}
                                        className="text-sm cursor-pointer"
                                    >
                                        {type}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Job Type */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Job Type</Label>
                        <div className="space-y-2">
                            {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
                                <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`job-${type}`}
                                        checked={filters.jobType.includes(type.toLowerCase())}
                                        onCheckedChange={(checked) =>
                                            handleJobTypeChange(type.toLowerCase(), checked as boolean)
                                        }
                                    />
                                    <label
                                        htmlFor={`job-${type}`}
                                        className="text-sm cursor-pointer"
                                    >
                                        {type}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Experience Level</Label>
                        <div className="space-y-2">
                            {["Entry Level", "Mid Level", "Senior Level"].map((level) => (
                                <div key={level} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`exp-${level}`}
                                        checked={filters.experienceLevel.includes(level.toLowerCase())}
                                        onCheckedChange={(checked) =>
                                            handleExperienceChange(level.toLowerCase(), checked as boolean)
                                        }
                                    />
                                    <label
                                        htmlFor={`exp-${level}`}
                                        className="text-sm cursor-pointer"
                                    >
                                        {level}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Date Posted */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Date Posted</Label>
                        <div className="space-y-2">
                            {[
                                { label: "Last 24 hours", value: "24h" },
                                { label: "Last Week", value: "week" },
                                { label: "Last Month", value: "month" },
                                { label: "All Time", value: "all" },
                            ].map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`date-${option.value}`}
                                        checked={filters.datePosted === option.value}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                onFilterChange({ ...filters, datePosted: option.value });
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={`date-${option.value}`}
                                        className="text-sm cursor-pointer"
                                    >
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Salary Range */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">
                            Salary Range (Annual PKR)
                        </Label>
                        <div className="space-y-4">
                            <Slider
                                min={0}
                                max={10000000}
                                step={100000}
                                value={filters.salaryRange}
                                onValueChange={(value) =>
                                    onFilterChange({ ...filters, salaryRange: value as [number, number] })
                                }
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-neutral-500">
                                <span>₨{(filters.salaryRange[0] / 1000).toFixed(0)}k</span>
                                <span>₨{(filters.salaryRange[1] / 1000).toFixed(0)}k</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onToggle}
                />
            )}
        </>
    );
}
