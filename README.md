# にいがた仕事改善室

新潟県の建設・不動産会社向け「60秒・手作業コストチェック」の公開用サイトです。

## 構成

- 静的HTML/CSS/JavaScript
- Vercel Functions (`api/report.js`)
- Resendによる診断レポートメール送信
- 会社名・立場・課題を反映した業務改善可能性レポート
- データベース、ログイン機能なし

## 公開前の設定

### 1. 表示設定

`site.config.js`を編集します。

```js
window.SITE_CONFIG = {
  supportDeadline: "2027年1月31日",
  operatorName: "運営者名または屋号",
  privacyContact: "contact@example.jp"
};
```

### 事例の追加

`cases.data.js`に、掲載許可を確認できた事例だけを追加します。`published: true` の事例が「事例・AI活用例」ページに表示されます。

AI活用例は導入イメージとして明示し、実績とは分けて掲載しています。

### 2. Vercel環境変数

Vercel Project SettingsのEnvironment Variablesに設定します。

| 変数 | 内容 |
| --- | --- |
| `RESEND_API_KEY` | ResendのAPIキー |
| `REPORT_FROM_EMAIL` | 送信元。例：`にいがた仕事改善室 <report@example.jp>` |
| `OWNER_EMAIL` | 申込通知を受け取るメールアドレス（任意） |
| `SUPPORT_DEADLINE` | メールに表示する期限。例：`2027年1月31日` |

Resend側で送信元ドメインの認証が必要です。APIキーをGitへコミットしないでください。

## ローカル確認

静的画面だけ確認する場合：

```bash
python3 -m http.server 4173
```

メールAPIを含めて確認する場合はVercel CLIを使います。

```bash
npx vercel dev
```

## テスト

```bash
npm test
```

## GitとVercel

```bash
git init
git add .
git commit -m "Initial release"
git branch -M main
git remote add origin <GitリポジトリURL>
git push -u origin main
```

VercelでGitリポジトリをImportし、Framework Presetは `Other` のまま公開できます。Build CommandとOutput Directoryは空欄で構いません。

## 公開前チェック

- `site.config.js`の運営者名と連絡先を確認
- プライバシーポリシーの内容を運用実態に合わせて確認
- Resendの送信元ドメインを認証
- Vercelに環境変数を設定
- 自分のメールアドレスでレポート受信を確認
- スマートフォンで表示と入力を確認
