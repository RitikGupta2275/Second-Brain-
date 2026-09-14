/// <reference path="./types/express.d.ts" />
import express from "express";
import mongoose from "mongoose";
import { z } from "zod";
import bcrypt from "bcrypt";
import "dotenv/config";
import cors from "cors";


import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { requiredSchema, signinSchema } from "./schema/AuthSchema.js";
import { userMiddleware } from "./middlewares/userMiddleware.js";
import { random } from "./utils.js";

const app = express();
app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "Second Brain Backend Server is Running 🚀",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/v1/health", (req, res) => {
    res.json({
        status: "healthy",
        uptime: process.uptime()
    });
});

const mongoUrl = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;

if (!mongoUrl) {
    throw new Error("MONGO_URL is not defined");
}

if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
}

app.post("/api/v1/signup", async (req, res) => {

    try {
        const requiredBody = requiredSchema;

        const parsedBody = requiredBody.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(411).json({
                message: "error in inputs",
            })
        }

        const { username, password } = parsedBody.data;
        const existingUser = await UserModel.findOne({ username })

        if (existingUser) {
            return res.status(403).json({
                message: "user already exists with this username"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await UserModel.create({
            username,
            password: hashedPassword
        })

        res.status(200).json({
            message: "Signed Up"
        })
    } catch (error) {
        res.status(500).json({
            message: "server error"
        })
    }
})

app.post("/api/v1/signin", async (req, res) => {

    try {

        const parsedBody = signinSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                message: "wrong input format"
            })
        }

        const { username, password } = parsedBody.data;

        const existUser = await UserModel.findOne({ username });
        if (!existUser) {
            return res.status(403).json({
                message: "incorrect username or password"
            })
        }

        const hashedPassword = existUser.password;
        const isMatched = await bcrypt.compare(password, hashedPassword);
        if (!isMatched) {
            return res.status(403).json({
                message: "incorrect username or password"
            })
        }

        const token = jwt.sign(
            { id: existUser._id },
            jwtSecret,
            { expiresIn: "1h" }
        );
        return res.status(200).json({
            token: token
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server error"
        })
    }
})

app.get("/api/v1/me", userMiddleware, async (req, res) => {

    try {
        const user = await UserModel.findById(req.userId).select("username");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            username: user.username
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server error"
        });
    }
});

app.get("/api/v1/fetch-title", userMiddleware, async (req, res) => {
    const url = req.query.url as string;
    if (!url) {
        return res.status(400).json({ message: "URL is required" });
    }

    try {
        // Check if YouTube
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
            if (oembedRes.ok) {
                const data = (await oembedRes.json()) as { title?: string };
                if (data.title) {
                    return res.json({ title: data.title, type: "youtube" });
                }
            }
        }

        // Check if Twitter / X
        if (url.includes("twitter.com") || url.includes("x.com")) {
            const statusMatch = url.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/);
            if (statusMatch) {
                const username = statusMatch[1];
                const statusId = statusMatch[2];
                try {
                    const fxRes = await fetch(`https://api.fxtwitter.com/${username}/status/${statusId}`);
                    if (fxRes.ok) {
                        const fxData = (await fxRes.json()) as any;
                        if (fxData && fxData.tweet && fxData.tweet.text) {
                            return res.json({
                                title: fxData.tweet.text,
                                type: "twitter"
                            });
                        }
                    }
                } catch {
                    // fallback to oembed
                }
            }

            // Fallback to publish.twitter.com
            try {
                const twitterUrl = url.replace("x.com", "twitter.com");
                const oembedRes = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(twitterUrl)}`);
                if (oembedRes.ok) {
                    const data = (await oembedRes.json()) as { author_name?: string; html?: string };
                    let tweetText = "";
                    if (data.html) {
                        const match = data.html.match(/<p[^>]*>(.*?)<\/p>/s);
                        if (match && match[1]) {
                            tweetText = match[1].replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
                        }
                    }
                    const title = tweetText ? `"${tweetText}" — ${data.author_name || ""}`.trim() : (data.author_name ? `Tweet by ${data.author_name}` : "Twitter Post");
                    return res.json({ title, type: "twitter" });
                }
            } catch {
                // ignore
            }
        }

        // General webpage fetch fallback
        const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
            return res.json({ title: titleMatch[1].trim() });
        }

        return res.json({ title: "" });
    } catch (e) {
        return res.json({ title: "" });
    }
});


app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const link = req.body.link;
    const title = req.body.title;
    const type = req.body.type;

    await ContentModel.create({
        link,
        title,
        type,
        userId: req.userId,
        tags: []
    })

    return res.status(200).json({
        message: "Content Added"
    })
})

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username").sort({ _id: 1 });
    res.json({
        content
    })
})

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const _id = req.body.contentId;

    await ContentModel.deleteOne({
        _id,
        userId: req.userId
    })

    res.json({
        message: "content deleted"
    })
})

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    const share = req.body.share;
    if (share) {
        const existingLink = await LinkModel.findOne({
            userId: req.userId
        });

        if (existingLink) {
            res.json({
                hash: existingLink.hash
            })
            return;
        }

        const hash = random(10);
        await LinkModel.create({
            userId: req.userId,
            hash: hash
        })
        res.json({
            hash
        })
    } else {
        await LinkModel.deleteOne({
            userId: req.userId
        })
        res.json({
            message: "Removed Link"
        })
    }
})

app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
        hash
    })

    // !link.userId confirming userId must be in link Schema
    // use this or make userId required is true in linkSchema 
    if (!link || !link.userId) {
        res.status(403).json({
            message: "sorry incorrect input"
        })
        return;
    }

    const content = await ContentModel.find({
        userId: link.userId
    })

    const user = await UserModel.findOne({
        _id: link.userId
    })

    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return;
    }

    res.json({
        username: user.username,
        content: content
    })
})


// Database Connection 
mongoose.connect(mongoUrl)
    .then(() => {
        console.log("database connected");
        app.listen(3000, () => {
            console.log("server is running");
        })
    })
    .catch((error) => {
        console.log("database connection failed", error);
    })
