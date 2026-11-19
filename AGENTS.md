# 仓库协作规范

## 通用

- 每轮完成改动后，按所在模块的风格格式化本次修改的文件，并审查差异。
- 审查时重点检查功能回归、异常处理和配置是否一致。将启动步骤或默认配置的变化同步到 README。
- 运行本次改动涉及的构建或测试，在交付时说明验证结果。

## 前端

- 前端位于 `frontend/`，使用 Vue 3 和 Naive UI。
- 每个 Vue 组件在 `frontend/src/components/` 下使用独立目录。组件专属样式与组件放在一起，共用样式放在 `frontend/src/styles/`。
- 组件负责渲染和交互。表格数据与公式逻辑放在 `frontend/src/spreadsheet/`，浏览器持久化和同步逻辑放在 `frontend/src/storage/`。
- 在 `frontend/` 中运行 `npm run build`。界面或交互有改动时，在浏览器验证受影响的操作。

## 后端

- 后端位于 `crdtsever/`，使用 Spring Boot、Java 25 和 Maven Wrapper。HTTP 接口、业务逻辑和数据库访问按职责组织。
- 将后端运行配置放在 `crdtsever/src/main/resources/application.yml`，不同环境的连接参数和端口使用环境变量覆盖。真实密码放在环境变量中。
- 在 `crdtsever/` 中运行 `./mvnw verify`。数据源或端口有改动时，验证应用启动、端口和数据库连接。
