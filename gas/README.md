# Picture Dictionary を Google Apps Script (GAS) でアプリ化する手順

このアプリは HTML 1ファイルで動くので、GAS のウェブアプリとしてそのまま公開できます。

## しくみ

- **HTML(アプリ本体)** → GAS が配信します
- **画像(約860枚)** → GAS は画像フォルダを置けないので、GitHub から自動で読み込みます
  - `index.html` は自分が GAS 上(`googleusercontent.com`)で動いていることを検知して、
    画像の読み込み先を `https://raw.githubusercontent.com/edupower07/PictureDictionary/main/images/` に自動で切り替えます
  - **このためリポジトリは public のままにしておいてください**(private にすると画像が表示されなくなります)

## 公開手順(5分でできます)

1. **新しいGASプロジェクトを作る**
   - https://script.new を開く(Googleアカウントでログインした状態で)
   - 左上の「無題のプロジェクト」をクリックして「Picture Dictionary」などに変更

2. **Code.gs を貼り付ける**
   - 最初から開いている「コード.gs」の中身を全部消して、この `gas/Code.gs` の中身を貼り付ける

3. **HTMLファイルを追加する**
   - 左のファイル一覧の「＋」→「HTML」をクリック
   - ファイル名を **`index`** にする(拡張子 `.html` は自動で付きます)
   - 中身を全部消して、リポジトリの **`index.html` の中身を丸ごと**貼り付ける

4. **ウェブアプリとしてデプロイする**
   - 右上「デプロイ」→「新しいデプロイ」
   - 「種類の選択」(⚙アイコン)→「ウェブアプリ」
   - 設定:
     - 説明: 好きなメモ(例: v1)
     - 次のユーザーとして実行: **自分**
     - アクセスできるユーザー: **全員**(児童がログインなしで使えるように)
   - 「デプロイ」→ アクセス承認を求められたら許可する

5. **URLを配る**
   - 表示された「ウェブアプリのURL」(`https://script.google.com/macros/s/...../exec`)を児童に配布
   - QRコードにして黒板に貼ると簡単です

## アプリを更新するとき

1. GASエディタで `index` の中身を新しい `index.html` の中身に貼り替える
2. 「デプロイ」→「デプロイを管理」→ ✏(編集)→ バージョン:「**新バージョン**」→「デプロイ」

※「新しいデプロイ」を作るとURLが変わってしまうので、**必ず「デプロイを管理」から更新**してください(URLがそのまま使えます)。

## Google Workspace for Education の学校で使う場合

- 「アクセスできるユーザー: 全員」が組織のポリシーで選べない場合は、
  「(組織名)内の全員」を選べば、学校アカウントでログインした児童だけが使えます
- Google サイトに埋め込むこともできます(`Code.gs` で埋め込みを許可済み)

## 知っておくこと(制限)

| 機能 | GAS上での動作 |
|---|---|
| 音声読み上げ(🔊 / 🐢) | ✅ 動きます(端末の音声合成を使用) |
| My Word Bank・ランキングの保存 | ✅ 動きます(ブラウザ内に保存) |
| クイズ・かるた・神経衰弱・スペル・ビンゴ | ✅ 動きます |
| 🎤 ろくおん(Speaking Practice) | ⚠️ **動きません**。GASはアプリを iframe 内で配信するため、ブラウザの仕様でマイクが使えません |

マイク録音まで使いたい場合は、GitHub Pages での公開(リポジトリの Settings → Pages → Branch: main)のほうが向いています。GitHub Pages なら全機能が動き、画像も同じリポジトリから配信されます。

## clasp を使う場合(コマンドラインに慣れている人向け)

```bash
npm install -g @google/clasp
clasp login
cd gas/
cp ../index.html index.html   # アプリ本体をコピー
clasp create --type webapp --title "Picture Dictionary"
clasp push
clasp deploy
```
