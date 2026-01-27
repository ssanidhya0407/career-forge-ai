"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, X, Loader2, AlertCircle } from "lucide-react";
import { parseResume } from "@/lib/api";
import clsx from "clsx";

interface ResumeUploadProps {
    onResumeParsed: (context: string, parsed: any) => void;
    className?: string;
}

export function ResumeUpload({ onResumeParsed, className }: ResumeUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!file.name.endsWith('.pdf')) {
            setError("Please upload a PDF file");
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadedFile(file);

        try {
            const result = await parseResume(file);
            setParsedData(result.parsed);
            onResumeParsed(result.context, result.parsed);
        } catch (err) {
            console.error("Resume parse error:", err);
            setError("Failed to parse resume. Please try again.");
            setUploadedFile(null);
        } finally {
            setIsUploading(false);
        }
    }, [onResumeParsed]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        disabled: isUploading
    });

    const handleRemove = () => {
        setUploadedFile(null);
        setParsedData(null);
        setError(null);
        onResumeParsed("", null);
    };

    return (
        <div className={className}>
            <AnimatePresence mode="wait">
                {!uploadedFile ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        {...getRootProps()}
                        className={clsx(
                            "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
                            isDragActive
                                ? "border-primary bg-primary/5"
                                : "border-white/10 hover:border-white/20 bg-white/5",
                            isUploading && "pointer-events-none opacity-50"
                        )}
                    >
                        <input {...getInputProps()} />

                        <div className="flex flex-col items-center gap-4">
                            {isUploading ? (
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            ) : (
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Upload className="w-7 h-7 text-primary" />
                                </div>
                            )}

                            <div>
                                <p className="font-medium text-foreground">
                                    {isDragActive
                                        ? "Drop your resume here..."
                                        : isUploading
                                            ? "Parsing resume..."
                                            : "Upload your resume"}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Drag & drop or click to browse (PDF only)
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="uploaded"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="relative bg-green-500/10 border border-green-500/20 rounded-2xl p-6"
                    >
                        <button
                            onClick={handleRemove}
                            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium truncate">{uploadedFile.name}</span>
                                </div>

                                {parsedData && (
                                    <div className="mt-3 space-y-2">
                                        {parsedData.name && (
                                            <p className="text-sm text-muted-foreground">
                                                <span className="text-foreground font-medium">{parsedData.name}</span>
                                            </p>
                                        )}
                                        {parsedData.skills?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {parsedData.skills.slice(0, 6).map((skill: string, i: number) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {parsedData.skills.length > 6 && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-white/50">
                                                        +{parsedData.skills.length - 6} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-2 text-red-400 text-sm"
                >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </motion.div>
            )}
        </div>
    );
}
