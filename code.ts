figma.showUI(__html__);

figma.ui.onmessage = async (msg) => {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Zen Antique", style: "Regular" });

  const composeTextNode = (props: {
    fontSize: number;
    characters: string;
    x: number;
    y: number;
    isPostalCode: boolean;
  }) => {
    const textNode = figma.createText();

    textNode.x = props.x;
    textNode.y = props.y;
    textNode.characters = props.characters;
    textNode.fontSize = props.fontSize;

    if (props.isPostalCode) {
      textNode.letterSpacing = {
        value: 55,
        unit: "PERCENT",
      };
      textNode.fontName = {
        family: "Inter",
        style: "Regular",
      };
    } else {
      textNode.lineHeight = {
        value: props.fontSize,
        unit: "PIXELS",
      };
      textNode.resize(props.fontSize, props.characters.length * props.fontSize);
      textNode.fontName = {
        family: "Zen Antique",
        style: "Regular",
      };
    }

    return textNode;
  };

  if (msg.type === "create") {
    for (let i = 0; i < msg.rows.length; i++) {
      const frameWidth = 1181;
      const frameHeight = 1748;

      const frame = figma.createFrame();
      frame.resize(frameWidth, frameHeight);
      frame.x = i * (frameWidth + 20);

      // 送り先郵便番号
      const destinationPostalCode = composeTextNode({
        fontSize: 72,
        characters: msg.rows[i][0],
        x: 540,
        y: 150,
        isPostalCode: true,
      });
      frame.appendChild(destinationPostalCode);

      // 送り先住所
      const destinationAddress = composeTextNode({
        fontSize: 56,
        characters: msg.rows[i][1],
        x: 1037,
        y: 300,
        isPostalCode: false,
      });
      frame.appendChild(destinationAddress);

      // 送り先氏名
      const destinationName = composeTextNode({
        fontSize: 128,
        characters: `${msg.rows[i][2]}　様`,
        x: 600,
        y: 400,
        isPostalCode: false,
      });
      frame.appendChild(destinationName);

      // 差出人郵便番号
      const returnPostalCode = composeTextNode({
        fontSize: 48,
        characters: msg.rows[i][3],
        x: 80,
        y: 1460,
        isPostalCode: true,
      });
      frame.appendChild(returnPostalCode);

      // 差出人住所
      const returnAddress = composeTextNode({
        fontSize: 32,
        characters: msg.rows[i][4],
        x: 360,
        y: 700,
        isPostalCode: false,
      });
      frame.appendChild(returnAddress);

      // 差出人氏名
      const returnName = composeTextNode({
        fontSize: 64,
        characters: msg.rows[i][5],
        x: 180,
        y: 920,
        isPostalCode: false,
      });
      frame.appendChild(returnName);

      figma.currentPage.appendChild(frame);
    }
  }
};
