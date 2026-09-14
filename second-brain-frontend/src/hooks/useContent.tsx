import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../Config";

interface Content {
    _id: string;
    title: string;
    link: string;
    type: "youtube" | "twitter" | "bookmark";
}

export function useContent() {
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function refresh() {
        setLoading(true);
        setError("");

        try {
            const response = await axios.get(
                `${BACKEND_URL}/api/v1/content`,
                {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                }
            );

            setContents(response.data.content);
        } catch (e) {
            setError("Failed to load content. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
    }, []);

    return {
        contents,
        refresh,
        setContents,
        loading,
        error
    };
}