# blog-builder

https://github.com/chikuwa111/blog にコンテンツをあげるためのプロジェクト

## モチベーション

- [Obsidian.md](https://obsidian.md/)でメモを書いている
- このコンテンツの中で公開できるものはサクッと公開したい
- 明示的に公開する意思を表明したコンテンツだけ公開できるシステムが欲しい

## 内容

- 今は frontmatter で`published: true`がついている markdown を指定された場所にコピペするだけ

## 使い方

- `$ npm i`
- `env.sample`を参考に`.env`を作成
- `$ ./build.sh`

## 展望

- Gatsby や Next.js を使ってもっとカスタマイズしたい
