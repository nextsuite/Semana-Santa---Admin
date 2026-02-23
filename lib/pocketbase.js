import PocketBase from 'pocketbase';

export function createPocketBase() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  // Disable auto-cancellation for simpler handling in this admin panel
  pb.autoCancellation(false);
  return pb;
}
