csv でアップロードした住所録から年賀はがきの宛名を作成するプラグインをつくった

こちらは [Figma 開発 Advent Calendar 2022](https://qiita.com/advent-calendar/2022/figma-development) 14 日目の記事です。

こんにちは！

自称オンラインお年賀デザイナーの putchom です。これまでに、[初詣オンライン](https://hatsumoude.online/)や[餅つきオンライン](https://mochituki.online/)といったお年賀ネタサービスを作ってきました。

ところで皆さん年賀状作ってますか？

私はめんどくさいのでもうかれこれ 10 年以上は自分の年賀状を作っていません。

しかしデザイナーなら誰しもこのような経験があるかもしれません。

年末実家に帰ると...

母「あんたデザイナーでしょ。ちょっと年賀状作ってよ。」

私「もう 31 日なんだが...？」

年賀状作成専門の使い慣れないソフトを渡され、見慣れない UI を駆使しながら宛名印刷をして年を越したくはありません。

そこで使い慣れた最新式ハイパーデザインソフトウェア Figma のプラグインを使って年賀状の宛名側のデータを作成してみたいと思います。

# 完成品

とりあえず完成品をインターネットに公開しました

# つくりかた

ざっくりこのプラグインの目的を達成するために、やらなければいけないこととしては、

- 住所録の csv をアップロードできるようにする
- 住所録のデータ数分の年賀状サイズの Frame を作成できるようにする
- csv を解析して 名前、住所などの Node を作成して Frame にぶち込む
- すべての Frame を Page にぶち込む

が考えられます。

これをやりやすいところからコツコツとやっていきたいと思います。

## 1. セットアップ

今回は 「Figma デザイン」のみで実行できるもので良さそうで、スターターキットの「UI とブラウザ API を使用」を選択して作成します。

<img width="1552" alt="スクリーンショット 2022-12-03 13 26 01" src="https://user-images.githubusercontent.com/945841/205423971-372eb863-11a7-4ff9-b0e8-caaf7d9515b4.png">
<img width="1552" alt="スクリーンショット 2022-12-03 13 26 06" src="https://user-images.githubusercontent.com/945841/205423978-6b2a7c2f-55c1-437d-a5e0-88150544be89.png">

※ Figma プラグインの詳しい作り始め方は他に良質な記事があると思うので端折ります。

## 2.　年賀状サイズの Frame を作成する

サンプルのプラグインを実行するとオレンジの Rectangle を指定した数作成するプラグインが立ち上がります。

まずはこれを改造して「指定した数の年賀状サイズの Frame を作成する」ようにします。

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

```js
// code.ts
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
```

Rectangle を作成する`createRectangle`関数を`createFrame`関数に置き換えると、Frame を指定した数分作成できるようになります。

また、`frame.resize(width, height)` で年賀はがきのサイズにリサイズします。

※ 年賀はがきが 10cm x 14.8cm なので 300dpi で px に変換して 1181px x 1748px にしました。

- [参考: createFrame | Plugin API](https://www.figma.com/plugin-docs/api/properties/figma-createframe)

ひとまず、作成ボタンを押したら、年賀サイズの Frame が指定した数並ぶようになりました。

<img width="1552" alt="スクリーンショット 2022-12-03 13 52 01" src="https://user-images.githubusercontent.com/945841/205424253-aa0fb19b-aa08-4a17-bada-2c4b9204e954.png">
