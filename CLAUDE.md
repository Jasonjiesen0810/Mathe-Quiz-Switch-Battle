# Translation projects (`translations/`)

Chinese podcast transcripts are turned into English speeches. Each project lives in its own folder (`translations/NN-topic/`) with `source_zh.txt`, `speech_en.md` and `notes.md` (notes in German).

- The final deliverable is always a PDF. After changing any Markdown file, rebuild with
  `pip install -q markdown && python3 translations/build_pdf.py translations/NN-topic`
  and send the PDFs (not the .md files) to the user.
- Mark English additions in the speech with **[square brackets]** and list them in the notes.
