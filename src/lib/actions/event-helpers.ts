// Shared parsing helpers for the event create/update forms. Plain module
// (not "use server") since these are synchronous — exporting them from a
// "use server" file would be rejected by Next.js, which requires every
// export of such a file to be an async server action.
export function parseSpeakers(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, title] = line.split("|").map((part) => part.trim());
      return { name: name ?? line, title: title ?? "" };
    });
}

export function parseAgenda(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [time, title] = line.split("|").map((part) => part.trim());
      return { time: time ?? "", title: title ?? line };
    });
}
