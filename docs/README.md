csv でアップロードした住所録から年賀はがきの宛名面を作成するプラグインをつくった

こちらは [Figma 開発 Advent Calendar 2022](https://qiita.com/advent-calendar/2022/figma-development) 14 日目の記事です。

こんにちは！

自称オンラインお年賀デザイナーの putchom です。これまでに、[初詣オンライン](https://hatsumoude.online/)や[餅つきオンライン](https://mochituki.online/)といったお年賀ネタサービスを作ってきました。

ところで皆さん年賀状作ってますか？

私はめんどくさいのでもうかれこれ 10 年以上は自分の年賀状を作っていません。

しかしデザイナーなら誰しも年末年始帰省した際にこのような経験があるかもしれません...

母「あんたデザイナーでしょ。ちょっと年賀状作ってよ。」

私「もう 31 日なんだが...？」

年賀状作成専門の使い慣れないソフトを渡され、見慣れない UI を駆使しながら宛名印刷をして年を越したくはありません。

そこで使い慣れた最新式ハイパーデザインソフトウェア Figma のプラグインを使って年賀状の宛名側のデータを作成してみたいと思います。

# 完成品

とりあえず完成品をインターネットに公開しました

# つくりかた

## 1. セットアップ

今回は 「Figma デザイン」のみで実行できるもので良さそうで、スターターキットの「UI とブラウザ API を使用」を選択して作成します。

![](https://user-images.githubusercontent.com/945841/205423971-372eb863-11a7-4ff9-b0e8-caaf7d9515b4.png)
![](https://user-images.githubusercontent.com/945841/205423978-6b2a7c2f-55c1-437d-a5e0-88150544be89.png)

Figma プラグインの詳しい作り始め方は他に以下のような良質な記事があるので端折ります。

- [Figma プラグインの作り方 - Zenn](https://zenn.dev/ixkaito/articles/how-to-make-a-figma-plugin)

## 2.　年賀はがきサイズの Frame を作成する

サンプルのプラグインを実行するとオレンジの Rectangle を指定した数作成するプラグインが立ち上がります。

![]()

まずはこれを改造して「指定した数の年賀はがきサイズの Frame を作成する」ようにします。

```html
<!-- ui.html -->
<h2>年賀はがき宛名ジェネレーター</h2>
<p>Count: <input id="count" value="5" /></p>
<button id="create">作成</button>
<script>
  document.getElementById("create").onclick = () => {
    const textbox = document.getElementById("count");
    const count = parseInt(textbox.value, 10);
    parent.postMessage({ pluginMessage: { type: "create", count } }, "*");
  };
</script>
```

```ts
// code.ts
figma.showUI(__html__);

figma.ui.onmessage = (msg) => {
  if (msg.type === "create") {
    const nodes: SceneNode[] = [];
    for (let i = 0; i < msg.count; i++) {
      const frameWidth = 1181;
      const frameHeight = 1148;
      const frame = figma.createFrame();

      // 20pxずつ間隔を開けて配置する
      frame.x = i * (frameWidth + 20);

      // Frameを年賀はがきのサイズにリサイズする
      frame.resize(frameWidth, frameHeight);

      figma.currentPage.appendChild(frame);
      nodes.push(frame);
    }
  }
};
```

Rectangle を作成する`createRectangle`関数を`createFrame`関数に置き換えると、Frame を指定した数分作成できるようになります。

また、`frame.resize(width, height)` で年賀はがきのサイズにリサイズします。

※ 年賀はがきが 10cm x 14.8cm なので 300dpi で px に変換して 1181px x 1748px にしました。

- [参考: createFrame | Plugin API](https://www.figma.com/plugin-docs/api/properties/figma-createframe)

ひとまず、作成ボタンを押したら、年賀はがきサイズの Frame が指定した数並ぶようになりました。

![](https://user-images.githubusercontent.com/945841/205424253-aa0fb19b-aa08-4a17-bada-2c4b9204e954.png)

## 3. アップロードした CSV からテキストレイヤーを作る

次に UI に`<input type="file" />`を設置して csv をアップロードできるようにし、そのデータをそれぞれの Frame に入れ込みたいと思います。

今回は雑にこのような住所と名前が入った CSV を用意しました。（数字が半角だと後で折返しで問題が起こるので全角にしています。本当はどんなのが来ても変換するなどしたほうがいいのですが本筋からそ逸れるので一旦...）

```csv
送り先郵便番号,送り先住所,送り先氏名,差出人郵便番号,差出人住所,差出人氏名
1234567,東京都渋谷区渋谷１ー１ー１ 渋谷ビル１０１,渋谷　太郎,1111111,東京都港区港１ー１ー１ 港ビル１０１,港　太郎
1234567,東京都渋谷区渋谷１ー１ー１ 渋谷ビル１０１,渋谷　太郎,1111111,東京都港区港１ー１ー１ 港ビル１０１,港　太郎
1234567,東京都渋谷区渋谷１ー１ー１ 渋谷ビル１０１,渋谷　太郎,1111111,東京都港区港１ー１ー１ 港ビル１０１,港　太郎
1234567,東京都渋谷区渋谷１ー１ー１ 渋谷ビル１０１,渋谷　太郎,1111111,東京都港区港１ー１ー１ 港ビル１０１,港　太郎
1234567,東京都渋谷区渋谷１ー１ー１ 渋谷ビル１０１,渋谷　太郎,1111111,東京都港区港１ー１ー１ 港ビル１０１,港　太郎
```

まずは、UI スレッド側の処理です。UI スレッド側はユーザーの入力を受け付けたり、ブラウザ API を叩いたりする役割を担っています。

```html
<!-- ui.html -->
<h2>年賀はがき宛名ジェネレーター</h2>
<div>
  <label for="address">CSVファイルを選択</label>
  <input id="address" name="address" accept=".csv" type="file" />
</div>
<button id="create">作成</button>
<script>
  document.getElementById("create").onclick = () => {
    // CSVファイルを取得
    const CSVFile = document.getElementById("address").files[0];

    // Promise化したFileReader API
    const fileReaderPromise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.addEventListener("error", () => reject(fileReader.error));
      fileReader.addEventListener("load", () => {
        const { result } = fileReader;
        resolve(result);
      });

      fileReader.readAsText(CSVFile);
    });

    fileReaderPromise.then((CSVRaw) => {
      const endOfFirstLineIndex = CSVRaw.indexOf("\n");
      const rowsRaw = CSVRaw.slice(endOfFirstLineIndex + 1);
      const rowsNoCells = rowsRaw.split("\n");
      const rows = rowsNoCells.map((row) => row.split(","));

      parent.postMessage(
        { pluginMessage: { type: "create", rows: rows } },
        "*"
      );
    });
  };
</script>
```

最初に、`document.getElementById("address").files[0]`で CSV ファイルを取得します。

そして、不要な Header を CSV から取り除き、改行をもとに行の文字列を抽出します。

最後に、それらの行を句読点で分割した配列のデータを`postMessage`でサンドボックススレッド側へ送信します。

次にサンドボックススレッド側の処理です。サンドボックススレッド側は Figma のレイヤー操作などを行う役割を担っています。

```ts
// code.ts
figma.showUI(__html__);

figma.ui.onmessage = async (msg) => {
  // TextNodeのプロパティを変更するにはまずこの関数を呼び出す必要がある
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Zen Antique", style: "Regular" });

  // TextNodeを構築する関数
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

    // 郵便番号とそうでない場合で場合分け
    if (props.isPostalCode) {
      // 文字間を調整
      textNode.letterSpacing = {
        value: 55,
        unit: "PERCENT",
      };
      // フォントはデフォルト
      textNode.fontName = {
        family: "Inter",
        style: "Regular",
      };
    } else {
      // 縦書きにする必要がある
      textNode.lineHeight = {
        value: props.fontSize,
        unit: "PIXELS",
      };
      textNode.resize(props.fontSize, props.characters.length * props.fontSize);
      // フォントは明朝体にする
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
```

最初に、`onMessage`で UI スレッド側から、CSV から抽出した`rows`のデータを受け取ります。

そして、受け取ったデータを`composeTextNode`関数で TextNode に変換していきます。この際、郵便番号は文字間を調整し、それ以外は縦書きのスタイルを適用し、フォントを明朝体にします。

最後に、それらのテキストレイヤーを Frame に入れ込みます。

完成しました！

![](https://user-images.githubusercontent.com/945841/205484277-68e930d2-1425-4ad5-8789-083b7c7f3165.png)

![](https://user-images.githubusercontent.com/945841/205484648-e2b64741-5a6d-45da-9359-8c047e65b423.png)
_実際にはがきを当ててみたところ_

## まとめ

ここまで読んだ方はお気づきかもしれませんが、このプラグインはとりあえずシュッと作ったため以下のような点に対応できていません。

- 文字列が長くなった場合のフォントサイズ縮小や改行
- 連名
- 縦書きのスタイル（ハイフンが横向きのまま etc...）
- etc...

文字列が長くなった場合のフォントサイズ縮小や改行
、連名は頑張ればアップデートできそうですが、「縦書きのスタイル」に関しては、API から Text Node
の Vertical alternates の設定を触れないため、いまいま自動化の対応はできなそうです...

自分でプラグインを作ってみたことで、年賀状専門ソフトの偉大さを知りました。いつもありがとうございます！
