"use client";
import axios from "axios";
import { useEffect, useState } from "react";

type User = {
    name: string;
    totalMarks: number;
    percentage: number;
    awr: number;
};

const Leaderboard = () => {
    const [leaders, setLeaders] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                setLoading(true);
                const res = await axios.get("/api/leaderboard");

                const data = res.data;

                // Check if data is an array
                if (Array.isArray(data)) {
                    setLeaders(data);
                } else if (data && typeof data === 'object') {
                    // If it's an object with a data property that's an array
                    if (Array.isArray(data.data)) {
                        setLeaders(data.data);
                    } else {
                        // If it's some other object structure, try to convert to array
                        const usersArray = Object.values(data).filter(item =>
                            item && typeof item === 'object' && 'name' in item
                        );
                        setLeaders(usersArray as User[]);
                    }
                } else {
                    throw new Error("Invalid data format received from server");
                }
                setError(null);
            } catch (err) {
                console.error("Error fetching leaderboard data:", err);
                setError("Failed to load leaderboard data");
                setLeaders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    const getMedal = (rank: number) => {
        return rank === 1
            ? "🥇"
            : rank === 2
                ? "🥈"
                : rank === 3
                    ? "🥉"
                    : `🏅`;
    };

    if (error) {
        return (
            <div className="bg-white border p-4 rounded shadow-sm max-w-sm mx-auto text-sm">
                <h2 className="text-xl font-bold mb-4 text-center text-blue-700 underline">
                    🏆 World Leaderboard
                </h2>
                <p className="text-center text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white border p-4 rounded shadow-sm max-w-sm mx-auto text-sm">
            <h2 className="text-xl font-bold mb-4 text-center text-blue-700 underline">
                🏆 World Leaderboard 🏆
            </h2>

            {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : leaders.length === 0 ? (
                <p className="text-center text-gray-500">No data available</p>
            ) : (
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="text-left p-2 border">Rank</th>
                            <th className="text-left p-2 border">Name</th>
                            <th className="text-center p-2 border">Marks</th>
                            <th className="text-center p-2 border">%age</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaders.map((user, index) => (
                            <tr key={index} className="border-t">
                                <td className="p-2 border text-left font-bold">
                                    {getMedal(user.awr)} {index + 1}
                                </td>
                                <td className="p-2 border text-left">{user.name}</td>
                                <td className="p-2 border text-center">{user.totalMarks}</td>
                                <td className="p-2 border text-center">{user.percentage}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Leaderboard;