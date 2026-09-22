// Isolation fixture for xmlui-org/xmlui#3830.
//
// Bare React + virtua, with NO xmlui imports of any kind. If this page emits
// "ResizeObserver loop completed with undelivered notifications" under the same
// scroll pattern that makes xmlui's List emit it, the defect is upstream in
// virtua. If it stays clean, the defect is xmlui's and the difference between
// this fixture and ListReact is the search space.
import React from "react";
import { createRoot } from "react-dom/client";
import { Virtualizer } from "virtua";

const COUNT = 300;
const items = Array.from({ length: COUNT }, (_, i) => ({
  id: `row-${i}`,
  name: `Item ${i}`,
}));

function App() {
  const scrollRef = React.useRef(null);
  return (
    <div id="scroller" ref={scrollRef}>
      <Virtualizer scrollRef={scrollRef}>
        {items.map((item) => (
          <div className="row" key={item.id} data-index={item.id}>
            {item.name}
          </div>
        ))}
      </Virtualizer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
