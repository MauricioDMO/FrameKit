export function snapshotEnv (): NodeJS.ProcessEnv {
  return { ...process.env }
}
