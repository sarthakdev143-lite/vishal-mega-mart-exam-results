'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function generateCaptcha() {
    const a = Math.floor(1 + Math.random() * 9);
    const b = Math.floor(1 + Math.random() * 9);
    const operator = Math.random() > 0.5 ? "+" : "-";
    const question = `${a} ${operator} ${b}`;
    const answer = operator === "+" ? a + b : a - b;
    return { question, answer };
}

const Results = () => {
    const [student, setStudent] = useState({ name: "", email: "" });
    const [captchaInput, setCaptchaInput] = useState("");
    const [captcha, setCaptcha] = useState<{ question: string; answer: number } | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!student.name || !student.email) {
            setError("Name and email are required!");
            setLoading(false);
            return;
        }

        if (parseInt(captchaInput) !== captcha?.answer) {
            setError("CAPTCHA is incorrect!");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post("/api/results", student);
            router.push(`/results/${res.data._id}`);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const msg = err.response?.data?.message || `Server error (${err.response?.status})`;
                setError(msg);
            } else {
                setError("Something went wrong.");
            }
        } finally {
            setStudent({ name: "", email: "" });
            setCaptcha(generateCaptcha());
            setCaptchaInput("");
            setLoading(false);
        }
    };

    useEffect(() => {
        setCaptcha(generateCaptcha());
    }, []);

    return (
        <div className="mt-16 flex items-center justify-center px-4">
            <div className="max-w-md w-full p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="text-4xl text-center mb-6">🛡️</div>

                <form onSubmit={handleSubmit} autoComplete="on">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        className="border p-2 w-full mb-4 rounded focus:ring-2 focus:ring-blue-300 outline-none"
                        value={student.name}
                        onChange={(e) => setStudent({ ...student, name: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="border p-2 w-full mb-4 rounded focus:ring-2 focus:ring-blue-300 outline-none"
                        value={student.email}
                        onChange={(e) => setStudent({ ...student, email: e.target.value })}
                    />
                    <div className="flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            placeholder={captcha ? `Solve: ${captcha.question}` : "Loading Captcha..."}
                            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-300 outline-none"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setCaptcha(generateCaptcha())}
                            className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
                            title="Refresh CAPTCHA"
                        >
                            🔄
                        </button>
                    </div>


                    {error && <p className="text-red-500 mb-3 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-[#0068A9] text-white px-4 py-2 rounded w-full text-center transition ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#005180]"
                            }`}
                    >
                        {loading ? "Loading..." : "Get Result"}
                    </button>
                </form>

                <p className="mt-6 text-xs text-gray-400 text-center">
                    🤫 This page is just for laughs. Don't take it seriously.
                </p>
            </div>
        </div>
    );
};

export default Results;
