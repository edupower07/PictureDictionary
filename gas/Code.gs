/**
 * Picture Dictionary - Google Apps Script ウェブアプリ
 *
 * index(HTMLファイル)を配信するだけのシンプルな構成です。
 * 画像はGitHub (raw.githubusercontent.com) から読み込まれます。
 * 詳しい手順は gas/README.md を見てください。
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Picture Dictionary')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    // Googleサイトなどに埋め込めるようにする
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
