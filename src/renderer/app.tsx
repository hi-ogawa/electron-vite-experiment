import React from "react";
import { mainServiceClient } from "./service-client";

export function App() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    // TODO: proxy
    // TODO: unsubscribe
    mainServiceClient.subscribe("timer", () => {
      console.log("timer");
    });
  }, []);

  React.useEffect(() => {
    (async () => {
      const result = await mainServiceClient.hello("project");
      console.log(result);
    })();
  }, []);

  return (
    <div className="h-full bg-gray-50">
      <div className="h-full flex justify-center items-center p-2">
        <div className="w-sm max-w-full flex flex-col items-center gap-3 p-5 bg-white border">
          <div>Counter = {count}</div>
          <button
            className="w-full bg-gray-600 hover:bg-gray-700 text-white border"
            onClick={() => setCount((v) => v + 1)}
          >
            +1
          </button>
        </div>
      </div>
    </div>
  );
}
