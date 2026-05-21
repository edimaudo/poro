from flask import Flask, render_template

app = Flask(__name__)

MUSIC_LIBRARY = {
    "Rain": [
        {"name": "Rainy Day Lofi", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"},
        {"name": "Coffee Shop Rain", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"},
        {"name": "Midnight Rain", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"},
        {"name": "Storm & Chill", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"},
    ],
    "Lofi": [
        {"name": "Study Session", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"},
        {"name": "Nostalgic Vibes", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"},
        {"name": "Late Night Beats", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"},
        {"name": "Chill Focus", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"},
    ],
    "Nature": [
        {"name": "Forest Morning", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"},
        {"name": "Ocean Breeze", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"},
        {"name": "Birdsong Meadow", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3"},
        {"name": "Mountain Stream", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"},
    ],
    "Electronic": [
        {"name": "Synthwave Focus", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3"},
        {"name": "Digital Dreams", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3"},
        {"name": "Ambient Pulse", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3"},
        {"name": "Neural Networks", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"},
    ],
}

@app.route("/")
def index():
    return render_template("index.html", music_library=MUSIC_LIBRARY)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
