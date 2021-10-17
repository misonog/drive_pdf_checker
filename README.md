# Drive PDF Checker

引数として Google Drive のファイル URL を受け取り、そのファイルが PDF かどうかを判定するコマンドラインツールです。

## 利用するための前提条件

- [こちら](https://developers.google.com/drive/api/v3/quickstart/nodejs) を参照しながら、Google Cloud Platform で API が有効化されている
- [こちら](https://developers.google.com/workspace/guides/create-credentials) を参照しながら、Desktop application 向けの Credentials が作成されている
- Google Drive が利用できる Google Account が用意されている

### 参考サイト

[Node.js quickstart  |  Google Drive API  |  Google Developers](https://developers.google.com/drive/api/v3/quickstart/nodejs)

## Install

```shell
$ npm install -g drive_pdf_checker
```

## 利用方法

```shell
$ drive_pdf_checker drive_file_url
```

URL が PDF でない場合のみ、その旨が出力されます。
