# blog-builder

https://github.com/chikuwa111/note にコンテンツをあげるためのプロジェクト

## モチベーション

- [Obsidian.md](https://obsidian.md/)でメモを書いている
- このコンテンツの中で公開できるものはサクッと公開したい
- 明示的に公開する意思を表明したコンテンツだけ公開できるシステムが欲しい

## 内容

src以下のプログラムを組み合わせてやりたいことを実現

- removeAll
  - フォルダの中身を空にする
- copyPublishedFiles
  - Front Matterで`published: true`がついているmarkdownファイルをコピペする
- updateWikilink
  - [foam-cli](https://github.com/foambubble/foam-cli)でWikilinkをMarkdownで有効なリンクに変換する
- addLastModifiedDateToFrontMatter
  - Front Matterに最終コミット日時を追加する
- addBacklinksToFrontMatter
  - Front Matterにバックリンクのリストを追加する

## 使い方

- `$ npm i`
- `.env.sample`を参考に`.env`を作成
- `$ ./build.sh`
