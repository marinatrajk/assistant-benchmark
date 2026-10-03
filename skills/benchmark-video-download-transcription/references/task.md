# Video download and transcription

Protocol: `assistant-benchmark-media-v1`, version `1.0.0`. Task: `video-download-transcription`.

## Prompt

Download these two videos and transcribe everything spoken in each:

- YouTube: https://www.youtube.com/watch?v=7lmSll_GVCg
- TikTok: https://www.tiktok.com/t/ZTymk7jrT/

Give me both playable video files with their audio, a readable transcript and a timestamped SRT or VTT file for each, and a short note identifying the sources, transcription methods and any unclear passages.

## Attempt and source handling

Use the URLs in `assets/task.json`; an operator override must be recorded before the attempt and used consistently across compared assistants. Follow the TikTok short link and record its observed destination and video identity. Do not guess a canonical URL, replace an unavailable video with a search result, or infer speech from titles, descriptions, comments or on-screen text.

Use the assistant's own existing download, media and transcription tools, including already available command-line tools where supported. The skill provides the assignment and validator, not a downloader or transcription service. Do not install missing capabilities during the measured run. Disclose tools and whether the transcript came from speech recognition, human captions, automatic captions, or a combination. Captions are permitted as an input only with audio verification; caption retrieval alone does not complete the task.

One attempt covers both sources: 20 active minutes and 120 tool calls where measurable. Include downloading, conversion, transcription, media processing waits, verification and recovery in the budget. Report assembly and waiting for required user input are excluded from active time. Allocate time to attempt both sources; one failure must not prevent trying the other. Record limits or timing that cannot be enforced. Use a new run ID for a later retry.

Record access failures, expired redirects, unavailable captions, region restrictions, login requirements and missing tools as observed. Preserve available outputs and per-source evidence. If only one source completes, the combined task is partial while the other source remains unverified. Use blocked for access preventing execution, unsupported when the required capability is absent before any task action, and failed for demonstrated incorrect output or exhausted measured budget. Never turn inability to observe a video into invented speech or a passed check.

## Required checks

Apply the same standard to each source:

| Check ID | Evidence required for a pass |
| --- | --- |
| `youtube-source` | Observe the supplied YouTube video's identity, URL, title/creator where available and full duration; connect those observations to the downloaded file. |
| `youtube-download` | Deliver the full, nonempty video with its audio; inspect media tracks and duration, and observe successful playback/decoding. A webpage, thumbnail, streaming URL, audio-only file or short clip does not pass. |
| `youtube-transcript` | Deliver a complete original-language transcript of the audible speech, plus SRT or VTT with ordered, nonnegative timestamps within the observed media duration. Preserve meaning, names and numbers; mark uncertainty and unintelligible speech instead of guessing. A summary or translation alone does not pass. |
| `youtube-verification` | Verify transcript coverage through the whole recording and compare the audio against transcript segments using the sampling procedure below. Save the observed time ranges, findings, corrections and any unresolved gaps. |
| `tiktok-source` | Observe the short-link redirect destination and the TikTok video's identity, URL, title/creator where available and full duration; connect those observations to the downloaded file. |
| `tiktok-download` | Meet the same full-video, audio, duration and playback requirements as the YouTube download. |
| `tiktok-transcript` | Meet the same completeness, language, fidelity and timestamp requirements as the YouTube transcript. |
| `tiktok-verification` | Apply the same audio comparison and coverage procedure to the TikTok transcript. |
| `usable-artifacts` | Hand back both videos, both readable transcripts, both subtitle files and `sources.json` with usable paths or download links. Cite the delivered files and verification records in the one-task report; verify the files open. |

## Audio verification and review

For each video, compare at least 15 seconds of speech near the beginning, middle and end against the corresponding transcript, using non-overlapping windows where possible. If the video is 45 seconds or shorter, check all of it. Shift a window to nearby speech if the selected region is silent; record the actual ranges. For speech-free videos, verify that the whole clip has no speech and label it accordingly; do not manufacture a transcript to fill silence.

Inspect all subtitle segments for ordering, overlap errors, out-of-range times and unexplained gaps in spoken sections. There must be no omitted spoken section, fabricated sentence or meaning-changing error in the verified samples. Small punctuation and casing differences are acceptable. Correct errors found during the attempt and retain the correction record. Explicitly mark any unresolved inaudible passages and explain whether they prevent verification. Genuine silence is not missing transcription.

An independent reviewer repeats these comparisons on the delivered media, checks coverage, and may inspect additional regions when errors are found. No fixed reference transcript or confirmed video metadata is shipped in this skill. Sampling supplies evidence about fidelity; it is not a claim that every word was independently verified. The validator checks report structure and referenced files, not the truth of the transcript or whether the media decodes.

## Deliverables and provenance

Use separate `youtube/` and `tiktok/` folders, each containing a video in a usable format, `transcript.txt`, `transcript.srt` or `transcript.vtt`, and a verification note or structured record. Include the full transcript rather than only the sampled sections. Speaker labels are optional and must not invent identities. Mark relevant non-speech audio and unintelligible passages with timestamps.

Include `sources.json` with a `sources` array, one entry per platform. For each entry record:

- platform, original URL, observed resolved URL, video ID, title, creator and observation time with UTC offset;
- per-source outcome and blocker/limitation, if any;
- observed full duration, downloaded duration, media format and audio/video track information;
- bundle-relative media, transcript, subtitle and verification paths; file sizes and SHA-256 hashes;
- download method, transcription method and tools, spoken language, caption source/type if used, and any transformation or conversion;
- verification time ranges, coverage findings, corrections and unresolved passages, with evidence references.

Leave unavailable metadata null and explain why. Do not claim a value inferred from a filename or an inaccessible page was observed. Missing deliverables stay absent/null with a reason; do not use empty placeholder files as completed outputs.

Return `assistant-benchmark-video-download-transcription-results.json` using the supplied report template, citing per-platform source observations, download/processing records, verification and output files. Leave the report unreviewed. Deliver the media and transcripts to the operator; this task does not ask for them to be published on the benchmark website.
