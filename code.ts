figma.showUI(__html__);

figma.ui.onmessage = (msg) => {
  if (msg.type === "create") {
    const nodes: SceneNode[] = [];
    for (let i = 0; i < msg.count; i++) {
      const frame = figma.createFrame();
      frame.x = i * 1221;
      frame.resize(1181, 1748);

      figma.currentPage.appendChild(frame);
      nodes.push(frame);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
};
