import { useParams, Link } from "react-router-dom";
import { Header } from "../components/ui/Header";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../Config";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

interface Content {
    _id: string;
    title: string;
    link: string;
    type: "youtube" | "twitter";
    userId?: {
        _id: string;
        username: string;
    };
}

export function ShareBrain() {
    const { hash } = useParams();

    const [contents, setContents] = useState<Content[]>([]);
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function getContent() {
            setLoading(true);
            setError("");

            try {
                const response = await axios.get(
                    `${BACKEND_URL}/api/v1/brain/${hash}`
                );

                setContents(response.data.content || []);
                setUsername(response.data.username || "");
            } catch (e) {
                setError("Unable to load shared brain. The link may have expired or is invalid.");
            } finally {
                setLoading(false);
            }
        }

        if (hash) {
            getContent();
        }
    }, [hash]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header username={username} />

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {/* Loading Skeleton */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse space-y-4 flex flex-col justify-between min-h-65"
                            >
                                <div>
                                    <div className="flex justify-between items-center pb-2">
                                        <div className="h-5 w-20 bg-slate-200 rounded-md" />
                                        <div className="size-7 bg-slate-200 rounded-lg" />
                                    </div>
                                    <div className="space-y-2 mt-3">
                                        <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                                        <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                                    </div>
                                </div>
                                <div className="aspect-video bg-slate-200 rounded-xl w-full" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    /* Error State */
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-lg mx-auto mt-8">
                        <div className="size-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Shared Brain Unavailable</h3>
                        <p className="text-sm text-slate-500 mb-6">{error}</p>
                        <Link to="/signup">
                            <Button variant="primary" text="Create Your Own Brain" size="md" />
                        </Link>
                    </div>
                ) : contents.length === 0 ? (
                    /* Empty Collection */
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-300 max-w-md mx-auto mt-8">
                        <p className="text-base font-semibold text-slate-800">This shared brain is empty</p>
                        <p className="text-sm text-slate-500 mt-1 mb-6">The owner has not added any public links yet.</p>
                        <Link to="/signup">
                            <Button variant="primary" text="Start Your Own Second Brain" size="md" />
                        </Link>
                    </div>
                ) : (
                    /* Content Feed (Read-Only Responsive Grid) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 items-stretch">
                        {contents.map(({ type, link, title, _id }) => (
                            <div key={_id} className="h-full">
                                <Card
                                    id={_id}
                                    type={type}
                                    link={link}
                                    title={title}
                                />
                            </div>
                        ))}
                    </div>



                )}
            </main>
        </div>
    );
}
