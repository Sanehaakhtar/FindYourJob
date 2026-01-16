"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        multiple: false,
    });

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post("/onboard", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const email = response.data.profile.email;
            localStorage.setItem("job_agent_email", email);
            toast.success(`Profile created! Redirecting to your jobs...`);

            setTimeout(() => {
                const searchParams = new URLSearchParams();
                if (email) searchParams.set("query", email);
                searchParams.set("auto", "true");
                router.push(`/?${searchParams.toString()}`);
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload CV. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-fp-purple flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="sticker-card bg-white w-full max-w-4xl overflow-hidden"
            >
                <div className="flex flex-col md:flex-row">
                    {/* Header Side */}
                    <div className="bg-fp-yellow p-8 md:p-12 md:w-[40%] border-b-[5px] md:border-b-0 md:border-r-[5px] border-black flex flex-col justify-center">
                        <motion.h1
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-4xl md:text-5xl text-mega-bold text-black mb-4 leading-tight uppercase"
                        >
                            READY TO<br />GET HIRED?
                        </motion.h1>
                        <p className="text-lg md:text-xl font-bold text-black/80">
                            Upload your CV and let our AI agent find the perfect SDR roles for you.
                        </p>
                    </div>

                    {/* Action Side */}
                    <div className="p-8 md:p-12 md:w-[60%] flex flex-col justify-center bg-white">
                        <div
                            {...getRootProps()}
                            className={`
                                border-[4px] border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                                ${isDragActive ? "border-fp-purple bg-fp-purple/5 scale-[0.98]" : "border-black/20 hover:border-black hover:bg-neutral-50"}
                            `}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center space-y-4">
                                {file ? (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-fp-green border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <FileText className="h-8 w-8 text-black" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-xl font-black uppercase text-black truncate max-w-[250px]">{file.name}</div>
                                            <div className="text-sm font-bold text-black/60 uppercase">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-fp-yellow border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <Upload className="h-8 w-8 text-black" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xl font-black uppercase text-black">DRAG & DROP CV</div>
                                            <div className="text-sm font-bold text-black/40 uppercase">
                                                PDF FORMAT ONLY
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
                            <Button
                                className="flex-1 w-full bg-white text-black hover:bg-yellow-300 text-xl py-8 rounded-full font-black border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all uppercase"
                                onClick={handleUpload}
                                disabled={!file || uploading}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        SCANNING...
                                    </>
                                ) : (
                                    "SCAN MY CV"
                                )}
                            </Button>

                            <button
                                onClick={() => router.push('/')}
                                className="sm:w-auto px-6 py-4 text-sm font-black uppercase text-black/40 hover:text-black transition-colors whitespace-nowrap"
                            >
                                SKIP FOR NOW
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
