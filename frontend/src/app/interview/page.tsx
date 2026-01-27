"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api, sendChat, uploadAudio } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, PhoneOff, ArrowLeft, Volume2, Maximize2, Minimize2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

interface Message {
    role: string;
    content: string;
}

// Browser Speech Recognition Support
const SpeechRecognition = typeof window !== 'undefined' ? (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition : null;

function InterviewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // Call State
    const [hasJoined, setHasJoined] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [showCaptions, setShowCaptions] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [permissionError, setPermissionError] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Dynamic Caption State
    const [charIndex, setCharIndex] = useState(0);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            synthesisRef.current = window.speechSynthesis;
        }
    }, []);

    // Handle Join Call
    const handleJoinCall = async () => {
        try {
            // Request immersive permissions
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setHasJoined(true);
            setIsMicOn(true);
            setPermissionError(false);

            // Initialize MediaRecorder
            // Note: We need a persistent audio stream for recording
            // Use a separate stream for recording if needed or reuse
            initRecording(stream);

            // Stop initial stream tracks? No, keep them for video ref if we pass it
            // Actually, setupStream handles the video element srcObject separately.
            // But for recording we might want to keep *this* stream reference or create a new one.
            // Let's rely on setupStream to get the stream for video, 
            // but we need a stream for recording.
            // Let's just create a new stream in setupStream for recording too or save it here.

            // Just stopping the tracks to be clean as setupStream will request again (which is slightly inefficient but safe for logic separation)
            stream.getTracks().forEach(track => track.stop());

        } catch (err) {
            console.error("Permission denied:", err);
            setPermissionError(true);
        }
    };

    const initRecording = async (stream: MediaStream) => {
        // This is just a placeholder, real init happens in setupStream or when mic is toggled
    };

    // Setup Camera & Mic & Recorder
    useEffect(() => {
        if (!hasJoined) return;

        let stream: MediaStream | null = null;

        async function setupStream() {
            try {
                // If video is on, get both. If off, get only audio for recording/mic
                const constraints = { video: isVideoOn, audio: true };
                stream = await navigator.mediaDevices.getUserMedia(constraints);

                if (videoRef.current && isVideoOn) {
                    videoRef.current.srcObject = stream;
                }

                // Setup MediaRecorder
                const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
                const recorder = new MediaRecorder(stream, { mimeType });

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorderRef.current = recorder;

            } catch (err) {
                console.error("Error setting up stream:", err);
                // Fallback: If video fails, try just audio
                if (isVideoOn) setIsVideoOn(false);
            }
        }
        setupStream();

        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [hasJoined, isVideoOn]);

    // Speech Recognition
    useEffect(() => {
        if (!SpeechRecognition || !hasJoined) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                    handleSend(finalTranscript);
                } else {
                    setInput(event.results[i][0].transcript);
                }
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'aborted' || event.error === 'no-speech' || event.error === 'network') return;
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') setIsMicOn(false);
        };

        recognitionRef.current = recognition;
    }, [hasJoined]);

    // Toggle Mic Logic (Recognition + Recorder)
    useEffect(() => {
        if (!hasJoined) return;

        // Speech Recognition Control
        if (recognitionRef.current) {
            if (isMicOn && !isSpeaking) {
                try { recognitionRef.current.start(); } catch (e) { }
            } else {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
        }

        // Recording Control
        // We only want to record when the user is answering (between AI questions)
        // Ideally we start recording when the user starts speaking or just always record
        // and slice? Simpler: Start recording when AI finishes speaking (user turn)
        // and stop when user sends answer.

    }, [isMicOn, hasJoined, isSpeaking]);

    // Handle recording state based on turn
    useEffect(() => {
        if (!mediaRecorderRef.current || !isMicOn) return;

        if (isSpeaking) {
            // AI is speaking, pause/stop recording user
            if (mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }
        } else {
            // AI finished, user turn. Start recording if not already.
            if (mediaRecorderRef.current.state === "inactive") {
                audioChunksRef.current = []; // Clear previous chunks
                try { mediaRecorderRef.current.start(); } catch (e) { console.error("Rec start fail", e); }
            }
        }
    }, [isSpeaking, isMicOn]);


    // Text to Speech with Dynamic Captions
    const speakText = (text: string) => {
        if (!synthesisRef.current) return;
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onstart = () => {
            setIsSpeaking(true);
            setCharIndex(0);
        };

        utterance.onboundary = (event) => {
            setCharIndex(event.charIndex);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setCharIndex(0);
        };

        utterance.onerror = () => setIsSpeaking(false);

        const voices = synthesisRef.current.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Samantha") || v.lang === 'en-US');
        if (preferredVoice) utterance.voice = preferredVoice;

        synthesisRef.current.speak(utterance);
    };

    // Helper: Get Current Sentence based on charIndex
    const getCurrentSentence = (text: string, index: number) => {
        if (!text) return "";
        const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];

        let runningLength = 0;
        for (const sentence of sentences) {
            if (index >= runningLength && index < runningLength + sentence.length) {
                return sentence.trim();
            }
            runningLength += sentence.length;
        }
        return sentences[sentences.length - 1]?.trim() || "";
    };

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || !sessionId) return;

        // Message is sent, stop recording immediately if still running
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            // Wait for 'stop' event to process chunks? 
            // The functionality of MediaRecorder is async. 
            // We need to wait for the dataavailable event which fires on stop.
            // Let's give it a tiny delay to ensure chunks are pushed.
            await new Promise(r => setTimeout(r, 100));

            // Upload audio
            if (audioChunksRef.current.length > 0) {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                uploadAudio(sessionId, audioBlob).catch(err => console.error("Audio upload failed", err));
                audioChunksRef.current = [];
            }
        }

        const userMsg = { role: "user", content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const data = await sendChat(sessionId, userMsg.content);
            const aiMsg = { role: "model", content: data.message };
            setMessages(prev => [...prev, aiMsg]);
            speakText(data.message);
            if (data.is_interview_ended) setIsCompleted(true);
        } catch (error) {
            console.error("Chat error", error);
        } finally {
            setLoading(false);
        }
    };

    const lastAiMessage = messages.length > 0 && messages[messages.length - 1].role === 'model' ? messages[messages.length - 1].content : "";
    const currentCaption = isSpeaking ? getCurrentSentence(lastAiMessage, charIndex) : null;

    // --- UI Components --- //

    if (!hasJoined) {
        return (
            <div className="relative h-screen w-full bg-black text-white flex flex-col items-center justify-center overflow-hidden font-sans">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-black z-0" />

                <div className="relative z-10 w-full max-w-md p-8 flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-t from-gray-800 to-gray-700 shadow-2xl flex items-center justify-center mb-8 ring-1 ring-white/10">
                        <Video className="w-12 h-12 text-white/80" />
                    </div>
                    <h1 className="text-4xl font-light tracking-tight text-white mb-2">Video Interview</h1>
                    <p className="text-white/50 mb-10 text-lg font-light">Join the session to begin.</p>
                    <button
                        onClick={handleJoinCall}
                        className="group relative w-full py-4 rounded-full bg-white text-black font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                    >
                        Join Now
                    </button>
                    {permissionError && (
                        <p className="mt-4 text-red-400 text-sm font-medium">Please allow camera & microphone access.</p>
                    )}
                    <Link href="/" className="mt-8 text-white/40 hover:text-white transition-colors text-sm">Cancel</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col font-sans">
            <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
                <div className={clsx(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-[120px] transition-all duration-1000 ease-in-out",
                    isSpeaking ? "scale-150 bg-purple-500/40 opacity-60" : "scale-100"
                )} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-20 flex items-center justify-between px-6 py-6 lg:px-12">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                    <span className="text-xs font-medium text-white/80 tracking-wide uppercase">Live Interview</span>
                </div>
                <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="p-3 rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                >
                    {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
            </div>

            <div className="flex-1 relative flex flex-col items-center justify-center p-6 lg:p-12 z-10">
                <div className="relative mb-8">
                    <div className={clsx(
                        "relative w-56 h-56 lg:w-72 lg:h-72 rounded-full transition-all duration-300 ease-out flex items-center justify-center",
                        isSpeaking ? "scale-110" : "scale-100"
                    )}>
                        <div className="absolute inset-2 bg-gradient-to-br from-indigo-300 via-purple-400 to-pink-400 rounded-full blur-sm opacity-90 animate-pulse" />
                        <div className={clsx(
                            "absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-[40px] opacity-40 transition-all duration-500",
                            isSpeaking ? "opacity-80 scale-125" : "opacity-40"
                        )} />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCaption + (input ? 'input' : '')}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="max-w-3xl text-center px-4"
                    >
                        {input && isMicOn ? (
                            <p className="text-2xl lg:text-4xl font-light text-white/60 tracking-tight leading-relaxed">
                                {input}...
                            </p>
                        ) : currentCaption ? (
                            <p className="text-2xl lg:text-4xl font-medium text-white tracking-tight leading-relaxed drop-shadow-2xl">
                                "{currentCaption}"
                            </p>
                        ) : (
                            !loading && <p className="text-lg font-light text-white/30">AI is listening...</p>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="relative z-30 pb-10 flex justify-center w-full px-6">
                <div className="flex items-center gap-6 px-8 py-4 bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl shadow-black/50">
                    <button
                        onClick={() => setIsMicOn(!isMicOn)}
                        className={clsx(
                            "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                            isMicOn ? "bg-white text-black shadow-lg shadow-white/20" : "bg-white/10 text-white hover:bg-white/20"
                        )}
                    >
                        {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </button>
                    <button
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className={clsx(
                            "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                            isVideoOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500/20 text-red-500"
                        )}
                    >
                        {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </button>
                    <div className="w-[1px] h-8 bg-white/10 mx-2" />
                    <Link href={`/report?session_id=${sessionId}`}>
                        <button className="h-14 px-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-all flex items-center gap-2">
                            <PhoneOff className="w-5 h-5" />
                            <span className="hidden sm:inline">End</span>
                        </button>
                    </Link>
                </div>
            </div>

            <motion.div
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.05}
                className="absolute md:top-12 md:right-12 top-6 right-6 w-32 h-44 md:w-48 md:h-72 bg-gray-900/50 backdrop-blur-md rounded-[24px] overflow-hidden shadow-2xl border border-white/10 z-40 cursor-grab active:cursor-grabbing"
            >
                {isVideoOn ? (
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <span className="text-white/20 text-xs font-medium uppercase tracking-widest">Camera Off</span>
                    </div>
                )}
            </motion.div>

        </div>
    );
}

export default function InterviewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <InterviewContent />
        </Suspense>
    );
}
