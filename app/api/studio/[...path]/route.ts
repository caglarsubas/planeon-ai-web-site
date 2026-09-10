// Node-only auth, files and inference stay in the local service, never in the Worker bundle.
import { studioProxy } from '@/lib/studio/proxy';
export const GET = studioProxy;
export const POST = studioProxy;
export const DELETE = studioProxy;
