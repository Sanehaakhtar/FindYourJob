import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { generateCoverLetter } from "@/lib/api";
import { Loader2, Copy, Check, Upload } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Job {
    title: string;
    company: string;
    description: string;
}

interface CoverLetterDialogProps {
    job: Job;
    userEmail: string;
}

export function CoverLetterDialog({ job, userEmail }: CoverLetterDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [letter, setLetter] = useState("");
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!userEmail) {
            toast.error("Please upload your CV first!");
            return;
        }
        setLoading(true);
        setLetter("");
        try {
            const generatedLetter = await generateCoverLetter(
                userEmail,
                job.title || "Job Application",
                job.company || "Hiring Manager",
                job.description || ""
            );
            setLetter(generatedLetter);
        } catch (error: any) {
            if (error.response?.status === 404) {
                toast.error("Profile not found! Please re-upload your CV.");
                // Clear the stale email from state to show the upload prompt
                // But only if we're sure the profile is truly gone
            } else {
                toast.error("Failed to generate cover letter. Ensure you are onboarded.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(letter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copied to clipboard!");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="bg-white text-black hover:bg-yellow-300 text-xl px-10 py-6 rounded-full font-black border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all uppercase"
                >
                    Generate Cover Letter
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-[5px] border-black rounded-3xl shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
                <DialogHeader>
                    <DialogTitle className="text-4xl font-black uppercase mb-2">AI Cover Letter Generator</DialogTitle>
                    <DialogDescription className="text-xl font-bold text-neutral-600">
                        {userEmail
                            ? `Creating a tailored letter for ${job.title} at ${job.company}.`
                            : "You need to upload your CV before we can generate a letter for you."
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {!userEmail ? (
                        <div className="text-center p-12 border-[4px] border-dashed border-black rounded-3xl bg-fp-yellow/10">
                            <div className="w-20 h-20 rounded-3xl bg-fp-yellow border-[4px] border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mx-auto mb-8">
                                <Upload className="h-10 w-10 text-black" />
                            </div>
                            <h3 className="text-3xl font-black uppercase mb-4">CV REQUIRED</h3>
                            <p className="text-xl font-bold text-neutral-700 mb-8 px-4">
                                Our AI agent needs to analyze your skills from your CV to write a human-like cover letter!
                            </p>
                            <Link href="/onboard">
                                <Button
                                    className="bg-white text-black hover:bg-yellow-300 text-2xl px-12 py-8 rounded-full font-[900] uppercase border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[11px_11px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    UPLOAD CV NOW
                                </Button>
                            </Link>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center p-12 space-y-6">
                            <Loader2 className="w-12 h-12 animate-spin text-black" />
                            <p className="text-xl font-black uppercase animate-pulse">
                                Reading your CV & Job Description...
                            </p>
                        </div>
                    ) : letter ? (
                        <Textarea
                            value={letter}
                            readOnly
                            className="min-h-[400px] font-mono text-lg p-6 border-[3px] border-black rounded-2xl leading-relaxed"
                        />
                    ) : (
                        <div className="text-center p-12 border-[4px] border-dashed border-black rounded-3xl bg-neutral-50">
                            <p className="text-2xl font-bold text-neutral-700 mb-8 px-4">
                                Ready to generate a human-like cover letter based on your skills?
                            </p>
                            <Button
                                onClick={handleGenerate}
                                className="bg-white text-black hover:bg-yellow-300 text-2xl px-12 py-8 rounded-full font-[900] uppercase border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[11px_11px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                Generate Now
                            </Button>
                        </div>
                    )}
                </div>

                {letter && userEmail && (
                    <DialogFooter className="sm:justify-center">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto bg-white text-black hover:bg-yellow-300 text-xl px-12 py-6 rounded-full font-black border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-6 h-6 mr-3" /> COPIED
                                </>
                            ) : (
                                <>
                                    <Copy className="w-6 h-6 mr-3" /> COPY TO CLIPBOARD
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

