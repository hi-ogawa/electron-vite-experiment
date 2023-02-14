import "virtual:windi.css";
import { tinyassert } from "@hiogawa/utils";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { initializeMainServiceClient } from "./service-client";

async function main() {
  await initializeMainServiceClient();

  const el = document.querySelector("#root");
  tinyassert(el);
  const root = createRoot(el);
  root.render(<App />);
}

main();
