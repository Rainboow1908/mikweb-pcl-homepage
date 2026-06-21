# MikWeb PCL 主页服务器

为 Mik Casual 服务器生成 PCL 启动器自定义主页。

## 快速开始

```bash
node server.js
```

然后在 PCL 中配置:
**设置 → 个性化 → 主页 → 联网更新的下载地址**

填入: `http://localhost:38080/pcl-homepage.xaml`

## 功能

- 实时显示服务器在线状态和玩家列表
- 显示最新的服务器公告
- 快捷入口：复制地址、打开官网/建筑/封禁/Wiki
- 支持一键刷新

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `38080` | 监听端口 |
| `API_BASE` | `https://mik.noctiro.moe/api` | MikWeb API 地址 |
| `SERVER_ADDR` | `mik.noctiro.moe` | 显示的服务器地址 |

## 自定义

你可以修改 `server.js` 中的 XAML 模板来调整布局和样式。
PCL 主页使用自定义 XAML 格式，支持 `local:MyButton`、`local:MyCard`、`local:MyTextBlock` 等控件。

参考文档:
- [PCL Wiki - 替换标记](https://github.com/Meloong-Git/PCL/wiki/%E6%9B%BF%E6%8D%A2%E6%A0%87%E8%AE%B0)
- [PCL Wiki - 自定义事件](https://github.com/Meloong-Git/PCL/wiki/%E8%87%AA%E5%AE%9A%E4%B9%89%E4%BA%8B%E4%BB%B6)
