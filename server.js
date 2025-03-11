const express = require("express");
const cors = require("cors");
const { YoutubeTranscript } = require("youtube-transcript");

const app = express();
app.use(cors());
app.use(express.json());

function formatToSRT(transcript) {
    console.log("Formatting transcript into SRT format...");
    return transcript.map((entry, index) => {
        const start = new Date(entry.offset * 1000).toISOString().substr(11, 8) + ",000";
        const end = new Date((entry.offset + entry.duration) * 1000).toISOString().substr(11, 8) + ",000";
        console.log(`Entry ${index + 1}: Start: ${start}, End: ${end}, Text: ${entry.text.substring(0, 50)}...`);
        return `${index + 1}\n${start} --> ${end}\n${entry.text.replace(/&amp;#39;/g, "'")}\n`;
    }).join("\n");
}

function formatTranscript(transcript) {
    console.log("Formatting transcript into required format...");
    return transcript.map((entry) => {
        // Convert offset (start time) from milliseconds to HH:MM:SS.sss format
        const startSeconds = entry.offset / 1000;
        const formattedStart = new Date(startSeconds * 1000).toISOString().substr(11, 12).replace(',', '.');

        // Replace special characters
        const text = entry.text.replace(/&amp;#39;/g, "'");

        return `${formattedStart} ${text}`;
    }).join("\n");
}


app.get("/transcript", async (req, res) => {
    const videoId = req.query.videoId;
    console.log("Received request for video ID:", videoId);

    if (!videoId) {
        console.error("Missing video ID in request.");
        return res.status(400).json({ error: "Missing video ID" });
    }

    try {
        console.log("Fetching transcript from YouTube...");
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        console.log("Transcript fetched successfully. First entry:", transcript[0]);

        // const srt = formatToSRT(transcript);
        const formattedTranscript = formatTranscript(transcript);
        console.log("Formatted transcript to SRT. Sending response...");
        res.setHeader("Content-Type", "text/plain");
        // res.send(srt);
        res.send(formattedTranscript);

    } catch (error) {
        console.error("Error fetching transcript:", error);
        res.status(500).json({ error: "Failed to fetch transcript" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
