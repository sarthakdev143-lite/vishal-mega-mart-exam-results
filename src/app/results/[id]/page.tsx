'use client';

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import confetti from "canvas-confetti";
import Leaderboard from "@/components/Leaderboard";

const SUBJECT_NAMES: Record<string, string> = {
    securityPoseAesthetics: "Security Pose Aesthetics",
    wrestling: "कुश्ती",
    shoppingCartDragRace: "Shopping Cart Drag Race",
    auntyCrowdManagement: "Aunty Crowd Management",
    fakeSirenSound: "Fake Siren Sound Making (Oral)",
};

const GRADE_SYSTEM = [
    { min: 91, grade: "A1" },
    { min: 81, grade: "A2" },
    { min: 71, grade: "B1" },
    { min: 61, grade: "B2" },
    { min: 51, grade: "C1" },
    { min: 41, grade: "C2" },
    { min: 33, grade: "D" },
    { min: 0, grade: "E (Fail)" },
];

const getGrade = (mark: number) => {
    return GRADE_SYSTEM.find(g => mark >= g.min)?.grade || "-";
};

type Result = {
    name: string;
    marks: Record<string, { theory?: number; practical?: number }>;
};

export default function ResultPage() {
    const params = useParams();
    const id = params?.id;
    const [result, setResult] = useState<Result | null>(null);
    const [error, setError] = useState("");
    const [copySuccess, setCopySuccess] = useState(false);
    const qrRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchResult = async () => {
            try {
                const res = await fetch(`/api/results/${id}`);
                if (!res.ok) throw new Error("Failed to fetch result");
                const data = await res.json();
                setResult(data);
                confetti({ particleCount: 200, spread: 143 });
            } catch (e) {
                setError("Could not load result : \n" + e);
            }
        };

        fetchResult();
    }, [id]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleDownloadQR = () => {
        const canvas = qrRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `${result?.name}_VMMEE_Result_QR.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    if (error) {
        return <div className="text-center mt-20 text-red-600">{error}</div>;
    }

    if (!result) {
        return <div className="text-center mt-20 text-gray-500">Loading result...</div>;
    }

    const subjectRows = Object.entries(result.marks).map(([subjectKey, value]) => {
        const theory = value.theory || 0;
        const practical = value.practical || 0;
        const total = theory + practical;
        return {
            subjectKey,
            name: SUBJECT_NAMES[subjectKey] || subjectKey,
            theory,
            practical,
            total,
            grade: getGrade(total),
        };
    });

    const totalMarks = subjectRows.reduce((acc, s) => acc + s.total, 0);
    const maxMarks = subjectRows.length * 100;
    const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
    const status = totalMarks / maxMarks >= 0.35 ? "ACCEPTED ✅" : "REJECTED ❌";

    return (
        <>
            <div className="flex py-8 px-6 justify-evenly">
                <div className="max-w-4xl p-6 bg-white rounded shadow border border-gray-300 relative">
                    <h1 className="text-3xl font-bold mb-4 text-center text-[#004276] underline">Vishal Mega Mart Enterence Examination (VMMEE)</h1>
                    <h2 className="text-xl font-semibold mb-6 text-center">Marksheet of {result.name}</h2>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full border text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-2 py-1">S.No</th>
                                    <th className="border px-2 py-1 text-left">Subject</th>
                                    <th className="border px-2 py-1">Theory (80)</th>
                                    <th className="border px-2 py-1">Practical (20)</th>
                                    <th className="border px-2 py-1">Total (100)</th>
                                    <th className="border px-2 py-1">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjectRows.map((row, i) => (
                                    <tr key={row.subjectKey}>
                                        <td className="border px-2 py-1 text-center">{i + 1}</td>
                                        <td className="border px-2 py-1">{row.name}</td>
                                        <td className="border px-2 py-1 text-center">{row.theory}</td>
                                        <td className="border px-2 py-1 text-center">{row.practical}</td>
                                        <td className="border px-2 py-1 text-center">{row.total}</td>
                                        <td className="border px-2 py-1 text-center">{row.grade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 text-sm">
                        <p><strong>Total Marks:</strong> {totalMarks} / {maxMarks}</p>
                        <p><strong>Percentage:</strong> {percentage}%</p>
                        <p><strong>Status:</strong> {status}</p>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col items-center">
                            <h3 className="font-semibold text-base mb-2">Share via QR Code:</h3>
                            <div className="inline-block bg-white p-2 rounded border">
                                <QRCodeCanvas
                                    value={typeof window !== "undefined" ? window.location.href : ""}
                                    size={140}
                                    ref={qrRef}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            <button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                                🖨️ Print Result
                            </button>
                            <button onClick={handleCopyLink} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                                {copySuccess ? "✅ Copied!" : "🔗 Copy Link"}
                            </button>
                            <button onClick={handleDownloadQR} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                                ⬇️ Download QR
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 text-xs text-gray-500 border-t pt-2">
                        * This result is for meme purposes only. Any resemblance to real exams is purely coincidental.
                    </div>
                </div>
                <div className="w-1/3">
                    <Leaderboard />
                </div>
            </div>
        </>
    );
}
