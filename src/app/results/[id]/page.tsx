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
    { min: 80, grade: "A" },
    { min: 60, grade: "B" },
    { min: 35, grade: "C" },
    { min: 0, grade: "F (Fail)" },
];

const getGrade = (mark: number) => {
    return GRADE_SYSTEM.find(g => mark >= g.min)?.grade || "-";
};

type Result = {
    name: string;
    marks: Record<string, { theory?: number; practical?: number }>;
    totalMarks: number;
    percentage: number;
    awr: number;
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

    const cutoff = 65;
    const maxMarks = subjectRows.length * 100;
    const status = result.totalMarks / maxMarks >= (cutoff / 100) ? "ACCEPTED ✅" : "REJECTED ❌";

    return (
        <>
            <div className="flex py-8 sm:mt-12 mt-5 sm:px-6 px-2 justify-evenly gap-4 flex-wrap">
                <div className="w-auto sm:p-6 p-4 flex flex-col sm:items-center bg-white rounded shadow border border-gray-300 relative overflow-hidden">
                    <h1 className="text-3xl font-bold mb-4 text-center text-[#004276] underline">Vishal Mega Mart Enterence Examination (VMMEE)</h1>
                    <h2 className="text-xl font-semibold mb-6 text-center">Marksheet of {result.name}</h2>

                    <div className="max-w-auto overflow-x-auto">
                        <table className="border text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-2 py-1 sm:px-3 sm:py-2">S.No</th>
                                    <th className="border px-2 py-1 sm:px-3 sm:py-2 text-left">Subject</th>
                                    <th className="border px-2 py-1 sm:px-3 sm:py-2">Theory (80)</th>
                                    <th className="border px-2 py-1 sm:px-3 sm:py-2">Practical (20)</th>
                                    <th className="border px-2 py-1 sm:px-3 sm:py-2">Total (100)</th>
                                    <th className="border px-2 py-1 sm:px-3 sm:py-2">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjectRows.map((row, i) => (
                                    <tr key={row.subjectKey} className="even:bg-gray-50">
                                        <td className="border px-2 py-1 sm:px-3 sm:py-2 text-center">{i + 1}</td>
                                        <td className="border px-2 py-1 sm:px-3 sm:py-2">
                                            <div className="font-medium">{row.name}</div>
                                        </td>
                                        <td className="border px-2 py-1 sm:px-3 sm:py-2 text-center">{row.theory}</td>
                                        <td className="border px-2 py-1 sm:px-3 sm:py-2 text-center">{row.practical}</td>
                                        <td className="border px-2 py-1 sm:px-3 sm:py-2 text-center font-medium">{row.total}</td>
                                        <td className="border px-2 py-1 sm:px-3 sm:py-2 text-center">
                                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                                                {row.grade}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 text-sm sm:grid sm:grid-cols-2 gap-x-6 gap-y-2">
                        <p><strong>Total Marks:</strong> {result.totalMarks} / {maxMarks}</p>
                        <p><strong>Status:</strong> {status}</p>
                        {result.awr && <p><strong>All World Rank (AWR):</strong> #{result.awr}</p>}
                        <p><strong>Percentage:</strong> {result.percentage}%</p>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Cut-off : {cutoff}%</p>

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
                <div>
                    <Leaderboard />
                </div>
            </div>
        </>
    );
}
