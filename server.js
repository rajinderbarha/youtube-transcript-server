const express = require("express");
const cors = require("cors");
const { YoutubeTranscript } = require("youtube-transcript");

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Converts transcript data to a formatted SRT subtitle format.
 * @param {Array} transcript - Transcript array from YouTube.
 * @returns {string} - SRT formatted transcript.
 */
function formatToSRT(transcript) {
    return transcript.map((entry, index) => {
        const start = new Date(entry.offset * 1000).toISOString().substr(11, 8) + ",000";
        const end = new Date((entry.offset + entry.duration) * 1000).toISOString().substr(11, 8) + ",000";
        return `${index + 1}\n${start} --> ${end}\n${entry.text.replace(/&amp;#39;/g, "'")}\n`;
    }).join("\n");
}

/**
 * Converts transcript data to a simple timestamped format.
 * @param {Array} transcript - Transcript array from YouTube.
 * @returns {string} - Formatted transcript with timestamps.
 */
function formatTranscript(transcript) {
    return transcript.map((entry) => {
        const formattedStart = new Date(entry.offset).toISOString().substr(11, 12).replace(',', '.');
        return `${formattedStart} ${entry.text.replace(/&amp;#39;/g, "'")}`;
    }).join("\n");
}

/**
 * Endpoint to fetch and format YouTube transcript.
 */
app.get("/transcript", async (req, res) => {
    const videoId = req.query.videoId;

    if (!videoId) {
        return res.status(400).json({ error: "Missing video ID" });
    }

    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        if (!transcript.length) {
            return res.status(404).json({ error: "No transcript found for this video" });
        }

        const formattedTranscript = formatTranscript(transcript);
        res.setHeader("Content-Type", "text/plain");
        res.send(formattedTranscript);

    } catch (error) {
        console.error("Error fetching transcript:", error.message);
        res.status(500).json({ error: "Failed to fetch transcript. Please check the video ID and try again." });
    }
});

/**
 * Health check endpoint.
 */
app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

/**
 * Start server.
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
