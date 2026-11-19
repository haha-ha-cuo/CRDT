# CRDT 协作文档

当前版本是 Vue 3 和 Naive UI 构建的本地表格工作台。新建菜单提供 Excel 表格入口，并预留 Word 文档入口。

## 启动前端

需要支持 Vite 的 Node.js 版本，例如 Node.js 22.12 或 24 LTS。在仓库根目录运行以下命令，打开 [http://localhost:5173](http://localhost:5173)。

```sh
cd frontend
npm ci
npm run dev
```

运行 `npm run build` 可生成前端静态文件。工作台只需要浏览器。

## 表格

- 每份表格有一张 40 行、16 列的工作表。双击单元格、按 Enter，或使用公式栏即可编辑。
- 支持四则运算、单元格和区域引用，以及 `SUM`、`AVERAGE` 等常用公式。比如在 B1 输入 `=SUM(A1:A3)`。
- 可将制表符分隔的多行数据粘贴到网格。导出为 `.xlsx` 时会保留单元格内容和公式。
- 内容保存在当前浏览器的 IndexedDB。用同一浏览器打开两个相同地址的标签页，可以实时看到对方的修改。不同浏览器或设备各自使用独立的数据。
