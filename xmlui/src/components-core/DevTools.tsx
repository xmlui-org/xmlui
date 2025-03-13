import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import type React from "react";
import { useState } from "react";
import { Rnd } from "react-rnd";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const DevTools = ({ isOpen = false, setIsOpen }: Props) => {
  const [size, setSize] = useState({ width: window.innerWidth, height: 300 });
  const [position, setPosition] = useState({ x: 0, y: window.innerHeight - size.height });

  return (
    <>
      {isOpen && (
        <Rnd
          size={size}
          onResizeStop={(e, direction, ref, delta, position) => {
            setSize({
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            });
            setPosition(position);
          }}
          onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
          position={position}
          bounds={"window"}
          style={{
            overflow: "scroll",
          }}
        >
          <ReactQueryDevtoolsPanel
            style={{ height: "100%", width: "100%" }}
            setIsOpen={setIsOpen}
            onDragStart={function (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
              throw new Error("Function not implemented.");
            }}
          />
        </Rnd>
      )}
    </>
  );
};
