# assets

Drop a background-music file here named `music.mp3` and a play/pause button appears automatically in the bottom-right corner of the site — no code changes needed. It also starts playing on its own the moment a guest taps the envelope open (browsers require that tap before any audio can play at all).

Easiest way to add or replace it: open this folder on github.com, click **Add file → Upload files**, and upload an `music.mp3`. That's it — GitHub Pages picks it up on the next rebuild (usually under a minute).

Use whatever you like here — it's entirely your call what to upload. If no file is present, the button simply stays hidden.

`assets/*.mp3` is gitignored locally as a safety net so a broad `git add` from this side never commits an audio file by accident — it has no effect on files you upload directly through github.com.
