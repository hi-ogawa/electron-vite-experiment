import { Compose } from "@hiogawa/utils-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import toast from "react-hot-toast";
import { CHANGE_COUNTER } from "../main/common";
import { CustomQueryClientProvider, ToasterWrapper } from "./components/misc";
import { mainServiceClient, mainServiceEventEmitter } from "./service-client";

export function App() {
  return (
    <Compose
      elements={[
        <CustomQueryClientProvider />,
        <ToasterWrapper />,
        <AppInner />,
      ]}
    />
  );
}

function AppInner() {
  const counterQuery = useQuery({
    queryKey: ["getCounter"],
    queryFn: () => mainServiceClient.getCounter(),
    onError: (e) => {
      toast.error("getCounter: " + String(e));
    },
  });

  const counterMutation = useMutation({
    mutationKey: ["changeCounter"],
    mutationFn: (delta: number) => mainServiceClient.changeCounter(delta),
    onError: (e) => {
      toast.error("changeCounter: " + String(e));
    },
  });

  React.useEffect(() => {
    // TODO: unsubscribe
    mainServiceEventEmitter.on(CHANGE_COUNTER, () => {
      counterQuery.refetch();
    });
  }, []);

  return (
    <div className="h-full bg-gray-50">
      <div className="h-full flex justify-center items-center p-2">
        <div className="w-sm max-w-full flex flex-col items-center gap-3 p-5 bg-white border">
          <div>Counter = {counterQuery.data ?? "..."}</div>
          <div className="flex w-full gap-1">
            <button
              className="flex-1 w-full bg-gray-600 hover:bg-gray-700 text-white border"
              disabled={counterQuery.isFetching || counterMutation.isLoading}
              onClick={() => counterMutation.mutate(-1)}
            >
              -1
            </button>
            <button
              className="flex-1 w-full bg-gray-600 hover:bg-gray-700 text-white border"
              disabled={counterQuery.isFetching || counterMutation.isLoading}
              onClick={() => counterMutation.mutate(+1)}
            >
              +1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
