import { ViteDevServer } from "vite";
import { MessageID, ResponseEventMap, StudioEventMap } from "../types.js";
import { IncomingMessage } from "http";

/**
 * Registers a listener for the given messageId,
 * and handle response from server back to client.
 */
export function registerListener<T extends MessageID>(
  server: ViteDevServer,
  messageId: T,
  listener: (data: StudioEventMap[T]) => Promise<string>
) {
  server.middlewares.use(async (req, res, next) => {
    if (req.url === `/${messageId}`) {
      const requestBody = await parseRequestBody<T>(req);
      const responsePayload = await getResponsePayload(messageId, () =>
        listener(requestBody)
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(responsePayload));
    } else {
      next();
    }
  });
}

async function getResponsePayload<T extends MessageID>(
  messageId: T,
  handler: () => Promise<string>
): Promise<ResponseEventMap[T]> {
  try {
    const msg = await handler();
    return {
      type: "success",
      msg,
    };
  } catch (error: unknown) {
    let msg = `Error occurred for event ${messageId}`;
    if (typeof error === "string") {
      msg = error;
    } else if (error instanceof Error) {
      msg = error.message;
    }
    console.error(error);
    return {
      type: "error",
      msg,
    };
  }
}

function parseRequestBody<T extends MessageID>(
  req: IncomingMessage
): Promise<StudioEventMap[T]> {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any[] = [];
    req
      .on("data", (chunk) => body.push(chunk))
      .on("end", () => {
        const stringifiedBody = Buffer.concat(body).toString();
        const requestBody: StudioEventMap[T] = JSON.parse(stringifiedBody);
        resolve(requestBody);
      });
  });
}
