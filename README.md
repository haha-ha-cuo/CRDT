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

## 启动后端

后端需要 JDK 25 和本机 MySQL。默认连接 `127.0.0.1:3306/crdt`，用户名为 `root`，密码为空。在新的本地环境中可以先运行以下命令创建数据库。

```sh
mysql -h 127.0.0.1 -P 3306 -u root -e 'CREATE DATABASE IF NOT EXISTS crdt CHARACTER SET utf8mb4'
```

从仓库根目录启动 Spring Boot，默认 HTTP 端口为 `8080`。

```sh
cd crdtsever
./mvnw spring-boot:run
```

可用 `SERVER_PORT` 修改 HTTP 端口。可用 `SPRING_DATASOURCE_URL`、`SPRING_DATASOURCE_USERNAME` 和 `SPRING_DATASOURCE_PASSWORD` 修改数据库连接。如果使用仓库的 `compose.yaml`，数据源用户名填 `crdt`，数据源密码填 Compose 的 `DB_PASSWORD` 值；如果修改了 `MYSQL_PORT`，同步调整 JDBC 地址中的端口。
